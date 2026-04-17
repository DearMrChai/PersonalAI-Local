// import { run, all, get } from '../models/index.js';
import CharacterRepository from '../models/repositories/CharacterRepository.js';

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
  const list = await CharacterRepository.findAll();
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
  const info = await CharacterRepository.findById(id);
  if (!info) throw new Error("角色不存在");

  info.tags = parseJson(info.tags);
  info.kinks = parseJson(info.kinks);
  info.example_dialogs = parseJson(info.example_dialogs);
  return info;
};

// 3. 新增角色
export const createCharacter = async (characterData) => {
  if (!characterData.name) throw new Error("角色名称不能为空");

  const result = await CharacterRepository.create(characterData);
  return result.result;
};

// 4. 更新角色
export const updateCharacter = async (characterData) => {
  if (!characterData.id) throw new Error("角色ID不能为空");

  await CharacterRepository.update(characterData.id, characterData);
  return { success: true };
};

// 5. 删除角色
export const deleteCharacter = async (id) => {
  if (!id) throw new Error("角色ID不能为空");
  await CharacterRepository.delete(id);
  return { success: true };
};