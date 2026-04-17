import path from 'path'
import defaultConfig from '../../config/default.config.js'
import { readFile, writeFile } from '../utils/fileUtil.js'
// 用户配置文件路径（统一管理，无重复）
const USER_CONFIG_PATH = path.join(__dirname, '../../config/user.config.json')

/**
 * 获取最终配置（默认配置 + 用户配置覆盖）
 * @returns {object} 合并后的完整配置对象
 */
export const getConfig = () => {
  try {
    // 读取用户配置（若文件不存在/读取失败，返回空对象兜底）
    const userConfig = readFile(USER_CONFIG_PATH, {})
    // 合并默认配置和用户配置（用户配置优先级更高）
    return Object.assign({}, defaultConfig, userConfig)
  } catch (error) {
    console.error('读取配置失败：', error)
    // 读取失败时返回默认配置，避免接口异常
    return defaultConfig
  }
}

/**
 * 保存用户配置
 * @param {object} userConfig 要保存的用户配置对象
 * @returns {boolean} 保存结果（true=成功，false=失败）
 */
export const saveConfig = (userConfig) => {
  try {
    // 写入用户配置文件（fileUtil.writeFile 需返回布尔值）
    const isSuccess = writeFile(USER_CONFIG_PATH, userConfig)
    return isSuccess
  } catch (error) {
    console.error('保存配置失败：', error)
    return false
  }
}