import mongoose from 'mongoose';

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true },
  amenities: [{ type: String }],
  availability: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  }
}, { timestamps: true });

const Venue = mongoose.model('Venue', venueSchema);

export default Venue;   