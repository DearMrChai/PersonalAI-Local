import express from 'express'
import {
  startAllServices,
  stopAllServices,
  getServiceStatus
} from '../service/process.service.js'

const router = express.Router()

// 获取服务状态
router.get('/service/status', async (req, res) => {
  try {
    const status = await getServiceStatus()
    res.json({ ok: true, status })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
})

// 一键启动所有服务
router.post('/service/start-all', async (req, res) => {
  try {
    await startAllServices()
    res.json({ ok: true, msg: '服务启动成功' })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
})

// 一键关闭所有服务
router.post('/service/stop-all', async (req, res) => {
  try {
    await stopAllServices()
    res.json({ ok: true, msg: '服务已关闭' })
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message })
  }
})

export default router