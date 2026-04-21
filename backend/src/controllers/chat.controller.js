// src/controllers/chat.controller.js
import { generateStreamResponse } from '../services/chat.service.js';
import { contextManager } from '../services/chat/context/contextManager.js';
import ChatSessionRepository from '../models/repositories/ChatSessionRepository.js';
import ChatMessageRepository from '../models/repositories/ChatMessageRepository.js';

/**
 * 流式聊天主接口（你原来的核心功能，保留不动）
 */
export const streamChat = async (req, res) => {
  // 1. 设置 SSE 头信息
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    console.log('[ChatController] 请求处理开始...');

    const { characterId, message, history, userName, sessionId } = req.body;

    console.log('[ChatController] 获取参数成功...');

    // 使用 generateStreamResponse（你现有的服务层）
    const stream = generateStreamResponse({
      characterId,
      message,
      history,
      userName,
      sessionId   // 新增：支持传入 sessionId
    });

    // 遍历生成器并发送给前端
    for await (const chunk of stream) {
      const dataPacket = JSON.stringify({ 
        type: 'chunk', 
        text: chunk 
      });
      res.write(`data: ${dataPacket}\n\n`);
    }

    // 发送结束信号
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();

  } catch (error) {
    console.error('[ChatController] 请求处理错误:', error);
    
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
      res.end();
    }
  }
};

/**
 * 创建新会话（可选）
 */
export const createChatSession = async (req, res) => {
  try {
    const { characterId, userId = 0, title = '新对话' } = req.body;
    const session = await contextManager.getOrCreateSession(characterId, userId);
    
    res.json({ 
      success: true, 
      data: session 
    });
  } catch (error) {
    console.error('[ChatController] 创建会话失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 获取某个角色的所有聊天会话列表
 */
export const getChatSessionsByCharacter = async (req, res) => {
  try {
    const { characterId } = req.query;

    if (!characterId) {
      return res.status(400).json({ success: false, message: "缺少 characterId 参数" });
    }

    const sessions = await ChatSessionRepository.findByCharacterId(characterId);

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('[ChatController] 获取会话列表失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 获取某次会话的具体消息记录
 */
export const getSessionMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: "缺少 sessionId 参数" });
    }

    const messages = await ChatMessageRepository.findBySessionId(sessionId);

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('[ChatController] 获取消息记录失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 清空某个会话的所有消息（可选）
 */
export const clearSessionMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    await ChatMessageRepository.deleteBySessionId(sessionId);

    res.json({
      success: true,
      message: `会话 ${sessionId} 的消息已清空`
    });
  } catch (error) {
    console.error('[ChatController] 清空消息失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  streamChat,
  createChatSession,
  getChatSessionsByCharacter,
  getSessionMessages,
  clearSessionMessages
};