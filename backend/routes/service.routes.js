import express from 'express'
import { startAllServices, getServiceStatus, stopAllServices } from '../service/process.service.js'
const router = express.Router()

// 一键启动所有服务（llama+ComfyUI）
router.get('/start-services', async (req, res) => {
  try {
    await startAllServices()
    res.json({ ok: 1, msg: '所有服务启动成功' })
  } catch (e) {
    res.json({ ok: 0, msg: e.message })
  }
})

// 获取所有服务状态（核心新增！前端可实时显示）
router.get('/service-status', async (req, res) => {
  const status = await getServiceStatus()
  res.json({ ok: 1, data: status })
})

// 一键关闭所有服务（新增！不用手动关黑窗）
router.get('/stop-services', (req, res) => {
  const ok = stopAllServices()
  res.json({ ok: ok ? 1 : 0, msg: '所有服务已关闭' })
})

export default router