import express from 'express'
import createResponse from '../utils/responseUtil.js'
// 导入service层方法
import {
  getAllCharacters,
  getCharacterDetail,
  createCharacter,
  updateCharacter,
  deleteCharacter
} from '../service/character.service.js';

const router = express.Router()

// 1. GET 获取全部角色列表
router.get('/getAllCharacters', async (req, res) => {
  try {
    const list = await getAllCharacters();
    res.json(createResponse.success(list, '获取角色列表成功'));
  } catch (err) {
    res.json(createResponse.error(err.message));
  }
});

// 2. GET 获取单个角色详情
router.get('/getCharacterDetail', async (req, res) => {
  const { id } = req.query;
  try {
    const info = await getCharacterDetail(id);
    res.json(createResponse.success(info, '获取角色详情成功'));
  } catch (err) {
    res.json(createResponse.error(err.message));
  }
});

// 3. POST 新增角色
router.post('/createCharacter', async (req, res) => {
  const body = req.body;
  try {
    const result = await createCharacter(body);
    res.json(createResponse.success(result, '创建角色成功'));
  } catch (err) {
    console.error('创建角色错误：', err);
    res.json(createResponse.error(err.message));
  }
});

// 4. POST 更新角色
router.post('/updateCharacter', async (req, res) => {
  const body = req.body;
  try {
    await updateCharacter(body);
    res.json(createResponse.success({}, '更新角色成功'));
  } catch (err) {
    res.json(createResponse.error(err.message));
  }
});

// 5. POST 删除角色
router.post('/deleteCharacter', async (req, res) => {
  const { id } = req.body;
  try {
    await deleteCharacter(id);
    res.json(createResponse.success({}, '删除角色成功'));
  } catch (err) {
    res.json(createResponse.error(err.message));
  }
});

export default router;