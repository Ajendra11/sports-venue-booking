import express from 'express';
import { registerUser, loginUser, logoutUser, getMe, getSignupConfig } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddlewares.js';

const router = express.Router();

// Public routes
router.get('/signup-config', getSignupConfig);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Protected route
router.get('/me', protect, getMe);

export default router;