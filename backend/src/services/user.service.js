import path from 'path'
import { readFile, writeFile } from '../utils/fileUtil.js'

// 和roles.json同目录
const USER_FILE = path.join(__dirname, '../config/users.json')

// 默认用户（预留avatar拓展字段）
const DEFAULT_USER = {
  id: 'default',
  name: '用户',
  avatar: '/thumbnail?type=persona&file=user-default.png', // 预留头像URL
  extra: {} // 预留拓展字段
}

// 获取所有用户
export const getUsers = () => {
  let list = readFile(USER_FILE, [])
  if (!Array.isArray(list)) list = []
  // 兜底默认用户
  if (list.length === 0) {
    list = [DEFAULT_USER]
    writeFile(USER_FILE, list)
  }
  return list.map(item => ({ ...DEFAULT_USER, ...item }))
}

// 新增/更新用户（暂用，前端仅切换不编辑）
export const upsertUser = (user) => {
  const list = getUsers()
  const data = { ...DEFAULT_USER, ...user }
  const idx = list.findIndex(x => x.id === data.id)
  if (idx >= 0) list[idx] = data
  else list.push(data)
  return writeFile(USER_FILE, list)
}