import express from 'express'
import { loadChatRecord, saveChatRecord, clearChatRecord } from '../service/chatRecord.service.js'

const router = express.Router()

// 加载指定角色+用户的聊天记录
router.get('/chat-record', (req, res) => {
  try {
    const { roleName, userName } = req.query
    if (!roleName || !userName) {
      return res.status(400).json({ code: 400, msg: 'roleName和userName不能为空' })
    }
    const record = loadChatRecord(roleName, userName)
    res.json({ code: 200, data: record, msg: '加载聊天记录成功' })
  } catch (error) {
    console.error('加载聊天记录异常：', error)
    res.status(500).json({ code: 500, msg: '加载聊天记录失败', error: error.message })
  }
})

// 保存新的聊天消息
router.post('/chat-record/save', (req, res) => {
  try {
    const { roleName, userName } = req.body
    if (!roleName || !userName) {
      return res.status(400).json({ code: 400, msg: 'roleName和userName不能为空' })
    }
    const newMessage = req.body 
    if (!newMessage) {
      return res.status(400).json({ code: 400, msg: '新消息不能为空' })
    }
    const record = saveChatRecord(roleName, userName, newMessage)
    res.json({ code: 200, data: record, msg: '保存聊天记录成功' })
  } catch (error) {
    res.status(500).json({ code: 500, msg: '保存聊天记录失败', error: error.message })
  }
})

// 清空指定角色+用户的聊天记录（核心修复）
router.post('/chat-record/clear', (req, res) => {
  try {
    // 从req.body获取参数
    const { roleName, userName } = req.body
    // 补充参数校验
    if (!roleName || !userName) {
      return res.status(400).json({ code: 400, msg: 'roleName和userName不能为空' })
    }
    const record = clearChatRecord(roleName, userName)
    res.json({ code: 200, data: record, msg: '清空聊天记录成功' })
  } catch (error) {
    console.error('清空聊天记录异常：', error)
    res.status(500).json({ code: 500, msg: '清空聊天记录失败', error: error.message })
  }
})

export default router