// services/chat/llm/providers/qwen-provider.js
import { LlmProvider } from '../llm.interface.js';
import { getLlama, LlamaChatSession } from 'node-llama-cpp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class QwenProvider extends LlmProvider {
  constructor() {
    super();
    this.llama = null;   // getLlama() 返回的底层实例
    this.model = null;   // 加载后的实际模型实例
  }

  /**
   * 初始化模型
   * 注意：这个操作比较耗时，只应该在第一次使用时执行一次
   */
  async init() {
    if (this.model) return; // 避免重复加载

    try {
      console.log('⏳ [QwenProvider] 正在加载模型... 这可能需要一点时间');

      this.llama = await getLlama();

      this.model = await this.llama.loadModel({
        modelPath: path.join(__dirname, "../../../../../models/Qwen2.5-14B_Uncensored_Instruct-Q4_K_M.gguf"),
        contextSize: 4096,      // 重要：你的显卡只有4GB，建议不要超过4096
        threads: 6,             // CPU线程数，建议不要超过物理核心数的一半
        gpuLayers: 10,          // GPU卸载层数，4GB显卡建议10~14之间，太多容易OOM
        seed: 42,
      });

      console.log('✅ [QwenProvider] Qwen 模型加载成功 (v3.18.1)');
    } catch (error) {
      console.error('❌ [QwenProvider] 模型加载失败:', error.message);
      throw new Error(`模型加载失败: ${error.message}`);
    }
  }

  /**
   * 流式生成回复 - 适配 node-llama-cpp 3.18.1
   * @param {Array<Object>} messages - OpenAI格式的消息数组 [{role, content}, ...]
   * @param {Object} options - 生成参数
   */
  async *streamGenerate(messages, options = {}) {
    try {
      await this.init();

      const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
      const history = messages.filter(m => m.role !== 'system');

      console.log(`[QwenProvider] 开始生成，历史消息数量: ${history.length}`);

      // 创建 Context（推理上下文）
      const context = await this.model.createContext({
        temperature: options.temperature ?? 0.72,
        maxTokens: options.maxTokens ?? 512,
        repeatPenalty: 1.13,
        topP: 0.9,
        topK: 40,
        stop: ["<|im_end|>", "<|end_of_text|>"],
      });

      // === 关键修复：必须使用 context.getSequence() ===
      const session = new LlamaChatSession({
        contextSequence: context.getSequence(),   // ← 这是 3.18.1 正确写法
        systemPrompt: systemPrompt,
      });

      console.log('[QwenProvider] LlamaChatSession 创建成功');

      // 回填历史对话（让模型记住之前的上下文）
      for (const msg of history) {
        try {
          if (msg.role === 'user') {
            console.log('[QwenProvider] 回填用户消息:', msg.content);
            await session.prompt(msg.content, { temperature: 0.0 }); // 只喂历史，不生成
            console.log('[QwenProvider] 回填用户消息成功');
          } else if (msg.role === 'assistant') {
            console.log('[QwenProvider] 回填助手消息:', msg.content);
            await session.context.append("assistant", msg.content);
            console.log('[QwenProvider] 回填助手消息成功');
          }
          console.log('[QwenProvider] 当前上下文长度:', session.context.getSequence().length);  
        } catch (feedErr) {
          console.warn('[QwenProvider] 回填历史消息时出错（可忽略）:', feedErr.message);
        }
      }
      console.log('[QwenProvider] 回填历史消息完成');

      // 获取最后一条用户消息
      const lastUserMsg = history.filter(m => m.role === 'user').pop()?.content || "你好～";

      console.log('[QwenProvider] 开始流式生成回复...');

      // 流式输出
      for await (const chunk of session.prompt(lastUserMsg, {
        temperature: options.temperature ?? 0.72,
        maxTokens: options.maxTokens ?? 512,
        repeatPenalty: 1.13,
        topP: 0.9,
        topK: 40,
      })) {
        yield chunk;   // 逐块返回给调用者（用于流式前端）
      }

    } catch (error) {
      console.error('❌ [QwenProvider] streamGenerate 发生错误:', error.message);
      console.error('错误堆栈:', error.stack);
      
      // 友好错误提示
      if (error.message.includes('contextSequence')) {
        console.error('提示：contextSequence 错误通常是因为 context.getSequence() 调用失败或 GPU 层数设置过高');
      }
      
      throw error;   // 继续向上抛出，让上层能捕获
    }
  }

  /**
   * 释放模型资源，防止内存泄漏
   */
  async dispose() {
    try {
      if (this.model) {
        console.log('[QwenProvider] 正在释放模型资源...');
        await this.model.dispose?.();
        this.model = null;
      }
    } catch (err) {
      console.warn('[QwenProvider] 释放资源时出现警告:', err.message);
    }
  }
}