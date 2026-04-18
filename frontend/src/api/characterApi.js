import request from './request';

/**
 * 获取全部角色列表
 */
export const getAllCharacters = () => {
    return request({
        url: '/api/characters/getAllCharacters',
        method: 'get'
    });
};

/**
 * 获取单个角色详情
 * @param {number|string} id - 角色ID
 */
export const getCharacterDetail = (id) => {
    return request({
        url: '/api/characters/getCharacterDetail',
        method: 'get',
        params: { id }
    });
};

/**
 * 新增角色
 * @param {object} data - 角色数据
 */
export const createCharacter = (data) => {
    return request({
        url: '/api/characters/createCharacter',
        method: 'post',
        data
    });
};

/**
 * 更新角色
 * @param {object} data - 角色数据（必须包含 id）
 */
export const updateCharacter = (data) => {
    return request({
        url: '/api/characters/updateCharacter',
        method: 'post',
        data
    });
};

/**
 * 删除角色
 * @param {object} data - { id: number }
 */
export const deleteCharacter = (data) => {
    return request({
        url: '/api/characters/deleteCharacter',
        method: 'post',
        data
    });
};