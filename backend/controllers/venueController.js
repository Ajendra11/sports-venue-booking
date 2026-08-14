import mongoose from 'mongoose';
import Venue from '../models/venueModel.js';
import Booking from '../models/bookingModel.js';
import { ALL_SLOTS } from '../config/slots.js';

// Guard against malformed ids reaching Mongoose, which would otherwise
// throw a CastError and surface as a confusing 500.
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Fetch all venues from MongoDB Atlas
export const getVenues = async (req, res, next) => {
  try {
    const venues = await Venue.find({}).sort({ createdAt: -1 });
    res.status(200).json(venues);
  } catch (error) {
    next(error);
  }
};

// Find a single venue document by ID
export const getVenueById = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid venue id' });
    }

    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    res.status(200).json(venue);
  } catch (error) {
    next(error);
  }
};

// @desc    Hourly slot availability for a venue on a given date
// @route   GET /api/venues/:id/availability?date=YYYY-MM-DD
export const getVenueAvailability = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid venue id' });
    }

    const { date } = req.query;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'A valid ?date=YYYY-MM-DD query parameter is required' });
    }

    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Union of every slot already taken by a confirmed booking that day
    const bookings = await Booking.find({
      venue: venue._id,
      date,
      status: 'confirmed'
    }).select('slots');

    const takenSlots = new Set(bookings.flatMap((b) => b.slots));

    // Slots earlier today have already passed and cannot be booked
    const now = new Date();
    const isToday = date === now.toISOString().split('T')[0];
    const currentHour = now.getHours();

    const slots = ALL_SLOTS.map((slot) => {
      const hour = parseInt(slot, 10);
      const isPast = isToday && hour <= currentHour;
      return {
        time: slot,
        booked: takenSlots.has(slot),
        past: isPast,
        available: !takenSlots.has(slot) && !isPast
      };
    });

    res.status(200).json({
      venueId: venue._id,
      venueName: venue.name,
      date,
      pricePerHour: venue.pricePerHour,
      slots
    });
  } catch (error) {
    next(error);
  }
};

// Save a brand new venue document down into the collection
export const addVenue = async (req, res) => {
  try {
    const { name, sportType, location, pricePerHour, facilities, imageUrl, availability } = req.body;

    const savedVenue = await Venue.create({
      name,
      sportType,
      location,
      pricePerHour,
      facilities,
      imageUrl,
      availability
    });

    res.status(201).json(savedVenue);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PUT / update venue
export const updateVenue = async (req, res) => {
  const { id } = req.params;
  try {
    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid venue id' });
    }

    const updated = await Venue.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true } // Returns the newly updated document
    );

    if (!updated) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// DELETE / delete venue
export const deleteVenue = async (req, res) => {
  const { id } = req.params;
  try {
    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid venue id' });
    }

    const deleted = await Venue.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Keep bookings consistent with the venue that no longer exists
    await Booking.deleteMany({ venue: id });

    return res.json({ message: 'Venue deleted successfully' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
