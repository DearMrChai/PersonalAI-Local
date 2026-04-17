import express from 'express'
import { getUsers, upsertUser } from '../services/user.service.js'
import createResponse from '../utils/responseUtil.js'

const router = express.Router()

// 获取用户列表
router.get('/getUsers', (req, res) => {
   try {
      const userData = getUsers()
      res.json(createResponse.success(userData, '获取用户列表成功'))
    } catch (error) {
      console.error('获取用户列表接口异常：', error)
      res.json(createResponse.serverError('获取用户列表失败，请重试'))
    }
})

// 新增/更新用户
router.post('/upsertUser', (req, res) => {
  //  try {
  //     const userData = getUsers()
  //     res.json(createResponse.success(userData, '获取用户列表成功'))
  //   } catch (error) {
  //     console.error('获取用户列表接口异常：', error)
  //     res.json(createResponse.serverError('获取用户列表失败，请重试'))
  //   }


  const ok = upsertUser(req.body)
  console.log('upsertUser接口结果：', ok)

  res.json({ ok: ok ? 1 : 0 })
})


export default router