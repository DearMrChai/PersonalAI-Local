// backend/src/controllers/chat.controller.js	
import { generateStreamResponse, testConnection, getChatRecords, deleteChatRecord,clearChatRecords} from '../services/chat.service.js';
import createResponse from '../utils/responseUtil.js';

/**
 * 流式聊天接口
 * @route POST /chat/stream
 */
export async function handleStreamChat(req, res) {
  try {
    // 解析参数
    const { characterId, message, sessionId, userName = '用户' } = req.body;
    
    // 参数校验
    if (!characterId || !message) {
      return res.json(error('角色ID和消息内容不能为空'));
    }

    // 设置SSE响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // 流式生成响应
    const stream = generateStreamResponse({
      characterId,
      message,
      sessionId,
      userName
    });

    // 发送流式数据
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    }

    // 发送结束标志
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

  } catch (err) {
    console.error('[ChatController] 聊天处理失败:', err.message);
    
    if (!res.headersSent) {
      return res.json(error(err.message || '聊天处理失败'));
    }
    
    res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
}

/**
 * 测试AI服务连接状态
 * @route GET /chat/test
 */
export async function handleTestConnection(req, res) {
  try {
    const status = await testConnection();
    res.json(createResponse.success(status));
  } catch (err) {
    console.error('[ChatController] 连接测试失败:', err.message);
    res.json(createResponse.error(err.message));
  }
}

/**
 * 获取聊天记录
 * @route GET /chat/records/:sessionId
 */
export async function handleGetChatRecords(req, res) {
  try {
    const { sessionId } = req.params;
    const { limit = 50 } = req.query;
    
    if (!sessionId) {
      return res.json(createResponse.error('sessionId不能为空'));
    }
    
    const records = await getChatRecords(sessionId, parseInt(limit));
    res.json(createResponse.success(records));
    
  } catch (err) {
    console.error('[ChatController] 获取聊天记录失败:', err.message);
    res.json(createResponse.error(err.message));
  }
}

/**
 * 删除单条聊天记录
 * @route DELETE /chat/record/:messageId
 */
export async function handleDeleteChatRecord(req, res) {
  try {
    const { messageId } = req.params;
    
    if (!messageId) {
      return res.json(error('messageId不能为空'));
    }
    
    await deleteChatRecord(messageId);
    res.json(createResponse.success(null, '删除成功'));
    
  } catch (err) {
    console.error('[ChatController] 删除聊天记录失败:', err.message);
    res.json(createResponse.error(err.message));
  }
}

/**
 * 清空会话的所有聊天记录
 * @route DELETE /chat/records/:sessionId
 */
export async function handleClearChatRecords(req, res) {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.json(error('sessionId不能为空'));
    }
    
    await clearChatRecords(sessionId);
    res.json(createResponse.success(null, '清空成功'));
    
  } catch (err) {
    console.error('[ChatController] 清空聊天记录失败:', err.message);
    res.json(createResponse.error(err.message));
  }
}