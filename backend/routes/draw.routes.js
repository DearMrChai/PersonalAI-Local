import express from 'express'
import { generateImage, getDrawTask, getDrawProgress } from '../service/draw.service.js'
const router = express.Router()

// 生成图片
router.post('/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body
    const result = await generateImage(prompt)
    res.json(result)
  } catch (e) {
    res.json({ success: false, msg: e.message })
  }
})

// 查询任务状态
router.get('/task/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params
    const result = await getDrawTask(taskId)
    res.json(result)
  } catch (e) {
    res.json({ done: false })
  }
})

// 获取绘图进度
router.get('/progress', async (req, res) => {
  const progress = await getDrawProgress()
  res.json(progress)
})

export default router