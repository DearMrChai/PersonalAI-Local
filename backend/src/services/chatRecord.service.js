import path from 'path'
import { readFile, writeFile } from '../utils/fileUtil.js'

// 聊天记录存储目录（和roles.json同目录）
const CHAT_HISTORY_DIR = path.join(__dirname, '../config/chat-history')
// 最大上下文轮数（可配置）
const MAX_CONTEXT_ROUNDS = 50

// 初始化目录
// mkdirIfNotExist(CHAT_HISTORY_DIR)

// 生成聊天记录文件路径
const getChatFilePath = (roleName, userName) => {
  // 新增：参数非空校验
  if (!roleName || !userName) {
    throw new Error('roleName和userName不能为空')
  }
  console.log(`生成聊天记录文件路径: roleName=${roleName}, userName=${userName}`);
  // 替换文件名中的非法字符，避免文件系统错误
  const safeRoleName = roleName.replace(/[\\/:*?"<>|]/g, '_')
  const safeUserName = userName.replace(/[\\/:*?"<>|]/g, '_')
  return path.join(CHAT_HISTORY_DIR, `${safeRoleName}-${safeUserName}.json`)
}

// 构建默认聊天记录结构（参考傻酒馆简化）
const getDefaultChatRecord = (roleName, userName) => {
  return {
    ch_name: roleName,
    file_name: `${roleName} - ${new Date().toISOString().replace(/[:.]/g, '-')}`, // 时间戳命名
    chat: [
      {
        chat_metadata: {
          integrity: crypto.randomUUID(), // 唯一标识
          note_prompt: "",
          note_interval: 1,
          note_position: 1,
          note_depth: 4,
          note_role: 0,
          tainted: true,
          timedWorldInfo: { sticky: {}, cooldown: {} }, // 预留
          lastInContextMessageId: 0,
          // 预留拓展字段
          swipes: [],
          swipe_id: 0
        },
        user_name: userName,
        character_name: roleName
      }
    ],
    avatar_url: `${roleName}.png`, // 预留AI角色头像
    force: false
  }
}

// 加载聊天记录
export const loadChatRecord = (roleName, userName) => {
  const filePath = getChatFilePath(roleName, userName)
  let record = readFile(filePath, null)
  if (!record) {
    // 无记录时返回默认结构
    record = getDefaultChatRecord(roleName, userName)
    writeFile(filePath, record)
  }
  // 兼容旧数据结构（如果有）
  if (!record.chat) record.chat = []
  return record
}

// 保存聊天记录（截断超出最大轮数的消息）
export const saveChatRecord = (roleName, userName, newMessage) => {
  const filePath = getChatFilePath(roleName, userName)
  let record = loadChatRecord(roleName, userName)

  // 过滤掉metadata占位项，只保留消息体
  let messages = record.chat.filter(item => !item.chat_metadata)
  // 添加新消息
  messages.push(newMessage)
  // 截断超出最大轮数的消息（保留最新MAX_CONTEXT_ROUNDS条）
  if (messages.length > MAX_CONTEXT_ROUNDS) {
    messages = messages.slice(-MAX_CONTEXT_ROUNDS)
  }
  // 重新组装chat数组（metadata + 最新消息）
  record.chat = [record.chat[0], ...messages]
  // 更新file_name时间戳
  record.file_name = `${roleName} - ${new Date().toISOString().replace(/[:.]/g, '-')}`
  // 写入文件
  writeFile(filePath, record)
  return record
}

// 清空聊天记录
export const clearChatRecord = (roleName, userName) => {
  const filePath = getChatFilePath(roleName, userName)
  const record = getDefaultChatRecord(roleName, userName)
  writeFile(filePath, record)
  return record
}