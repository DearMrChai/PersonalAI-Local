// services/chat/llm/providers/qwen-provider.js
import { console } from 'inspector';
import { LlmProvider } from '../llm.interface.js';
import { getLlama, LlamaChatSession } from 'node-llama-cpp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class QwenProvider extends LlmProvider {
  constructor() {
    super();
    this.model = null;
    this.context = null;
  }

  async init() {
    if (this.model) return;

    const llama = await getLlama();
    this.model = await llama.loadModel({
      modelPath: path.join(__dirname, "../../../models/Qwen2.5-14B_Uncensored_Instruct-Q4_K_M.gguf"),
      contextSize: 8192,
      threads: 8,
      gpuLayers: 18,
    });
  }

  async *streamGenerate(messages, options = {}) {
    try {
      await this.init();

      const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
      const history = messages.filter(m => m.role !== 'system');

      // 建议：适当增加 maxTokens，避免过早截断
      const maxTokens = options.maxTokens ?? 1024; 

      const context = await this.model.createContext({
        temperature: options.temperature ?? 0.72,
        maxTokens: maxTokens, 
        repeatPenalty: 1.13,
        topP: 0.9,
        topK: 40,
        stop: [], 
      });

      const session = new LlamaChatSession({
        contextSequence: context.getSequence(),
        systemPrompt: systemPrompt,
      });

      // 回填历史
      for (const msg of history) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          await session.prompt(msg.content, { temperature: 0.0 }).catch(e => console.warn(e));
        }
      }

      const lastUserMsg = history.filter(m => m.role === 'user').pop()?.content || "你好～";

      // --- 桥接开始 ---
      const chunks = [];
      let finished = false;
      let error = null;
      let notify = null;

      // 定义一个函数来标记结束，确保只执行一次
      const markFinished = (err = null) => {
        if (finished) return;
        finished = true;
        if (err) error = err;
        console.log('[LlamaProvider] markFinished called', err ? 'with error' : 'successfully');
        if (notify) {
          notify();
          notify = null;
        }
      };

      const sessionPromise = session.prompt(lastUserMsg, {
        temperature: options.temperature ?? 0.72,
        maxTokens: maxTokens,
        repeatPenalty: 1.13,
        topP: 0.9,
        topK: 40,
        onTextChunk: (chunk) => {
          console.log('[LlamaProvider] onTextChunk callback triggered', chunk);
          chunks.push(chunk);
          if (notify) {
            notify();
            notify = null;
          }
        },
        onEnd: () => {
          console.log('[LlamaProvider] onEnd callback triggered');
          markFinished();
        },
        onError: (err) => {
          console.error('[LlamaProvider] onError callback triggered', err);
          markFinished(err);
        }
      });

      // 【关键修改】启动一个后台任务，当 sessionPromise 完成时，强制标记结束
      // 这解决了 onEnd 回调不触发的 bug
      sessionPromise.then(() => {
        console.log('[LlamaProvider] sessionPromise resolved, forcing finish');
        markFinished();
      }).catch((err) => {
        console.error('[LlamaProvider] sessionPromise rejected', err);
        markFinished(err);
      });

      // 消费循环
      while (!finished) {
        if (chunks.length > 0) {
          yield chunks.shift();
        } else {
          // 等待新数据或结束
          await new Promise((resolve) => {
            notify = resolve;
          });
          
          // 检查是否有错误发生
          if (error) {
            throw error;
          }
        }
      }

      // 输出剩余数据
      while (chunks.length > 0) {
        yield chunks.shift();
      }

      // 再次 await 确保资源释放（虽然上面已经通过 then/catch 处理了逻辑结束）
      await sessionPromise;
      
      console.log('[LlamaProvider] Stream generation fully completed');

    } catch (error) {
      console.error('❌ [LlamaProvider] 生成错误:', error.message);
      throw error;
    }
  }

  async dispose() {
    // 可选：清理资源
  }
}