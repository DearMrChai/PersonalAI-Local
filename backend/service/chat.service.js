import fetch from 'node-fetch'
import { getConfig } from './config.service.js'
import { saveChatRecord } from './chatRecord.service.js'

// 过滤多余换行（核心解决换行越来越多）
const cleanText = (text) => {
  if (!text) return ''
  return text.replace(/\n+/g, ' ').trim()
}

export const streamChat = async (req, res) => {
  try {
    const config = getConfig()
    const llamaUrl = `http://localhost:${config.port.llama}/v1/completions`

    // SSE 流式头
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')
    res.setHeader('Access-Control-Allow-Origin', '*')

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
      throw new Error(`Llama错误 ${resp.status}`)
    }

    // -----------------------
    // 兼容 node-fetch@2 流
    // -----------------------
    let buffer = ''

    resp.body.on('data', (chunk) => {
      buffer += chunk.toString('utf8')
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue

        const dataStr = line.substring(6)
        if (dataStr === '[DONE]') {
          res.write(`data: [DONE]\n\n`)
          continue
        }

        try {
          const data = JSON.parse(dataStr)
          if (data.choices?.[0]) {
            // 过滤换行！
            data.choices[0].text = cleanText(data.choices[0].text)

            // 只转发有内容的片段 → 前端逐字输出
            if (data.choices[0].text || data.choices[0].finish_reason) {
              res.write(`data: ${JSON.stringify(data)}\n\n`)
            }
          }
        } catch (e) {}
      }
    })

    resp.body.on('end', () => {
      res.write(`data: [DONE]\n\n`)
      res.end()
    })

    resp.body.on('error', (err) => {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
      res.end()
    })

    req.on('close', () => {
      resp.body.destroy()
      res.end()
    })

  } catch (e) {
    console.error('代理错误：', e)
    res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`)
    res.end()
  }
}

// 保存消息（自动过滤换行）
export const saveChatMessage = async (req, res) => {
  try {
    const { roleName, userName, message } = req.body
    const cleanMes = cleanText(message.mes || '')
    
    const chatMessage = {
      name: message.name,
      is_user: message.is_user,
      is_system: false,
      send_date: new Date().toISOString(),
      mes: cleanMes,
      extra: { isSmallSys: false },
      force_avatar: message.force_avatar,
      swipes: [],
      swipe_id: 0,
      gen_started: message.is_user ? null : new Date().toISOString(),
      gen_finished: message.is_user ? null : new Date().toISOString()
    }

    const record = saveChatRecord(roleName, userName, chatMessage)
    res.json({ success: true, record })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
}