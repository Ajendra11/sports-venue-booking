import Booking from '../models/bookingModel.js';
import Venue from '../models/venueModel.js';

// @desc    Get logged-in user's bookings
// @route   GET /api/bookings
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id, status: 'confirmed' })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get aggregated booking statistics (Week 4 Aggregation Requirement)
// @route   GET /api/bookings/stats
export const getBookingStats = async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      {
        $match: { status: 'confirmed' }
      },
      {
        $group: {
          _id: '$venueName',
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalCost' },
          avgDuration: { $avg: '$duration' }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      }
    ]);

    const summary = await Booking.aggregate([
      {
        $match: { status: 'confirmed' }
      },
      {
        $group: {
          _id: null,
          totalBookingsCount: { $sum: 1 },
          overallRevenue: { $sum: '$totalCost' }
        }
      }
    ]);

    res.json({
      summary: summary[0] || { totalBookingsCount: 0, overallRevenue: 0 },
      byVenue: stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create a new booking
// @route   POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const { venueId, date, startTime, duration } = req.body;

    // Verify venue exists and get its price
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Calculate total cost
    const totalCost = venue.pricePerHour * duration;

    // Create booking scoped to logged-in user
    const booking = await Booking.create({
      user: req.user._id,
      venue: venueId,
      venueName: venue.name,
      date,
      startTime,
      duration,
      totalCost
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id // Ensure the booking belongs to the logged-in user
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or not authorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Delete a booking permanently
// @route   DELETE /api/bookings/:id
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or not authorized' });
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

