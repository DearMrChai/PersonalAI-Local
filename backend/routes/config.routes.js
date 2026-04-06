import express from 'express'
import { getConfig, saveConfig } from '../service/config.service.js'
const router = express.Router()

// 获取配置
router.get('/config', (req, res) => {
  res.json(getConfig())
})

// 保存配置
router.post('/config', (req, res) => {
  const ok = saveConfig(req.body)
  res.json({ ok: ok ? 1 : 0 })
})

export default router