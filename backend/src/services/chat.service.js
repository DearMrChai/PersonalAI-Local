// backend/src/services/chat.service.js

import {contextManager} from './chat/context/contextManager.js';
import { getLlmProvider } from './chat/llm/index.js';

/**
 * 生成流式聊天响应
 * @param {Object} params - 参数对象
 * @param {string} params.characterId - 角色ID
 * @param {string} params.message - 用户消息
 * @param {string} [params.sessionId] - 会话ID（可选）
 * @param {string} [params.userName] - 用户名（默认'用户'）
 * @returns {AsyncGenerator<string>} 流式响应
 */
export async function* generateStreamResponse({ 
  characterId, 
  message, 
  sessionId = null, 
  userName = '用户' 
}) {
  // 参数校验
  if (!characterId || !message) {
    throw new Error('角色ID和消息内容不能为空');
  }

  console.log(`[ChatService] 开始处理聊天请求: 角色ID=${characterId}, sessionId=${sessionId || '新建会话'}`);

  try {
    // 1. 构建上下文（内部已包含保存用户消息的逻辑）
    const context = await contextManager.buildContext(
      characterId,
      sessionId,
      message
    );
    
    console.log(`[ChatService] 上下文构建完成: sessionId=${context.session.id}, 历史消息数=${context.messages?.length || 0}`);

    // 2. 获取LLM实例
    const llm = await getLlmProvider();

    // 3. 准备生成选项
    const options = {
      temperature: 0.75,
      maxTokens: 1024,
    };

    // 4. 流式生成
    let fullResponse = '';
    for await (const chunk of llm.streamGenerate(context.messages, options)) {
      fullResponse += chunk;
      yield chunk; // 流式返回给前端
    }

    console.log(`[ChatService] AI响应完成，长度: ${fullResponse.length}`);
    
    // 5. 保存AI回复（contextManager.buildContext 内部会自动保存用户消息，这里只需要保存AI回复）
    try {
      await contextManager.saveAssistantMessage(context.session.id, fullResponse);
      console.log(`[ChatService] AI回复已保存，sessionId: ${context.session.id}`);
    } catch (saveError) {
      console.error('[ChatService] 保存AI回复失败:', saveError.message);
      // 不抛出，避免影响前端接收响应
    }

  } catch (error) {
    console.error('[ChatService] 聊天处理失败:', error.message);
    throw error;
  }
}

/**
 * 获取聊天记录
 * @param {string} sessionId - 会话ID
 * @param {number} limit - 返回条数限制（默认50）
 * @returns {Promise<Array>} 消息列表
 */
export async function getChatRecords(sessionId, limit = 50) {
  console.log(`[ChatService] 获取聊天记录: sessionId=${sessionId}, limit=${limit}`);
  
  if (!sessionId) {
    throw new Error('sessionId不能为空');
  }
  
  return await contextManager.getHistory(sessionId, limit);
}

/**
 * 删除单条聊天记录
 * @param {string} messageId - 消息ID
 * @returns {Promise<void>}
 */
export async function deleteChatRecord(messageId) {
  console.log(`[ChatService] 删除聊天记录: messageId=${messageId}`);
  
  if (!messageId) {
    throw new Error('messageId不能为空');
  }
  
  await contextManager.deleteMessage(messageId);
}

/**
 * 清空会话的所有聊天记录
 * @param {string} sessionId - 会话ID
 * @returns {Promise<void>}
 */
export async function clearChatRecords(sessionId) {
  console.log(`[ChatService] 清空聊天记录: sessionId=${sessionId}`);
  
  if (!sessionId) {
    throw new Error('sessionId不能为空');
  }
  
  await contextManager.clearSession(sessionId);
}

/**
 * 测试AI服务连接状态
 * @returns {Promise<Object>} 连接状态
 */
export async function testConnection() {
  try {
    const llm = await getLlmProvider();
    const isAlive = await llm.healthCheck();
    return {
      status: isAlive ? 'healthy' : 'unhealthy',
      provider: llm.constructor.name,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      timestamp: new Date().totoISOString()
    };
  }
}