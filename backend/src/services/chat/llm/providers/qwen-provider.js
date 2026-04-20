import { LlmProvider } from '../llm.interface.js';
import { getLlama } from 'node-llama-cpp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class QwenProvider extends LlmProvider {
  constructor() {
    super();
    this.llama = null;
    this.model = null;
  }

  async init() {
    if (this.model) return;
    try {
      console.log('⏳ [QwenProvider] 正在加载 qwen2.5-7b 模型...');
      this.llama = await getLlama();
      this.model = await this.llama.loadModel({
        modelPath: path.join(__dirname, "../../../../../models/qwen2.5-7b-instruct-uncensored-q4_k_m.gguf"),
        contextSize: 8192, // 稳定起见，先设小一点
        threads: 6,
        gpuLayers: 20,
      });
      console.log('✅ [QwenProvider] 模型加载成功');
    } catch (error) {
      console.error('❌ [QwenProvider] 模型加载失败:', error.message);
      throw error;
    }
  }

  /**
   * 构建 Qwen 原生 Prompt
   */
  buildQwenPrompt(messages) {
    let prompt = "";
    const systemMsg = messages.find(m => m.role === 'system');
    if (systemMsg) {
      prompt += `<|im_start|>system\n${systemMsg.content}<|im_end|>\n`;
    }

    const history = messages.filter(m => m.role !== 'system');
    for (const msg of history) {
      const role = msg.role === 'user' ? 'user' : 'assistant';
      prompt += `<|im_start|>${role}\n${msg.content}<|im_end|>\n`;
    }
    
    // 关键：添加助手开头，引导模型生成
    prompt += `<|im_start|>assistant\n`;
    return prompt;
  }

  async *streamGenerate(messages, options = {}) {
    try {
      await this.init();

      // 1. 构建 Prompt
      const fullPrompt = this.buildQwenPrompt(messages);
      
      // 2. Tokenize
      const tokens = this.model.tokenize(fullPrompt);
      
      // 3. 创建 Context
      const maxTokens = options.maxTokens ?? 2048;
      const context = await this.model.createContext({
        temperature: options.temperature ?? 0.72,
        maxTokens: maxTokens,
        repeatPenalty: 1.13,
        topP: 0.9,
        topK: 40,
      });

      // 4. 预填充 Prompt (Evaluate)
      // 注意：如果你的版本报错 evaluate 不存在，请尝试 context.process(tokens) 或查看文档
      // 但在 v3 中，通常是 evaluate
      await context.evaluate(tokens);

      let finished = false;
      let tokenCount = 0;
      
      // Qwen2.5 的 EOS Token ID 通常是 151643 (<|im_end|>)
      // 也可以从 model.tokenizer.eosTokenId 获取，但有时不准，硬编码更稳妥
      const eosTokenId = 151643; 

      // 5. 流式生成循环
      while (!finished && tokenCount < maxTokens) {
        // 采样下一个 token
        const nextToken = await context.sample({
          temperature: options.temperature ?? 0.72,
          topK: 40,
          topP: 0.9,
          repeatPenalty: 1.13,
        });

        // 检查是否结束
        if (nextToken === eosTokenId || nextToken === this.model.tokenizer.eosTokenId) {
          finished = true;
          break;
        }

        // 解码 token 为文本
        const chunk = this.model.detokenize([nextToken]);
        
        // 产出流数据
        yield chunk;
        tokenCount++;

        // 将生成的 token 加入上下文，以便生成下一个
        await context.evaluate([nextToken]);
      }

      console.log('[QwenProvider] 生成结束');

    } catch (error) {
      console.error('❌ [QwenProvider] 生成错误:', error.message);
      // 如果报错说 evaluate 不存在，打印出 context 的所有方法供调试
      if (error.message.includes('evaluate')) {
        console.log('[Debug] Context methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(context)));
      }
      throw error;
    }
  }

  async dispose() {
    this.model = null;
  }
}