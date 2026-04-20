import CharacterRepository from '../models/repositories/CharacterRepository.js';
import TagRepository from '../models/repositories/TagRepository.js';
import CharacterTagRepository from '../models/repositories/CharacterTagRepository.js';

// 测试代码示例
    import { promptBuilder } from './chat/prompt/promptBuilder.js';
    
import { getLlmProvider } from '../services/chat/llm/index.js';

/**
 * 角色业务逻辑层
 */

// 1. 获取全部角色列表
export const getAllCharacters = async () => {
  try {
    // Repository 层已经处理了 JSON 字段的解析 (tags, kinks, example_dialogs)
    // 但这里的 tags 是字符串数组还是对象数组取决于 Repository 实现
    // 根据 CharacterRepository.findAll，它返回的是解析后的数组
    const list = await CharacterRepository.findAll();
    
    // 如果需要更详细的标签对象（而不仅仅是ID或名称），可以在这里进一步处理
    // 目前 Repository 返回的 tags 是 JSON.parse 后的结果，通常是字符串数组或对象数组
    // 假设前端需要的是标签名称数组，我们可以保持现状，或者如果需要标签详情，需额外查询


// // 假设你从数据库拿到了一个角色


// 执行测试
// testLlm(list[0]);
    
    return list;
  } catch (error) {
    console.error('【Service】获取角色列表失败:', error);
    throw new Error('获取角色列表失败');
  }
};

// 2. 获取单个角色详情
export const getCharacterDetail = async (id) => {
  try {
    if (!id) throw new Error('角色ID不能为空');
    
    // 使用带标签查询的方法
    const character = await CharacterRepository.findByIdWithTags(id);
    
    if (!character) {
      throw new Error('角色不存在');
    }

    // 格式化返回数据，确保 tags 是名称数组或其他前端需要的格式
    // CharacterTagRepository.getTagsByCharacterId 返回的是标签对象数组 [{id, name, type...}]
    // 如果前端只需要名称，可以映射一下：
    // character.tags = character.tags.map(t => t.name);
    
    // 解析其他 JSON 字段以防万一（虽然 Repository 可能已处理，但 findByIdWithTags 内部调用 findById 可能未处理所有字段）
    // 注意：findByIdWithTags 内部调用的 findById 没有做 JSON parse，所以需要在这里手动处理非 tags 字段
    return {
      ...character,
      kinks: typeof character.kinks === 'string' ? JSON.parse(character.kinks || '[]') : character.kinks,
      example_dialogs: typeof character.example_dialogs === 'string' ? JSON.parse(character.example_dialogs || '[]') : character.example_dialogs,
      // tags 已经是对象数组了，来自 getTagsByCharacterId
    };
  } catch (error) {
    console.error(`【Service】获取角色详情失败 (ID: ${id}):`, error);
    throw error; // 直接抛出，让 Controller 处理具体错误信息
  }
};

// 3. 新增角色
export const createCharacter = async (characterData) => {
  try {
    // 1. 提取标签 ID 数组 (前端传入的可能是 ID 数组)
    const tagIds = characterData.tags || [];
    
    // 2. 准备存入 characters 表的数据 (移除 tags 字段，因为我们要存到联表)
    // 注意：CharacterRepository.create 期望 tags 字段用于存入 JSON 列，但如果我们使用联表，
    // 这里的 tags 字段在 characters 表中可能只是冗余备份，或者我们需要修改 Repository 行为。
    // 根据当前的 CharacterRepository.create，它会把 tags 序列化成 JSON 存入 characters 表。
    // 为了保持双写一致性（既有 JSON 备份又有联表），我们保留传入的 tags。
    
    const createdChar = await CharacterRepository.create(characterData);
    const characterId = createdChar.id;

    // 3. 处理联表关系：为角色添加标签关联
    if (tagIds && tagIds.length > 0) {
      await CharacterTagRepository.addTags(characterId, tagIds);
    }

    // 4. 返回完整信息（可选，重新查询一次以获取最新状态）
    return await getCharacterDetail(characterId);
  } catch (error) {
    console.error('【Service】创建角色失败:', error);
    throw new Error(`创建角色失败: ${error.message}`);
  }
};

