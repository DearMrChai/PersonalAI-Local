import express from 'express'
import { getUsers, upsertUser } from '../service/user.service.js'
const router = express.Router()

// 获取用户列表
router.get('/getUsers', (req, res) => {
  res.json(getUsers())
})

// 新增/更新用户
router.post('/upsertUser', (req, res) => {
  const ok = upsertUser(req.body)
  res.json({ ok: ok ? 1 : 0 })
})


export default router