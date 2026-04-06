import path from 'path'
import defaultConfig from '../config/default.config.js'
import { readFile, writeFile } from '../utils/fileUtil.js'

// 用户配置文件路径（统一管理，无重复）
const USER_CONFIG_PATH = path.join(__dirname, '../config/user.config.json')

// 获取最终配置（默认配置 + 用户配置覆盖）
export const getConfig = () => {
  const userConfig = readFile(USER_CONFIG_PATH, {})
  return Object.assign({}, defaultConfig, userConfig)
}

// 保存用户配置
export const saveConfig = (userConfig) => {
  return writeFile(USER_CONFIG_PATH, userConfig)
}