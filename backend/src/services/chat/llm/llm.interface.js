// services/chat/llm/llm.interface.js

/**
 * LLM 提供者统一接口
 * 所有模型实现都必须继承这个类
 */
export class LlmProvider {
  /**
   * 流式生成回复
   * @param {Array} messages - 完整消息列表 [{role: 'system'|'user'|'assistant', content: string}]
   * @param {Object} options - 可选参数
   * @returns {AsyncGenerator<string>} 逐块返回文本
   */
  async *streamGenerate(messages, options = {}) {
    throw new Error('子类必须实现 streamGenerate 方法');
  }

  /**
   * 一次性生成完整回复（可选）
   */
  async generate(messages, options = {}) {
    let fullResponse = '';
    for await (const chunk of this.streamGenerate(messages, options)) {
      fullResponse += chunk;
    }
    return fullResponse;
  }

  /**
   * 释放资源（可选）
   */
  async dispose() {}
}