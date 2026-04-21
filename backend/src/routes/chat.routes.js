// src/routes/chat.routes.js
import express from 'express';
const router = express.Router();

// 引入控制器
import chatController from '../controllers/chat.controller.js';

/**
 * 聊天相关路由
 */

// 1. 流式聊天主接口（你原来的核心功能）
router.post('/stream', chatController.streamChat);

// 2. 会话管理接口
router.post('/sessions', chatController.createChatSession);                    // 创建新会话
router.get('/sessions', chatController.getChatSessionsByCharacter);           // 获取某个角色的所有会话列表
router.get('/sessions/:sessionId/messages', chatController.getSessionMessages); // 获取某次会话的具体消息记录
router.delete('/sessions/:sessionId/messages', chatController.clearSessionMessages); // 清空某次会话的消息

export default router;