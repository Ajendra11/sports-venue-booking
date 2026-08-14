import mongoose from 'mongoose';

// 1. Define the structural blueprint for a venue document in MongoDB
const venueSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sportType: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  pricePerHour: { type: Number, required: true, min: 0 },
  facilities: { type: [String], default: [] },
  imageUrl: { type: String, trim: true },
  availability: { type: Boolean, default: true }
}, { timestamps: true });

// 2. Export the compiled Mongoose model
// Mongoose will automatically look for a collection named "venues" in Atlas
const Venue = mongoose.model('Venue', venueSchema);
export default Venue;
