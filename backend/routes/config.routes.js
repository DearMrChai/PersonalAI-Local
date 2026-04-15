import express from 'express'
import { getConfig, saveConfig } from '../service/config.service.js'
import createResponse from '../utils/responseUtil.js'

const router = express.Router()

// 获取配置接口（标准化返回）
router.get('/config', (req, res) => {
  try {
    const configData = getConfig()
    res.json(createResponse.success(configData, '获取配置成功'))
  } catch (error) {
    console.error('获取配置接口异常：', error)
    res.json(createResponse.serverError('获取配置失败，请重试'))
  }
})

// 保存配置接口（标准化返回）
router.post('/config', (req, res) => {
  try {
    // 基础参数校验（可选，根据业务补充）
    if (!req.body || typeof req.body !== 'object') {
      return res.json(createResponse.clientError('配置参数格式错误'))
    }
    const ok = saveConfig(req.body)
    if (ok) {
      res.json(createResponse.success(null, '配置保存成功'))
    } else {
      res.json(createResponse.clientError('配置保存失败，请检查参数'))
    }
  } catch (error) {
    console.error('保存配置接口异常：', error)
    res.json(createResponse.serverError('服务器异常，配置保存失败'))
  }
})

export default router