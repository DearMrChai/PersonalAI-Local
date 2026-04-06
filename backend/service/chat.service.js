import fetch from 'node-fetch'
import { getConfig } from './config.service.js'
import { saveChatRecord } from './chatRecord.service.js'

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

    // 流式转发
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

// 新增：保存单条消息到聊天记录
export const saveChatMessage = async (req, res) => {
  try {
    const { roleName, userName, message } = req.body
    // 构建傻酒馆格式的消息体（预留拓展字段）
    const chatMessage = {
      name: message.sender_name,
      is_user: message.is_user,
      is_system: false,
      send_date: new Date().toISOString(),
      mes: message.content,
      extra: {
        isSmallSys: false,
        reasoning: "", // 预留
        api: "", // 预留
        model: "" // 预留
      },
      force_avatar: message.avatar || '/thumbnail?type=persona&file=user-default.png', // 预留头像
      // 预留swipes相关
      swipes: [],
      swipe_id: 0,
      swipe_info: [],
      // 预留生成信息
      gen_started: message.is_user ? null : new Date().toISOString(),
      gen_finished: message.is_user ? null : new Date().toISOString()
    }
    // 保存到JSON文件
    const record = saveChatRecord(roleName, userName, chatMessage)
    res.json({ success: true, record })
  } catch (e) {
    console.error('保存聊天记录失败：', e)
    res.status(500).json({ success: false, error: e.message })
  }
}