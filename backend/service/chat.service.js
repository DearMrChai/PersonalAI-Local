import fetch from 'node-fetch'
import { getConfig } from './config.service.js'

export const streamChat = async (req, res) => {
  try {
    const config = getConfig()
    const llamaUrl = `http://localhost:${config.port.llama}/v1/completions`

    // SSE 标准响应头
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')

    // 请求 llama
    const resp = await fetch(llamaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: req.body.prompt,
        max_tokens: config.llama.maxTokens,
        temperature: config.llama.temperature,
        stream: true,
        stop: ["<|end_of_text|>", "用户", "你：", "【", "】"]
      })
    })

    if (!resp.ok) {
      throw new Error(`Llama 返回错误 ${resp.status}`)
    }

    // ✅ 关键：用 pipe 通用流式转发，所有 node-fetch 版本都支持
    resp.body.pipe(res)

    // 客户端断开时停止
    req.on('close', () => {
      resp.body.destroy()
      res.end()
    })

  } catch (e) {
    console.error('代理错误：', e)
    res.end()
  }
}