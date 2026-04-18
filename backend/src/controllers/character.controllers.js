import createResponse from '../utils/responseUtil.js';
import {
  getAllCharacters,
  getCharacterDetail,
  createCharacter,
  updateCharacter,
  deleteCharacter
} from '../services/character.service.js';

/**
 * 获取全部角色列表
 */
export const getAllCharactersController = async (req, res) => {
  try {
    const characters = await getAllCharacters();
    res.json(createResponse.success(characters, '获取角色列表成功'));
  } catch (error) {
    console.error('【Controller】获取角色列表异常:', error);
    res.status(500).json(createResponse.serverError(error.message));
  }
};

/**
 * 获取单个角色详情
 * 注意：根据路由设计，ID 可能来自 req.params.id 或 req.query.id
 */
export const getCharacterDetailController = async (req, res) => {
  try {
    // 优先从 params 获取，如果没有则尝试 query
    const id = req.params.id || req.query.id;
    
    if (!id) {
      return res.status(400).json(createResponse.clientError('角色ID不能为空'));
    }

    const character = await getCharacterDetail(id);
    
    if (!character) {
      return res.status(404).json(createResponse.notFound('角色不存在'));
    }

    res.json(createResponse.success(character, '获取角色详情成功'));
  } catch (error) {
    console.error('【Controller】获取角色详情异常:', error);
    // 区分是“未找到”还是“服务器错误”
    if (error.message.includes('不存在')) {
      return res.status(404).json(createResponse.notFound(error.message));
    }
    res.status(500).json(createResponse.serverError(error.message));
  }
};

/**
 * 新增角色
 */
export const createCharacterController = async (req, res) => {
  try {
    const characterData = req.body;

    // 基础校验
    if (!characterData.name || !characterData.name.trim()) {
      return res.status(400).json(createResponse.clientError('角色名称不能为空'));
    }

    const newCharacter = await createCharacter(characterData);
    res.status(201).json(createResponse.success(newCharacter, '创建角色成功'));
  } catch (error) {
    console.error('【Controller】创建角色异常:', error);
    res.status(500).json(createResponse.serverError(error.message));
  }
};

/**
 * 更新角色
 */
export const updateCharacterController = async (req, res) => {
  try {
    const characterData = req.body;
    
    // 基础校验
    if (!characterData.id) {
      return res.status(400).json(createResponse.clientError('角色ID不能为空'));
    }

    await updateCharacter(characterData);
    res.json(createResponse.success({ id: characterData.id }, '更新角色成功'));
  } catch (error) {
    console.error('【Controller】更新角色异常:', error);
    if (error.message.includes('不存在')) {
      return res.status(404).json(createResponse.notFound(error.message));
    }
    res.status(500).json(createResponse.serverError(error.message));
  }
};

/**
 * 删除角色
 */
export const deleteCharacterController = async (req, res) => {
  try {
    // 支持从 body 或 params 获取 ID
    const id = req.body.id || req.params.id;

    if (!id) {
      return res.status(400).json(createResponse.clientError('角色ID不能为空'));
    }

    await deleteCharacter(id);
    res.json(createResponse.success(null, '删除角色成功'));
  } catch (error) {
    console.error('【Controller】删除角色异常:', error);
    if (error.message.includes('不存在')) {
      return res.status(404).json(createResponse.notFound(error.message));
    }
    res.status(500).json(createResponse.serverError(error.message));
  }
};

export default {
  getAllCharactersController,
  getCharacterDetailController,
  createCharacterController,
  updateCharacterController,
  deleteCharacterController
};