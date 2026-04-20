import { getCharacterDetail } from './character.service.js';
import { getLlmProvider } from './chat/llm/index.js';
import { promptBuilder } from './chat/prompt/promptBuilder.js';
import { saveChatRecord } from './chatRecord.service.js';

/**
 * 核心业务逻辑：生成流式回复
 * @param {Object} params 
 * @param {string|number} params.characterId - 角色ID
 * @param {string} params.message - 用户当前消息
 * @param {Array} params.history - 历史对话记录 [{ role: 'user'|'assistant', content: string }]
 * @param {string} params.userName - 用户名（用于存储记录）
 * @returns {AsyncGenerator<string, void, undefined>} 返回文本块的异步生成器
 */
export async function* generateStreamResponse({ characterId, message, history = [], userName = '用户' }) {
  if (!characterId || !message) {
    throw new Error("缺少角色ID或用户消息");
  }

  console.log(`[ChatService] 开始处理请求: 角色ID=${characterId}`);

  // 1. 获取角色详情 (为了拿到 roleName 和 avatar 等)
  const character = await getCharacterDetail(characterId);
  if (!character) {
    throw new Error("角色不存在");
  }
  
  const roleName = character.name; // 关键：拿到角色名称用于保存文件

  // 2. 构建 System Prompt
  const systemPrompt = promptBuilder.buildSystemPrompt(character);

  // 3. 组装 Messages
  const messages = [
    { role: "system", content: systemPrompt },
    ...history, 
    { role: "user", content: message }
  ];

  console.log(`[ChatService] Prompt 构建完成，消息数: ${messages.length}`);

  // 4. 获取 LLM Provider
  const llm = await getLlmProvider();

  let fullResponse = '';

  // 5. 调用 LLM 并 Yield 数据
  try {
    for await (const chunk of llm.streamGenerate(messages, {
      temperature: 0.75,
      maxTokens: 512,
    })) {
      fullResponse += chunk;
      yield chunk; 
    }
  } catch (llmError) {
    console.error('[ChatService] LLM 生成错误:', llmError);
    throw new Error(`LLM 生成失败: ${llmError.message}`);
  }

  console.log(`[ChatService] 生成完成，总长度: ${fullResponse.length}`);

  // 6. 【修复点】异步保存记录
  // 因为 saveChatRecord 是同步函数，我们不能用 .catch()
  // 我们把它包在一个 async 函数里，这样即使里面有同步错误，也不会崩溃主进程
  (async () => {
    try {
      // 保存用户消息
      saveChatRecord(roleName, userName, {
        name: userName,
        is_user: true,
        mes: message,
        send_date: new Date().toISOString(),
        force_avatar: '', // 如果需要可以补充
        extra: {},
        swipes: [],
        swipe_id: 0
      });

      // 保存 AI 消息
      saveChatRecord(roleName, userName, {
        name: roleName,
        is_user: false,
        mes: fullResponse,
        send_date: new Date().toISOString(),
        force_avatar: character.avatar || '', 
        extra: {},
        swipes: [],
        swipe_id: 0,
        gen_started: new Date().toISOString(),
        gen_finished: new Date().toISOString()
      });
      
      console.log('[ChatService] 聊天记录保存成功');
    } catch (err) {
      console.error('[ChatService] 保存聊天记录时发生同步错误:', err);
    }
  })(); // 立即执行这个异步闭包
}