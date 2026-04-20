import express from 'express';
import { streamChat } from '../controllers/chat.controller.js';

const router = express.Router();

// POST /api/chat/stream
router.post('/chat/stream', streamChat);

export default router;