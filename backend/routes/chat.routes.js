import express from 'express'
import { streamChat } from '../service/chat.service.js'
const router = express.Router()

// WebSocket连接处理（全局wss，在server.js中挂载）
// 流式聊天接口
router.post('/chat/stream', streamChat)

// 服务状态检测接口
router.get('/service-status', async (req, res) => {
  const config = getConfig()
  // 实际应检测端口是否可连接，这里简化示例
  res.json({
    code: 200,
    data: { llama: config.port.llama ? true : false }
  })
})


export default router