import express from 'express'
import { getRoles, upsertRole, deleteRole } from '../service/role.service.js'
import createResponse from '../utils/responseUtil.js'

const router = express.Router()

// 获取角色列表
router.get('/roles', (req, res) => {
  try {
    const rolesData = getRoles()
    res.json(createResponse.success(rolesData, '获取角色列表成功'))
  } catch (error) {
    console.error('获取角色列表接口异常：', error)
    res.json(createResponse.serverError('获取角色列表失败，请重试'))
  }
})

// 新增/更新角色
router.post('/saveRoles', (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.json(createResponse.clientError('角色数据格式错误'))
    }
    const ok = upsertRole(req.body)
    console.log('upsertRole接口结果：', ok)
    if (ok) {
      res.json(createResponse.success(null, '角色保存成功'))
    } else {
      res.json(createResponse.clientError('角色保存失败，请检查数据'))
    }
  } catch (error) {
    console.error('保存角色接口异常：', error)
    return res.json(createResponse.serverError('服务器异常，角色保存失败'))
  }
})

// 删除角色
router.post('/delRoles', (req, res) => {
  try {
    if (!req.body || typeof req.body.name !== 'string') {
      return res.json(createResponse.clientError('角色名称格式错误'))
    }
    const ok = deleteRole(req.body.name)
    console.log('deleteRole接口结果：', ok)
    if (ok) {
      res.json(createResponse.success(null, '角色删除成功'))
    } else {
      res.json(createResponse.clientError('角色删除失败，角色可能不存在'))
    }
  } catch (error) {
    console.error('删除角色接口异常：', error)
    return res.json(createResponse.serverError('服务器异常，角色删除失败'))
  }
})

export default router