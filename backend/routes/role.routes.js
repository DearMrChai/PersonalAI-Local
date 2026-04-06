import express from 'express'
import { getRoles, upsertRole, deleteRole } from '../service/role.service.js'
const router = express.Router()

// 获取角色列表
router.get('/roles', (req, res) => {
  res.json(getRoles())
})

// 新增/更新角色
router.post('/roles', (req, res) => {
  const ok = upsertRole(req.body)
  res.json({ ok: ok ? 1 : 0 })
})

// 删除角色
router.delete('/roles/:name', (req, res) => {
  const ok = deleteRole(req.params.name)
  res.json({ ok: ok ? 1 : 0 })
})

export default router