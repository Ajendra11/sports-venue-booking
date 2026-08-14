import mongoose from 'mongoose';
import Booking from '../models/bookingModel.js';
import Venue from '../models/venueModel.js';
import { expandSlots, formatSlotRange, CLOSING_HOUR, OPENING_HOUR } from '../config/slots.js';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Get logged-in user's bookings
// @route   GET /api/bookings
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id, status: 'confirmed' })
      .sort({ date: 1, startTime: 1 });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new booking
// @route   POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const { venueId, date, startTime, duration } = req.body;

    if (!venueId || !date || !startTime || !duration) {
      return res.status(400).json({ error: 'venueId, date, startTime and duration are all required' });
    }

    if (!isValidId(venueId)) {
      return res.status(400).json({ error: 'Invalid venue id' });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
    }

    // Reject bookings in the past
    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      return res.status(400).json({ error: 'Cannot book a date in the past' });
    }

    // Verify venue exists and get its price
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Resolve the requested slot range, rejecting anything outside opening hours
    const slots = expandSlots(startTime, duration);
    if (!slots) {
      return res.status(400).json({
        error: `Booking must start on the hour and finish within opening hours (${String(OPENING_HOUR).padStart(2, '0')}:00–${CLOSING_HOUR}:00)`
      });
    }

    // Reject overlaps with any existing confirmed booking for this venue/date
    const clash = await Booking.findOne({
      venue: venueId,
      date,
      status: 'confirmed',
      slots: { $in: slots }
    });

    if (clash) {
      const conflicting = clash.slots.filter((s) => slots.includes(s));
      return res.status(409).json({
        error: `That time is already booked (${conflicting.join(', ')}). Please pick another slot.`
      });
    }

    // Cost is always recomputed server-side, never trusted from the client
    const totalCost = venue.pricePerHour * Number(duration);

    // Create booking scoped to logged-in user
    const booking = await Booking.create({
      user: req.user._id,
      venue: venueId,
      venueName: venue.name,
      date,
      startTime,
      duration: Number(duration),
      slots,
      slot: formatSlotRange(startTime, duration),
      totalCost
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Cancel and remove a booking, freeing its slots
// @route   DELETE /api/bookings/:id
export const deleteBooking = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid booking id' });
    }

    const booking = await Booking.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or not authorized' });
    }

    res.json({ message: 'Booking cancelled successfully', id: req.params.id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
