import mongoose from 'mongoose';
import Booking from '../models/bookingModel.js';
import Venue from '../models/venueModel.js';
import Auth from '../models/authModel.js';
import { ALL_SLOTS } from '../config/slots.js';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * @desc    Every booking across all users, with optional filters
 * @route   GET /api/admin/bookings?venueId=&date=&search=&scope=upcoming|past|all
 * @access  Admin
 */
export const getAllBookings = async (req, res, next) => {
  try {
    const { venueId, date, search, scope = 'all' } = req.query;

    const filter = { status: 'confirmed' };

    if (venueId) {
      if (!isValidId(venueId)) {
        return res.status(400).json({ error: 'Invalid venue id' });
      }
      filter.venue = venueId;
    }

    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
      }
      filter.date = date;
    }

    const today = new Date().toISOString().split('T')[0];
    if (scope === 'upcoming') filter.date = { ...(filter.date ? {} : {}), $gte: today };
    if (scope === 'past') filter.date = { $lt: today };

    const bookings = await Booking.find(filter)
      .populate('user', 'name email phone')
      .sort({ date: -1, startTime: 1 })
      .limit(500);

    // Name/email search runs after populate, since it spans the joined user doc
    const term = search?.trim().toLowerCase();
    const filtered = term
      ? bookings.filter((b) =>
          [b.venueName, b.user?.name, b.user?.email]
            .filter(Boolean)
            .some((v) => v.toLowerCase().includes(term))
        )
      : bookings;

    res.json({
      count: filtered.length,
      bookings: filtered,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel any user's booking (customer-service action)
 * @route   DELETE /api/admin/bookings/:id
 * @access  Admin
 */
export const adminCancelBooking = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid booking id' });
    }

    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking cancelled successfully', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Platform analytics — totals, per-venue performance, recent trend
 * @route   GET /api/admin/analytics
 * @access  Admin
 */
export const getAnalytics = async (req, res, next) => {
  try {
    const [summaryAgg, byVenue, bySport, byDate] = await Promise.all([
      Booking.aggregate([
        { $match: { status: 'confirmed' } },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            totalRevenue: { $sum: '$totalCost' },
            totalHours: { $sum: '$duration' },
            avgDuration: { $avg: '$duration' },
          },
        },
      ]),

      Booking.aggregate([
        { $match: { status: 'confirmed' } },
        {
          $group: {
            _id: '$venue',
            venueName: { $first: '$venueName' },
            bookings: { $sum: 1 },
            revenue: { $sum: '$totalCost' },
            hours: { $sum: '$duration' },
          },
        },
        { $sort: { revenue: -1 } },
      ]),

      // Sport type lives on the venue, so join before grouping
      Booking.aggregate([
        { $match: { status: 'confirmed' } },
        {
          $lookup: {
            from: 'venues',
            localField: 'venue',
            foreignField: '_id',
            as: 'venueDoc',
          },
        },
        { $unwind: '$venueDoc' },
        {
          $group: {
            _id: '$venueDoc.sportType',
            bookings: { $sum: 1 },
            revenue: { $sum: '$totalCost' },
          },
        },
        { $sort: { revenue: -1 } },
      ]),

      Booking.aggregate([
        { $match: { status: 'confirmed' } },
        {
          $group: {
            _id: '$date',
            bookings: { $sum: 1 },
            revenue: { $sum: '$totalCost' },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 60 },
      ]),
    ]);

    const [venueCount, userCount, adminCount] = await Promise.all([
      Venue.countDocuments({}),
      Auth.countDocuments({}),
      Auth.countDocuments({ role: 'admin' }),
    ]);

    // Occupancy = booked hours today against total bookable hours today
    const today = new Date().toISOString().split('T')[0];
    const todayAgg = await Booking.aggregate([
      { $match: { status: 'confirmed', date: today } },
      { $group: { _id: null, hours: { $sum: '$duration' }, bookings: { $sum: 1 } } },
    ]);

    const capacityToday = venueCount * ALL_SLOTS.length;
    const bookedToday = todayAgg[0]?.hours || 0;

    res.json({
      summary: {
        ...(summaryAgg[0] || {
          totalBookings: 0,
          totalRevenue: 0,
          totalHours: 0,
          avgDuration: 0,
        }),
        venueCount,
        userCount,
        adminCount,
      },
      today: {
        date: today,
        bookings: todayAgg[0]?.bookings || 0,
        bookedHours: bookedToday,
        capacityHours: capacityToday,
        occupancyPct: capacityToday ? Math.round((bookedToday / capacityToday) * 100) : 0,
      },
      byVenue,
      bySport,
      byDate,
    });
  } catch (error) {
    next(error);
  }
};
