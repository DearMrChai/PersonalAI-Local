import express from 'express';
import {
  getAllTagsController,
  createOrGetTagController,
  getTagDetailController,
  updateTagController,
  deleteTagController
} from '../controllers/tag.controllers.js';

const router = express.Router();

/**
 * @swagger
 * /tags/getAllTags:
 *   get:
 *     summary: 获取所有标签列表
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: 成功返回标签列表
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
 *                   example: "获取标签列表成功"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tag'
 */
router.get('/tags/getAllTags', getAllTagsController);

/**
 * @swagger
 * /tags/createOrGetTag:
 *   post:
 *     summary: 创建或获取标签（Upsert）
 *     description: 如果标签已存在则直接返回，不存在则创建
 *     tags: [Tags]
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
 *                 description: 标签名称
 *               type:
 *                 type: string
 *                 description: 标签类型 (general/kink/personality)
 *                 enum: [general, kink, personality]
 *                 default: general
 *     responses:
 *       200:
 *         description: 操作成功
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
 *                   example: "标签处理成功"
 *                 data:
 *                   $ref: '#/components/schemas/Tag'
 *       400:
 *         description: 标签名称不能为空
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/tags/createOrGetTag', createOrGetTagController);

/**
 * @swagger
 * /tags/getTagDetail:
 *   get:
 *     summary: 获取标签详情
 *     tags: [Tags]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 标签ID
 *     responses:
 *       200:
 *         description: 成功返回标签详情
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
 *                   example: "获取标签详情成功"
 *                 data:
 *                   $ref: '#/components/schemas/Tag'
 *       404:
 *         description: 标签不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/tags/getTagDetail', getTagDetailController);

/**
 * @swagger
 * /tags/updateTag:
 *   post:
 *     summary: 更新标签
 *     tags: [Tags]
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
 *                 description: 标签ID
 *               name:
 *                 type: string
 *                 description: 新标签名称
 *               type:
 *                 type: string
 *                 description: 新标签类型
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
 *                   example: "更新标签成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: 标签ID不能为空
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/tags/updateTag', updateTagController);

/**
 * @swagger
 * /tags/deleteTag:
 *   post:
 *     summary: 删除标签
 *     tags: [Tags]
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
 *                 description: 标签ID
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
 *                   example: "删除标签成功"
 *                 data:
 *                   type: null
 *       400:
 *         description: 标签ID不能为空
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/tags/deleteTag', deleteTagController);

export default router;