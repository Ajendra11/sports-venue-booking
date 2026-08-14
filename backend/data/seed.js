import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import '../config/env.js';
import Venue from '../models/venueModel.js';
import Booking from '../models/bookingModel.js';

export const sampleVenues = [
  {
    name: 'Apex Futsal Arena',
    sportType: 'Futsal',
    location: 'Gyaneshwor, Kathmandu',
    pricePerHour: 4500,
    facilities: ['Floodlights', 'Changing Rooms', 'Parking', 'Drinking Water'],
    imageUrl: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=60',
    availability: true
  },
  {
    name: 'Smash Badminton Club',
    sportType: 'Badminton',
    location: 'Chabahil, Kathmandu',
    pricePerHour: 2000,
    facilities: ['Wooden Court', 'Air Conditioning', 'Racket Rental', 'Locker Room'],
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=60',
    availability: true
  },
  {
    name: 'Net Rippers Basketball Court',
    sportType: 'Basketball',
    location: 'Bouddha, Kathmandu',
    pricePerHour: 3500,
    facilities: ['Outdoor Court', 'Floodlights', 'Seating Area', 'Parking'],
    imageUrl: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=800&auto=format&fit=crop&q=60',
    availability: true
  },
  {
    name: 'Deuce Tennis Center',
    sportType: 'Tennis',
    location: 'Sankhamul, Kathmandu',
    pricePerHour: 4000,
    facilities: ['Clay Court', 'Coaching Available', 'Changing Rooms', 'Cafe'],
    imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=60',
    availability: true
  },
  {
    name: 'Olympic Splash Pool',
    sportType: 'Swimming',
    location: 'Nagpokhari, Kathmandu',
    pricePerHour: 5000,
    facilities: ['Olympic Size', 'Heated Water', 'Lifeguard', 'Showers', 'Parking'],
    imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&auto=format&fit=crop&q=60',
    availability: true
  }
];

async function seedDatabase() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in your environment variables.');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB for seeding.');

    // Clear existing data to prevent duplicate builds
    const { deletedCount } = await Venue.deleteMany({});
    console.log(`✓ Cleared ${deletedCount} existing venue(s) from the cloud collection.`);

    await Venue.insertMany(sampleVenues);
    console.log(`✓ Seeded ${sampleVenues.length} sample venues into Atlas.`);

    // Bookings that pointed at the venues we just replaced are now orphans:
    // they'd still count toward revenue while joining to no venue, so the
    // analytics totals would silently stop reconciling.
    const liveVenueIds = (await Venue.find({}).select('_id')).map((v) => v._id);
    const { deletedCount: orphaned } = await Booking.deleteMany({
      venue: { $nin: liveVenueIds }
    });
    if (orphaned > 0) {
      console.log(`✓ Removed ${orphaned} booking(s) referencing venues that no longer exist.`);
    }

    await mongoose.connection.close();
    console.log('✓ Database connection closed cleanly.');
  } catch (error) {
    console.error('✗ Error seeding database:', error.message);
    process.exit(1);
  }
}

// ES Module equivalent to check if file is run directly via node seed.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase();
}

export default seedDatabase;
