import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Venue from '../models/venueModel.js';

// Load environment variables from the root backend directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function seedDatabase() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in your environment variables.');
    }

    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB for seeding.');

    // Clear existing data to prevent duplicate builds
    await Venue.deleteMany({});
    console.log('✓ Cleared existing venues from the cloud collection.');

    // Sample data aligned exactly to your mongoose schema properties
    const sampleVenues = [
      {
        name: 'Apex Futsal Arena',
        sportType: 'Futsal',
        location: 'Gyaneshwor, Kathmandu',
        pricePerHour: 4500,
        imageUrl: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=500&auto=format&fit=crop&q=60',
        availability: true
      },
      {
        name: 'Smash Badminton Club',
        sportType: 'Badminton',
        location: 'Chabahil, Kathmandu',
        pricePerHour: 2000,
        imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&auto=format&fit=crop&q=60',
        availability: true
      },
      {
        name: 'Net Rippers Basketball Court',
        sportType: 'Basketball',
        location: 'Bouddha, Kathmandu',
        pricePerHour: 3500,
        imageUrl: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=500&auto=format&fit=crop&q=60',
        availability: true
      },
      {
        name: 'Deuce Tennis Center',
        sportType: 'Tennis',
        location: 'Sankhamul, Kathmandu',
        pricePerHour: 4000,
        imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500&auto=format&fit=crop&q=60',
        availability: true
      },
      {
        name: 'Olympic Splash Pool',
        sportType: 'Swimming',
        location: 'Nagpokhari, Kathmandu',
        pricePerHour: 5000,
        imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=500&auto=format&fit=crop&q=60',
        availability: true
      }
    ];

    // Insert sample data
    await Venue.insertMany(sampleVenues);
    console.log('✓ Sample venues seeded successfully into Atlas!');

    // Close the connection clean
    await mongoose.connection.close();
    console.log('✓ Database connection closed cleanly.');
  } catch (error) {
    console.error('✗ Error seeding database:', error);
    process.exit(1);
  }
}

// ES Module equivalent to check if file is run directly via node seed.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase();
}

export default seedDatabase;