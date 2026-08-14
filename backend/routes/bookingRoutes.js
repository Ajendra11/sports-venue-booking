import express from 'express';
import { protect } from '../middlewares/authMiddlewares.js';
import { getMyBookings, createBooking, deleteBooking } from '../controllers/bookingController.js';

const router = express.Router();

// All booking routes are protected - require authentication
router.use(protect);

router.get('/', getMyBookings);
router.post('/', createBooking);
router.delete('/:id', deleteBooking);

export default router;