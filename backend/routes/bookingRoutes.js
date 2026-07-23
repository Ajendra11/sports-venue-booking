import express from 'express';
import { protect } from '../controllers/authcontroller.js';
import { getMyBookings, createBooking, cancelBooking } from '../controllers/bookingController.js';

const router = express.Router();

// All booking routes are protected - require authentication
router.use(protect);

router.get('/', getMyBookings);
router.post('/', createBooking);
router.put('/:id/cancel', cancelBooking);

export default router;

