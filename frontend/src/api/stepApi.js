// src/api/stepApi.js
import request from './request'; // 引入之前封装的axios实例

/**
 * 获取初始化配置
 * @returns {Promise} 配置数据Promise
 */
export const getConfig = () => {
  return request({
    url: '/api/config',
    method: 'get'
  });
};

/**
 * 保存配置
 * @param {Object} config - 完整的配置对象
 * @returns {Promise} 保存结果Promise
 */
export const saveConfig = (config) => {
  return request({
    url: '/api/config',
    method: 'post',
    data: config
  });
};

/**
 * 启动所有服务
 * @returns {Promise} 启动结果Promise
 */
export const startAllServices = () => {
  return request({
    url: '/api/start-services',
    method: 'get'
  });
};