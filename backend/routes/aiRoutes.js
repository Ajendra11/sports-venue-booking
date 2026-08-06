import express from 'express';
import { handleAiQuery } from '../controllers/aiController.js';

const router = express.Router();

// POST /api/ai/recommend
router.post('/recommend', handleAiQuery);

export default router;