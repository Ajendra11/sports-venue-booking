import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auth',
    required: [true, 'User is required']
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: [true, 'Venue is required']
  },
  venueName: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: [true, 'Booking date is required'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 hour']
  },
  // Every hourly slot this booking occupies, e.g. ["10:00", "11:00"].
  // Drives availability lookups and overlap detection.
  slots: {
    type: [String],
    required: true,
    validate: [(v) => v.length > 0, 'A booking must occupy at least one slot']
  },
  // Human-readable range, e.g. "10:00 - 12:00".
  slot: {
    type: String,
    required: true
  },
  totalCost: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  }
}, { timestamps: true });

// Availability lookups always filter on venue + date + status.
bookingSchema.index({ venue: 1, date: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
