// backend/src/routes/chat.routes.js

import express from 'express'; 
import { handleStreamChat, handleTestConnection, handleGetChatRecords, handleDeleteChatRecord,handleClearChatRecords} from '../controllers/chat.controller.js';

const router = express.Router();

/**
 * @swagger
 * /chat/stream:
 *   post:
 *     summary: 流式聊天接口
 *     description: 与指定角色进行流式对话，支持实时返回AI响应（Server-Sent Events）
 *     tags:
 *       - Chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - characterId
 *               - message
 *             properties:
 *               characterId:
 *                 type: string
 *                 description: 角色唯一标识符
 *                 example: "chara_001"
 *               message:
 *                 type: string
 *                 description: 用户发送的消息内容
 *                 example: "你好呀，今天过得怎么样？"
 *               sessionId:
 *                 type: string
 *                 description: 会话ID，用于继续之前的对话（可选）
 *                 example: "sess_abc123"
 *               userName:
 *                 type: string
 *                 description: 用户名称（可选，默认"用户"）
 *                 example: "小明"
 *     responses:
 *       200:
 *         description: 流式响应（text/event-stream）
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 *                   description: SSE数据块
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/stream', handleStreamChat);

/**
 * @swagger
 * /chat/test:
 *   get:
 *     summary: 测试AI服务连接状态
 *     description: 检查本地AI模型服务是否正常运行
 *     tags:
 *       - Chat
 *     responses:
 *       200:
 *         description: 连接状态信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [healthy, unhealthy, error]
 *                       example: "healthy"
 *                     provider:
 *                       type: string
 *                       example: "LlamaProvider"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-15T10:30:00.000Z"
 */
router.get('/test', handleTestConnection);

/**
 * @swagger
 * /chat/records/{sessionId}:
 *   get:
 *     summary: 获取聊天记录
 *     description: 根据会话ID获取指定对话的历史消息列表
 *     tags:
 *       - Chat
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: 会话唯一标识符
 *         example: "sess_abc123"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: 返回的消息数量限制
 *         example: 20
 *     responses:
 *       200:
 *         description: 聊天记录列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: 消息ID
 *                       role:
 *                         type: string
 *                         enum: [user, assistant]
 *                         description: 消息角色
 *                       content:
 *                         type: string
 *                         description: 消息内容
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         description: 消息时间
 *       400:
 *         description: 参数错误
 *       500:
 *         description: 服务器内部错误
 */
router.get('/records/:sessionId', handleGetChatRecords);

/**
 * @swagger
 * /chat/record/{messageId}:
 *   delete:
 *     summary: 删除单条聊天记录
 *     description: 根据消息ID删除指定的聊天记录
 *     tags:
 *       - Chat
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: 消息唯一标识符
 *         example: "msg_xyz789"
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "删除成功"
 *       400:
 *         description: 参数错误
 *       500:
 *         description: 服务器内部错误
 */
router.delete('/record/:messageId', handleDeleteChatRecord);

/**
 * @swagger
 * /chat/records/{sessionId}:
 *   delete:
 *     summary: 清空会话的所有聊天记录
 *     description: 根据会话ID清空该会话的所有聊天历史（但保留会话）
 *     tags:
 *       - Chat
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: 会话唯一标识符
 *         example: "sess_abc123"
 *     responses:
 *       200:
 *         description: 清空成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "清空成功"
 *       400:
 *         description: 参数错误
 *       500:
 *         description: 服务器内部错误
 */
router.delete('/records/:sessionId', handleClearChatRecords);

export default router;