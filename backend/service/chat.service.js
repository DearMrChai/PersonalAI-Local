import fetch from 'node-fetch'
import { getConfig } from './config.service.js'

// 流式聊天（WebSocket回调）
export const streamChat = async (prompt, ws, abortController) => {
  const config = getConfig()
  const llamaUrl = `http://localhost:${config.port.llama}`
  // 调用llama.cpp流式接口
  const resp = await fetch(`${llamaUrl}/api/extra/generate/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: prompt,
      max_new_tokens: config.llama.maxTokens,
      temperature: config.llama.temperature,
      stop: ["\n", "用户", "你：", "【", "】"]
    }),
    signal: abortController.signal
  })

  const reader = resp.body.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter(Boolean)
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const j = JSON.parse(line.slice(5))
          if (j.token) {
            ws.send(JSON.stringify({ type: 'token', token: j.token }))
          }
        } catch (e) {}
      }
    }
  }
  ws.send(JSON.stringify({ type: 'done' }))
}