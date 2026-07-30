import express from 'express';
import { protect } from '../middlewares/authMiddlewares.js';
import { getMyBookings, getBookingStats, createBooking, cancelBooking, deleteBooking } from '../controllers/bookingController.js';

const router = express.Router();

// All booking routes are protected - require authentication
router.use(protect);

router.get('/', getMyBookings);
router.get('/stats', getBookingStats);
router.post('/', createBooking);
router.put('/:id/cancel', cancelBooking);
router.delete('/:id', deleteBooking);

export default router;