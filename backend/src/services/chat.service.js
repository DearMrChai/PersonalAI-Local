// src/services/chat/chat.service.js
import { getLlmProvider } from './chat/llm/index.js';
import { contextManager } from './chat/context/contextManager.js';
// import { saveChatRecord } from './chatRecord.service.js';

/**
 * 核心业务逻辑：生成流式回复（已接入 ContextManager）
 */
export async function* generateStreamResponse({ 
  characterId, 
  message, 
  sessionId = null,     // 新增：会话ID（强烈建议传入）
  userName = '用户' 
}) {
  if (!characterId || !message) {
    throw new Error("缺少角色ID或用户消息");
  }

  console.log(`[ChatService] 开始处理请求: 角色ID=${characterId}, sessionId=${sessionId || '自动创建'}`);

  try {
    // ==================== 使用 ContextManager 构建上下文 ====================
    const context = await contextManager.buildContext(
      characterId, 
      sessionId, 
      message
    );

    const roleName = context.character.name;
    const finalSessionId = context.sessionId;   // ContextManager 可能自动创建了会话

    // ==================== 调用 LLM ====================
    const llm = await getLlmProvider();

    let fullResponse = '';

    for await (const chunk of llm.streamGenerate(context.messages, {
      temperature: 0.75,
      maxTokens: 512,
    })) {
      fullResponse += chunk;
      yield chunk; 
    }

    console.log(`[ChatService] 生成完成，总长度: ${fullResponse.length}`);

    // ==================== 保存记录（保留你原来的逻辑）===================
    // (async () => {
    //   try {
    //     saveChatRecord(roleName, userName, {
    //       name: userName,
    //       is_user: true,
    //       mes: message,
    //       send_date: new Date().toISOString(),
    //     });

    //     saveChatRecord(roleName, userName, {
    //       name: roleName,
    //       is_user: false,
    //       mes: fullResponse,
    //       send_date: new Date().toISOString(),
    //       force_avatar: context.character.avatar || '',
    //     });
        
    //     console.log('[ChatService] 聊天记录保存成功');
    //   } catch (err) {
    //     console.error('[ChatService] 保存记录失败:', err);
    //   }
    // })();

  } catch (error) {
    console.error('[ChatService] 处理请求失败:', error.message);
    throw error;
  }
}