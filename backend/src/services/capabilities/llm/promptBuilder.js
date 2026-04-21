// services/chat/prompt/promptBuilder.js

/**
 * Prompt 构建器
 * 负责将角色卡 + 历史对话 + 当前用户消息 组合成高质量的 System Prompt + Messages
 * 核心目标：让角色人设稳定、氛围感强、回复自然且有沉浸感
 */

export class PromptBuilder {

  /**
   * 构建完整的 System Prompt（最重要！）
   * @param {Object} character - 从数据库取出的角色完整信息（findByIdWithTags 后的结果）
   * @returns {string} System Prompt
   */
  buildSystemPrompt(character) {
    if (!character) {
      return "你是一个温柔体贴的AI伴侣，请自然、真实地与用户对话。";
    }

    let systemPrompt = `你现在是 ${character.name}，一个活生生的女孩。\n\n`;

    // Level 1: 基础信息
    if (character.short_bio) {
      systemPrompt += `基本介绍：${character.short_bio}\n\n`;
    }
    if (character.personality) {
      systemPrompt += `你的性格：${character.personality}。说话时要体现这种性格。\n`;
    }
    if (character.tone) {
      systemPrompt += `你的说话语气风格：${character.tone}，请在回复中自然体现这种语气。\n`;
    }

    // Level 2: 深度设定（重点加强沉浸感）
    if (character.description) {
      systemPrompt += `\n详细描述：${character.description}\n`;
    }
    if (character.background_story) {
      systemPrompt += `\n你的背景故事：${character.background_story}\n`;
    }
    if (character.relationship) {
      systemPrompt += `\n你和用户的关系：${character.relationship}。请始终保持这种关系感。\n`;
    }

    // 外貌与习惯
    let appearanceInfo = [];
    if (character.age) appearanceInfo.push(`年龄：${character.age}`);
    // if (character.height) appearanceInfo.push(`身高：${character.height}`);
    // if (character.body_type) appearanceInfo.push(`身材：${character.body_type}`);
    // if (character.appearance) appearanceInfo.push(`外貌：${character.appearance}`);

    // if (appearanceInfo.length > 0) {
    //   systemPrompt += `\n你的外貌与特征：${appearanceInfo.join('，')}。\n`;
    // }

    // if (character.likes) systemPrompt += `你喜欢的事物：${character.likes}\n`;
    // if (character.dislikes) systemPrompt += `你不喜欢的事物：${character.dislikes}\n`;
    // if (character.habits) systemPrompt += `你的习惯：${character.habits}\n`;

    // 性相关性格（NSFW 时很重要，但要自然融入）
    // if (character.sexual_personality) {
    //   systemPrompt += `\n在亲密关系中，你的性格是：${character.sexual_personality}。但请根据对话氛围自然流露，不要突兀。\n`;
    // }

    // Level 3: 标签系统
    // if (character.tags && character.tags.length > 0) {
    //   systemPrompt += `\n你的标签：${character.tags.join('、')}。\n`;
    // }
    // if (character.kinks && character.kinks.length > 0) {
    //   systemPrompt += `你的特殊癖好：${character.kinks.join('、')}。请在合适的时候自然体现。\n`;
    // }

    // Level 4: 示例对话（强烈推荐使用，能极大提升一致性）
    if (character.example_dialogs && character.example_dialogs.length > 0) {
      systemPrompt += `\n以下是你的对话示例，请严格模仿这种说话风格和长度：\n`;
      character.example_dialogs.forEach((ex, index) => {
        systemPrompt += `${index + 1}. ${ex}\n`;
      });
    }

    // 通用行为指令（提升整体质量）
    systemPrompt += `\n回复要求：
- 请用第一人称，以 ${character.name} 的身份自然回复。
- 语气要符合你的性格和说话风格，偶尔可以带一点情绪和动作描写（*轻轻抱住你*、脸红等）。
- 回复长度适中，不要太短，也不要一次性说太多。
- 保持沉浸感，不要说你是AI，不要打破角色。
`;

    return systemPrompt.trim();
  }
// - 如果对话走向亲密，请根据你的 sexual_personality 自然回应。
  /**
   * 构建完整的 Messages 数组（适合 node-llama-cpp）
   * @param {Object} character 
   * @param {Array} historyMessages - 历史对话记录 [{role: 'user'|'assistant', content: string}, ...]
   * @param {string} currentUserMessage - 当前用户输入
   * @returns {Array} messages
   */
  buildMessages(character, historyMessages = [], currentUserMessage) {
    const systemPrompt = this.buildSystemPrompt(character);

    const messages = [
      { role: "system", content: systemPrompt }
    ];

    // 添加历史对话
    if (historyMessages && historyMessages.length > 0) {
      historyMessages.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });
    }

    // 添加当前用户消息
    if (currentUserMessage) {
      messages.push({
        role: "user",
        content: currentUserMessage
      });
    }

    return messages;
  }
}

export const promptBuilder = new PromptBuilder();