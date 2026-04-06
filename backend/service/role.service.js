import path from 'path'
import { readFile, writeFile } from '../utils/fileUtil.js'

// 角色文件路径
const ROLE_FILE = path.join(__dirname, '../config/roles.json')

// 获取角色列表（自动创建空文件）
export const getRoles = () => {
  const roles = readFile(ROLE_FILE, [])
  // 兼容原roles.json的格式错误（自动过滤非对象数据）
  return roles.filter(role => typeof role === 'object' && role !== null && role.name)
}

// 保存角色列表
export const saveRoles = (list) => {
  return writeFile(ROLE_FILE, list)
}

// 新增/更新角色
export const upsertRole = (role) => {
  const roles = getRoles()
  const index = roles.findIndex(r => r.name === role.name)
  if (index >= 0) {
    roles[index] = role
  } else {
    roles.push(role)
  }
  return saveRoles(roles)
}

// 删除角色
export const deleteRole = (name) => {
  const roles = getRoles().filter(r => r.name !== name)
  return saveRoles(roles)
}