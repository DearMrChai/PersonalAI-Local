// src/services/chat/contextManager.js
import ChatSessionRepository from '../../../models/repositories/ChatSessionRepository.js';
import ChatMessageRepository from '../../../models/repositories/ChatMessageRepository.js';
import CharacterRepository from '../../../models/repositories/CharacterRepository.js';
import { promptBuilder } from '../prompt/promptBuilder.js';

/**
 * ContextManager - 对话上下文管理器
 * 主要职责：
 *   1. 管理聊天会话（创建、获取）
 *   2. 保存和读取聊天消息
 *   3. 把角色卡 + 历史消息组合成给模型的完整输入
 *   4. 为未来压缩、长短期记忆、总结等功能提供扩展点
 */
class ContextManager {

  /**
   * 创建一个新的聊天会话
   */
  async createSession(characterId, userId = 0, title = '新对话') {
    const session = await ChatSessionRepository.create(characterId, userId, title);
    console.log(`[ContextManager] 创建新会话成功，sessionId: ${session.id}`);
    return session;
  }

  /**
   * 获取或创建会话（推荐使用）
   */
  async getOrCreateSession(characterId, userId = 0) {
    let sessions = await ChatSessionRepository.findByCharacterId(characterId);
    
    if (sessions && sessions.length > 0) {
      return sessions[0]; // 返回最新的会话
    }

    // 没有会话时自动创建
    return await this.createSession(characterId, userId, `与 ${await this.getCharacterName(characterId)} 的对话`);
  }

  /**
   * 保存一条消息
   */
  async saveMessage(sessionId, role, content) {
    if (!content || content.trim() === '') return null;
    
    const message = await ChatMessageRepository.create(sessionId, role, content.trim());
    console.log(`[ContextManager] 保存消息成功: ${role} -> ${content.substring(0, 50)}...`);
    return message;
  }

  /**
   * 获取某个会话的最近 N 条消息
   */
  async getRecentMessages(sessionId, limit = 20) {
    return await ChatMessageRepository.findBySessionId(sessionId, limit); // 注意：你需要确保 Repository 有这个方法
  }

  /**
   * 构建给模型的完整上下文（最核心方法）
   */
  async buildContext(characterId, sessionId, currentUserMessage, options = {}) {
    const { enableCompression = false, maxTokensThreshold = 3000 } = options;

    // 1. 获取角色完整信息
    const character = await CharacterRepository.findByIdWithTags(characterId);
    if (!character) throw new Error(`角色 ${characterId} 不存在`);

    // 2. 获取历史消息
    let historyMessages = await this.getRecentMessages(sessionId, 30);

    // === 压缩逻辑（你之前想要保留的伪代码框架）===
    if (enableCompression && historyMessages.length > 8) {
      console.log(`[ContextManager] 检测到历史消息较多 (${historyMessages.length}条)，准备压缩...`);

      const compressedHistory = await this.compressHistoryIfNeeded(historyMessages, maxTokensThreshold);

      if (compressedHistory) {
        historyMessages = compressedHistory;
        console.log(`[ContextManager] 压缩后剩余消息: ${historyMessages.length}条`);
      }
    }

    // 3. 构建 System Prompt
    const systemPrompt = promptBuilder.buildSystemPrompt(character);

    // 4. 构造最终 messages 数组
    const messages = [{ role: 'system', content: systemPrompt }];

    historyMessages.forEach(msg => {
      messages.push({ role: msg.role, content: msg.content });
    });

    if (currentUserMessage) {
      messages.push({ role: 'user', content: currentUserMessage });
    }

    return {
      messages,
      character,
      sessionId,
      originalMessageCount: historyMessages.length
    };
  }

  /**
   * ==================== 压缩逻辑核心方法（伪代码框架）====================
   * 这里是你未来实现压缩逻辑的地方
   */
  async compressHistoryIfNeeded(historyMessages, maxTokensThreshold) {
    // TODO: 实现真正的压缩逻辑（可以调用轻量模型总结）

    const recentCount = 6; // 始终保留最近 6 条对话（3轮）

    if (historyMessages.length <= recentCount + 4) {
      return null; // 不需要压缩
    }

    console.log('[ContextManager] 执行历史消息压缩...');

    const oldMessages = historyMessages.slice(0, -recentCount);
    const recentMessages = historyMessages.slice(-recentCount);

    // 调用总结函数（目前是伪代码）
    const summary = await this.generateHistorySummary(oldMessages);

    // 构造压缩后的历史
    const compressed = [
      { 
        role: 'system', 
        content: `【历史对话总结】${summary}` 
      },
      ...recentMessages
    ];

    return compressed;
  }

  /**
   * 生成历史对话总结（伪代码）
   * 未来可以换成调用另一个轻量模型来做总结
   */
  async generateHistorySummary(oldMessages) {
    // TODO: 实现真正的总结逻辑
    const summaryText = oldMessages.slice(0, 6)
      .map(msg => `${msg.role === 'user' ? '用户' : '角色'}: ${msg.content}`)
      .join('\n');

    return `早期对话概要：${summaryText.substring(0, 300)}...`;
  }

  /**
   * 小工具：获取角色名称
   */
  async getCharacterName(characterId) {
    const character = await CharacterRepository.findById(characterId);
    return character ? character.name : '未知角色';
  }

  /**
   * 清空某个会话的所有消息
   */
  async clearSessionMessages(sessionId) {
    await ChatMessageRepository.deleteBySessionId(sessionId);
    console.log(`[ContextManager] 已清空会话 ${sessionId} 的所有消息`);
  }
}

// 导出单例
export const contextManager = new ContextManager();