import express from 'express';
import { protect, adminOnly } from '../middlewares/authMiddlewares.js';
import { getAllBookings, adminCancelBooking, getAnalytics } from '../controllers/adminController.js';

const router = express.Router();

// Every route below is admin-only
router.use(protect, adminOnly);

router.get('/bookings', getAllBookings);
router.delete('/bookings/:id', adminCancelBooking);
router.get('/analytics', getAnalytics);

export default router;
