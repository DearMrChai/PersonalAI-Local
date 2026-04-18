import express from 'express';
import {
  getAllCharactersController,
  getCharacterDetailController,
  createCharacterController,
  updateCharacterController,
  deleteCharacterController
} from '../controllers/character.controllers.js';

const router = express.Router();

/**
 * @swagger
 * /characters/getAllCharacters:
 *   get:
 *     summary: 获取全部角色列表
 *     tags: [Characters]
 *     responses:
 *       200:
 *         description: 成功返回角色列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 msg:
 *                   type: string
 *                   example: "获取角色列表成功"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Character'
 */
router.get('/characters/getAllCharacters', getAllCharactersController);

/**
 * @swagger
 * /characters/getCharacterDetail:
 *   get:
 *     summary: 获取单个角色详情
 *     tags: [Characters]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 角色ID
 *     responses:
 *       200:
 *         description: 成功返回角色详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 msg:
 *                   type: string
 *                   example: "获取角色详情成功"
 *                 data:
 *                   $ref: '#/components/schemas/Character'
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 角色不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/characters/getCharacterDetail', getCharacterDetailController);

/**
 * @swagger
 * /characters/createCharacter:
 *   post:
 *     summary: 新增角色
 *     tags: [Characters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: 角色名称
 *               avatar:
 *                 type: string
 *                 description: 头像URL
 *               short_bio:
 *                 type: string
 *                 description: 短简介
 *               description:
 *                 type: string
 *                 description: 详细描述
 *               tags:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 关联的标签ID数组
 *               kinks:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 癖好标签
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 msg:
 *                   type: string
 *                   example: "创建角色成功"
 *                 data:
 *                   $ref: '#/components/schemas/Character'
 *       400:
 *         description: 参数缺失
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/characters/createCharacter', createCharacterController);

/**
 * @swagger
 * /characters/updateCharacter:
 *   post:
 *     summary: 更新角色
 *     tags: [Characters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 角色ID
 *               name:
 *                 type: string
 *                 description: 角色名称
 *               tags:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 更新后的标签ID数组（全量替换）
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 msg:
 *                   type: string
 *                   example: "更新角色成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: 角色ID不能为空
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/characters/updateCharacter', updateCharacterController);

/**
 * @swagger
 * /characters/deleteCharacter:
 *   post:
 *     summary: 删除角色
 *     tags: [Characters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 角色ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 msg:
 *                   type: string
 *                   example: "删除角色成功"
 *                 data:
 *                   type: null
 *       400:
 *         description: 角色ID不能为空
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/characters/deleteCharacter', deleteCharacterController);

export default router;