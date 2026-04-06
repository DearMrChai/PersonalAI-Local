import express from 'express'
import { streamChat } from '../service/chat.service.js'
const router = express.Router()

// WebSocket连接处理（全局wss，在server.js中挂载）
global.wss.on('connection', (ws) => {
  let abortController = null
  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data)
      // 打断生成
      if (msg.type === 'stop') {
        if (abortController) abortController.abort()
        ws.send(JSON.stringify({ type: 'stopped' }))
        return
      }
      // 聊天请求
      const { prompt } = msg
      abortController = new AbortController()
      await streamChat(prompt, ws, abortController)
    } catch (e) {
      ws.send(JSON.stringify({ type: 'done' }))
    }
  })
  // 关闭连接时打断
  ws.on('close', () => {
    if (abortController) abortController.abort()
  })
})

export default router