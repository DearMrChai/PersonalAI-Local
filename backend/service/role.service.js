import path from 'path'
import { readFile, writeFile } from '../utils/fileUtil.js'

const ROLE_FILE = path.join(__dirname, '../config/roles.json')

// 默认值全部按你要求
const DEFAULT_ROLE = {
  name: '',
  personality: '',
  tone: '',
  opening: '',
  description: '',
  scenario: '日常聊天',
  mesExample: '',
  talkativeness: 0.5,
  depthPrompt: '不要OOC，严格扮演角色，不偏离人设',
  systemPrompt: ''
}

export const getRoles = () => {
  let list = readFile(ROLE_FILE, [])
  if (!Array.isArray(list)) list = []
  return list.map(item => ({ ...DEFAULT_ROLE, ...item }))
}

export const saveRoles = (list) => {
  return writeFile(ROLE_FILE, list)
}

export const upsertRole = (role) => {
  const list = getRoles()
  const data = { ...DEFAULT_ROLE, ...role }
  const idx = list.findIndex(x => x.name === data.name)
  if (idx >= 0) list[idx] = data
  else list.push(data)
  return saveRoles(list)
}

export const deleteRole = (name) => {
  const list = getRoles().filter(x => x.name !== name)
  return saveRoles(list)
}