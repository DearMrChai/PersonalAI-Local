import createResponse from '../utils/responseUtil.js';
import {
  getAllTags,
  createOrGetTag,
  getTagDetail,
  updateTag,
  deleteTag
} from '../services/tag.service.js';

/**
 * 获取所有标签
 */
export const getAllTagsController = async (req, res) => {
  try {
    const tags = await getAllTags();
    res.json(createResponse.success(tags, '获取标签列表成功'));
  } catch (error) {
    console.error('【Controller】获取标签列表异常:', error);
    res.status(500).json(createResponse.serverError(error.message));
  }
};

/**
 * 创建或获取标签 (Upsert)
 * 前端传入 { name: 'xxx', type: 'general' }
 */
export const createOrGetTagController = async (req, res) => {
  try {
    const { name, type } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json(createResponse.clientError('标签名称不能为空'));
    }

    const tag = await createOrGetTag(name.trim(), type || 'general');
    
    // 如果是新创建的，返回 201；如果是已存在的，返回 200
    // 这里统一返回 success，前端可根据需要判断
    res.json(createResponse.success(tag, '标签处理成功'));
  } catch (error) {
    console.error('【Controller】创建/获取标签异常:', error);
    res.status(500).json(createResponse.serverError(error.message));
  }
};

/**
 * 获取标签详情
 */
export const getTagDetailController = async (req, res) => {
  try {
    const id = req.params.id || req.query.id;
    
    if (!id) {
      return res.status(400).json(createResponse.clientError('标签ID不能为空'));
    }

    const tag = await getTagDetail(id);
    res.json(createResponse.success(tag, '获取标签详情成功'));
  } catch (error) {
    console.error('【Controller】获取标签详情异常:', error);
    if (error.message.includes('不存在')) {
      return res.status(404).json(createResponse.notFound(error.message));
    }
    res.status(500).json(createResponse.serverError(error.message));
  }
};

/**
 * 更新标签
 */
export const updateTagController = async (req, res) => {
  try {
    const { id, ...data } = req.body;
    
    // 如果 ID 在 params 中，优先使用 params
    const tagId = req.params.id || id;

    if (!tagId) {
      return res.status(400).json(createResponse.clientError('标签ID不能为空'));
    }

    await updateTag(tagId, data);
    res.json(createResponse.success({ id: tagId }, '更新标签成功'));
  } catch (error) {
    console.error('【Controller】更新标签异常:', error);
    if (error.message.includes('不存在')) {
      return res.status(404).json(createResponse.notFound(error.message));
    }
    res.status(500).json(createResponse.serverError(error.message));
  }
};

/**
 * 删除标签
 */
export const deleteTagController = async (req, res) => {
  try {
    const id = req.params.id || req.body.id;

    if (!id) {
      return res.status(400).json(createResponse.clientError('标签ID不能为空'));
    }

    await deleteTag(id);
    res.json(createResponse.success(null, '删除标签成功'));
  } catch (error) {
    console.error('【Controller】删除标签异常:', error);
    if (error.message.includes('不存在')) {
      return res.status(404).json(createResponse.notFound(error.message));
    }
    res.status(500).json(createResponse.serverError(error.message));
  }
};

export default {
  getAllTagsController,
  createOrGetTagController,
  getTagDetailController,
  updateTagController,
  deleteTagController
};