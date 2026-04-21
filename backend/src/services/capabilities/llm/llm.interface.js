// services/capabilities/llm/llm.interface.js
export class LlmProvider {
  async generate(messages, options = {}) {
    throw new Error('请实现 generate 方法');
  }

  async *streamGenerate(messages, options = {}) {
    throw new Error('请实现 streamGenerate 方法');
  }

  async dispose() { }
}