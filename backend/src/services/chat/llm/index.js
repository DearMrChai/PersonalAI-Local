// services/chat/llm/index.js
import { LlamaProvider } from './providers/llama-provider.js';
import { QwenProvider } from './providers/qwen-provider.js';

let currentProvider = null;

/**
 * 获取当前 LLM Provider（单例）
 */
export async function getLlmProvider() {
  console.log('getLlmProvider');
  if (!currentProvider) {
    // currentProvider = new QwenProvider();
    currentProvider = new LlamaProvider();
  }
  return currentProvider;
}

/**
 * 切换模型（后续扩展用）
 */
export function setLlmProvider(provider) {
  currentProvider = provider;
}