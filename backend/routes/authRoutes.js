import express from 'express';
import { registerUser, loginUser, getMe, protect } from '../controllers/authcontroller.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected route
router.get('/me', protect, getMe);

export default router;

