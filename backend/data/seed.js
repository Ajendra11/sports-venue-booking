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
        name: 'Grand Cricket Stadium A',
        sportType: 'Cricket',
        location: 'Downtown City A',
        pricePerHour: 150,
        imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da',
        availability: true
      },
      {
        name: 'Indoor Arena B',
        sportType: 'Futsal',
        location: 'North Sector City B',
        pricePerHour: 80,
        imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b',
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