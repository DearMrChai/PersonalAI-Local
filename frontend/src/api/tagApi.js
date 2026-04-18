import request from './request';

/**
 * 获取所有标签列表
 */
export const getAllTags = () => {
    return request({
        url: '/api/tags/getAllTags',
        method: 'get'
    });
};

/**
 * 创建或获取标签 (Upsert)
 * 如果标签存在则返回已有标签，不存在则创建
 * @param {object} data - { name: string, type?: string }
 */
export const createOrGetTag = (data) => {
    return request({
        url: '/api/tags/createOrGetTag',
        method: 'post',
        data
    });
};

/**
 * 获取标签详情
 * @param {number|string} id - 标签ID
 */
export const getTagDetail = (id) => {
    return request({
        url: '/api/tags/getTagDetail',
        method: 'get',
        params: { id }
    });
};

/**
 * 更新标签
 * @param {object} data - { id: number, name?: string, type?: string }
 */
export const updateTag = (data) => {
    return request({
        url: '/api/tags/updateTag',
        method: 'post',
        data
    });
};

/**
 * 删除标签
 * @param {object} data - { id: number }
 */
export const deleteTag = (data) => {
    return request({
        url: '/api/tags/deleteTag',
        method: 'post',
        data
    });
};