import fetch from 'node-fetch'
import { getConfig } from './config.service.js'
import { saveChatRecord } from './chatRecord.service.js'
import { createLlamaChatSession, streamLlamaResponse, buildModelPrompt } from './llama.service.js';

// 过滤多余换行
const cleanText = (text) => {
  if (!text) return ''
  return text.replace(/\n+/g, ' ').trim()
}

// 旧接口（保留但不使用）
export const streamChat = async (req, res) => {
  try {
    const config = getConfig()
    const llamaUrl = `http://localhost:${config.port.llama}/v1/completions`

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
            data.choices[0].text = cleanText(data.choices[0].text)
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

// 新版本接口（适配模型Prompt格式）
export const streamChatv2 = async (req, res) => {
  try {
    const { prompt, roleName = '测试角色', userName = '用户' } = req.body;

    if (!prompt) {
      throw new Error("用户输入不能为空");
    }
    console.log("收到用户输入：", prompt);

    // 1. 解析prompt中的角色设定（从请求参数中提取系统提示词）
    // 示例：从prompt中提取【角色】【性格】【语气】【场景】等信息作为systemPrompt
    const systemPrompt = extractSystemPrompt(prompt, roleName);


    
    console.log("构建的系统提示词：", systemPrompt);

    // 2. 构建符合模型要求的完整Prompt
    const modelPrompt = buildModelPrompt(
      systemPrompt,
      cleanText(prompt.replace(/【.*?】/g, '').trim()), // 提取纯用户输入
      roleName,
      userName
    );

    // 3. 创建会话（传入系统提示词）
    const session = await createLlamaChatSession(systemPrompt);
    console.log("会话创建成功，开始流式响应...");

    // 4. 流式返回响应
    await streamLlamaResponse(session, modelPrompt, res);

    req.on('close', () => {
      res.end();
    });

  } catch (e) {
    console.error('streamChatv2 错误：', e);
    res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
    res.end();
  }
};

// 从prompt中提取角色设定作为systemPrompt
const extractSystemPrompt = (prompt, roleName) => {
  // 匹配【角色】【性格】【语气】【场景】等字段
  const roleMatch = prompt.match(/【角色】(.*?)\n/);
  const personalityMatch = prompt.match(/【性格】(.*?)\n/);
  const toneMatch = prompt.match(/【语气】(.*?)\n/);
  const sceneMatch = prompt.match(/【场景】(.*?)\n/);

  // 构建系统提示词
  let systemPrompt = `你是${roleName || '测试角色'}，`;
  if (personalityMatch) systemPrompt += `性格：${personalityMatch[1]}，`;
  if (toneMatch) systemPrompt += `语气：${toneMatch[1]}，`;
  if (sceneMatch) systemPrompt += `场景：${sceneMatch[1]}。`;
  systemPrompt += `请按照设定与用户进行日常聊天。`;

  return systemPrompt;
};

// 保存聊天记录（不变）
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



// // 在 chat.service.js 顶部导入
// import { getCharacterDetail } from './character.service.js';

// // 示例：在 streamChatv2 中根据角色ID获取角色信息，替换硬编码的 roleName
// export const streamChatv2 = async (req, res) => {
//   try {
//     const { prompt, characterId, userName = '用户' } = req.body;

//     if (!prompt) {
//       throw new Error("用户输入不能为空");
//     }
    
//     // 从数据库获取角色信息（替代原来的硬编码 roleName）
//     let roleName = '测试角色';
//     let systemPrompt = '';
//     if (characterId) {
//       const character = await getCharacterDetail(characterId);
//       roleName = character.name;
//       // 用数据库中的角色属性构建系统提示词
//       systemPrompt = `你是${character.name}，性格：${character.personality}，语气：${character.tone}，场景：${character.background_story}。请按照设定与用户进行日常聊天。`;
//     } else {
//       // 兼容原有逻辑
//       systemPrompt = extractSystemPrompt(prompt, roleName);
//     }

//     console.log("构建的系统提示词：", systemPrompt);

//     // 后续逻辑不变...
//     const modelPrompt = buildModelPrompt(
//       systemPrompt,
//       cleanText(prompt.replace(/【.*?】/g, '').trim()),
//       roleName,
//       userName
//     );

//     const session = await createLlamaChatSession(systemPrompt);
//     console.log("会话创建成功，开始流式响应...");

//     await streamLlamaResponse(session, modelPrompt, res);

//     req.on('close', () => {
//       res.end();
//     });

//   } catch (e) {
//     console.error('streamChatv2 错误：', e);
//     res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
//     res.end();
//   }
// };