import TagRepository from '../models/repositories/TagRepository.js';
import CharacterTagRepository from '../models/repositories/CharacterTagRepository.js';

/**
 * 标签业务逻辑层
 */

// 1. 获取所有标签
export const getAllTags = async () => {
  try {
    const tags = await TagRepository.findAll();
    return tags;
  } catch (error) {
    console.error('【Service】获取标签列表失败:', error);
    throw new Error('获取标签列表失败');
  }
};

// 2. 创建或获取标签 (Upsert)
export const createOrGetTag = async (name, type = 'general') => {
  try {
    if (!name) throw new Error('标签名称不能为空');
    
    const tag = await TagRepository.createOrGet(name, type);
    return tag;
  } catch (error) {
    console.error(`【Service】创建/获取标签失败 (${name}):`, error);
    throw error;
  }
};

// 3. 获取标签详情
export const getTagDetail = async (id) => {
  try {
    if (!id) throw new Error('标签ID不能为空');
    
    const tag = await TagRepository.findById(id);
    if (!tag) {
      throw new Error('标签不存在');
    }
    return tag;
  } catch (error) {
    console.error(`【Service】获取标签详情失败 (ID: ${id}):`, error);
    throw error;
  }
};

// 4. 更新标签
export const updateTag = async (id, data) => {
  try {
    if (!id) throw new Error('标签ID不能为空');
    
    // 检查标签是否存在
    const existing = await TagRepository.findById(id);
    if (!existing) {
      throw new Error('标签不存在，无法更新');
    }

    await TagRepository.update(id, data);
    return { success: true, id };
  } catch (error) {
    console.error(`【Service】更新标签失败 (ID: ${id}):`, error);
    throw new Error(`更新标签失败: ${error.message}`);
  }
};

// 5. 删除标签
export const deleteTag = async (id) => {
  try {
    if (!id) throw new Error('标签ID不能为空');
    
    // 检查标签是否存在
    const existing = await TagRepository.findById(id);
    if (!existing) {
      throw new Error('标签不存在，无法删除');
    }

    // 数据库设置了 ON DELETE CASCADE，删除标签会自动删除 character_tags 中的关联
    await TagRepository.delete(id);
    
    return { success: true };
  } catch (error) {
    console.error(`【Service】删除标签失败 (ID: ${id}):`, error);
    throw new Error(`删除标签失败: ${error.message}`);
  }
};