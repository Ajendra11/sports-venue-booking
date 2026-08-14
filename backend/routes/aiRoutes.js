import express from 'express';
import { getRecommendations, handleAiQuery } from '../controllers/aiController.js';

const router = express.Router();

// POST /api/ai/recommend — structured top-3 recommendations (Week 7)
router.post('/recommend', getRecommendations);

// POST /api/ai/chat — free-form assistant used by the chat drawer
router.post('/chat', handleAiQuery);

export default router;