// 4. 更新角色
export const updateCharacter = async (characterData) => {
  try {
    const { id, tags: tagIds, ...otherData } = characterData;
    
    if (!id) throw new Error('角色ID不能为空');

    // 1. 更新角色基础信息
    await CharacterRepository.update(id, otherData);

    // 2. 同步标签关联关系
    // 策略：先删除该角色所有旧标签关联，再添加新传入的标签关联
    if (tagIds !== undefined) {
      await CharacterTagRepository.removeAllTags(id);
      if (tagIds && tagIds.length > 0) {
        await CharacterTagRepository.addTags(id, tagIds);
      }
    }

    return { success: true, id };
  } catch (error) {
    console.error(`【Service】更新角色失败 (ID: ${characterData.id}):`, error);
    throw new Error(`更新角色失败: ${error.message}`);
  }
};

// 5. 删除角色
export const deleteCharacter = async (id) => {
  try {
    if (!id) throw new Error('角色ID不能为空');
    
    // 由于数据库设置了 ON DELETE CASCADE，删除角色会自动删除 character_tags 中的记录
    await CharacterRepository.delete(id);
    
    return { success: true };
  } catch (error) {
    console.error(`【Service】删除角色失败 (ID: ${id}):`, error);
    throw new Error(`删除角色失败: ${error.message}`);
  }
};


async function testLlm(testCharacter) {
  console.log("🚀 开始测试 LLM 流式输出...");

  try {
    // 1. 获取 Provider（实际是 QwenProvider）
    const llm = await getLlmProvider();

    // 2. 准备一个测试角色（用你之前苏晚晴的字段）
    // const testCharacter = {
    //   name: "苏晚晴",
    //   short_bio: "外表清纯但内心很会撩人的咖啡店兼职女生",
    //   personality: "大方开朗、可爱",
    //   tone: "温柔中带一点坏坏的意味",
    //   description: "外表看起来乖巧清纯（黑长直、学生感），但性格其实很大胆且会撩人。",
    //   background_story: "她在大学附近一家咖啡店做兼职，晚上偶尔会去酒吧打工。",
    //   relationship: "咖啡店熟客与店员关系，她早就注意到你了，对你很有兴趣",
    //   age: "21",
    //   height: "168cm",
    //   appearance: "相貌精致，魅惑力的脸，黑长直",
    //   sexual_personality: "在亲密关系中比较主动且有经验，喜欢主导节奏，也喜欢被稍微粗暴一点对待",
    //   tags: ["温柔", "会撩", "黑长直", "咖啡店店员"],
    //   kinks: ["语言挑逗", "慢慢推进", "主导节奏"],
    //   example_dialogs: [
    //     "*轻轻咬了下嘴唇，眼神带着笑意* 你今天又来啦？看起来很累的样子呢，要不要我帮你放松一下？",
    //     "呵呵，你脸红了哦～被我看出来了吧？"
    //   ]
    // };

    // 3. 构建 System Prompt（测试一下 Prompt 质量）
    const systemPrompt = promptBuilder.buildSystemPrompt(testCharacter);
    console.log("=== 生成的 System Prompt ===");
    console.log(systemPrompt);
    console.log("============================\n");

    // 4. 构造 messages（带一点历史，模拟真实对话）
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: "你好，苏晚晴。今天咖啡店忙吗？" },
      // { role: "assistant", content: "*笑着把一杯拿铁推到你面前* 还好啦～主要是看到你来了，我就更有精神了呢。" }
    ];

    // 5. 测试流式输出
    console.log("=== 开始流式生成回复 ===");
    let fullResponse = '';
    

    for await (const chunk of llm.streamGenerate(messages, { 
      temperature: 0.7,
      maxTokens: 400 
    })) {
      process.stdout.write(chunk);   // 实时打印在控制台
      fullResponse += chunk;
    }

    console.log("\n\n=== 生成完成 ===");
    console.log("完整回复：", fullResponse);

  } catch (error) {
    console.error("❌ 测试失败：", error.message);
    console.error(error);
  }
}

