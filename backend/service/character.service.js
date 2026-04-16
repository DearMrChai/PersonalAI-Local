import { run, all, get } from '../db/index.js';

// 格式化 JSON 字段
const parseJson = (str) => {
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
};

// 1. 获取全部角色列表
export const getAllCharacters = async () => {
  const list = await all(`SELECT * FROM characters ORDER BY created_at DESC`);
  // 格式化json字段返回
  return list.map(item => ({
    ...item,
    tags: parseJson(item.tags),
    kinks: parseJson(item.kinks),
    example_dialogs: parseJson(item.example_dialogs)
  }));
};

// 2. 获取单个角色详情
export const getCharacterDetail = async (id) => {
  if (!id) throw new Error("角色ID不能为空");
  const info = await get(`SELECT * FROM characters WHERE id = ?`, [id]);
  if (!info) throw new Error("角色不存在");
  
  info.tags = parseJson(info.tags);
  info.kinks = parseJson(info.kinks);
  info.example_dialogs = parseJson(info.example_dialogs);
  return info;
};

// 3. 新增角色
export const createCharacter = async (characterData) => {
  const sql = `
    INSERT INTO characters (
    name, avatar, short_bio, personality, tone, opening,
    description, background_story, relationship, age, height, body_type, appearance,
    likes, dislikes, habits, sexual_personality,
    tags, kinks, voice_style, example_dialogs, memory_template, visual_style
    ) VALUES (
    ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?
    )
  `;

  // 组装参数，确保每个字段都有默认值
  const params = [
    characterData.name,
    characterData.avatar ?? '',
    characterData.short_bio ?? '',
    characterData.personality ?? '',
    characterData.tone ?? '',
    characterData.opening ?? '',

    characterData.description ?? '',
    characterData.background_story ?? '',
    characterData.relationship ?? '',
    characterData.age ?? '',
    characterData.height ?? '',
    characterData.body_type ?? '',
    characterData.appearance ?? '',

    characterData.likes ?? '',
    characterData.dislikes ?? '',
    characterData.habits ?? '',
    characterData.sexual_personality ?? '',

    JSON.stringify(characterData.tags ?? []),
    JSON.stringify(characterData.kinks ?? []),
    characterData.voice_style ?? '',
    JSON.stringify(characterData.example_dialogs ?? []),
    characterData.memory_template ?? '',
    characterData.visual_style ?? ''
  ];

  const result = await run(sql, params);
  return { id: result.lastID };
};

// 4. 更新角色
export const updateCharacter = async (characterData) => {
  if (!characterData.id) throw new Error("角色ID不能为空");
  
  const sql = `
  UPDATE characters SET
    name=?,avatar=?,short_bio=?,personality=?,tone=?,opening=?,
    description=?,background_story=?,relationship=?,age=?,height=?,body_type=?,appearance=?,
    likes=?,dislikes=?,habits=?,sexual_personality=?,
    tags=?,kinks=?,voice_style=?,example_dialogs=?,memory_template=?,visual_style=?,
    updated_at=CURRENT_TIMESTAMP
  WHERE id = ?
  `;
  
  const params = [
    characterData.name,
    characterData.avatar || '',
    characterData.short_bio || '',
    characterData.personality || '',
    characterData.tone || '',
    characterData.opening || '',

    characterData.description || '',
    characterData.background_story || '',
    characterData.relationship || '',
    characterData.age || '',
    characterData.height || '',
    characterData.body_type || '',
    characterData.appearance || '',

    characterData.likes || '',
    characterData.dislikes || '',
    characterData.habits || '',
    characterData.sexual_personality || '',

    JSON.stringify(characterData.tags || []),
    JSON.stringify(characterData.kinks || []),
    characterData.voice_style || '',
    JSON.stringify(characterData.example_dialogs || []),
    characterData.memory_template || '',
    characterData.visual_style || '',
    characterData.id
  ];
  
  await run(sql, params);
  return { success: true };
};

// 5. 删除角色
export const deleteCharacter = async (id) => {
  if (!id) throw new Error("角色ID不能为空");
  await run(`DELETE FROM characters WHERE id = ?`, [id]);
  return { success: true };
};