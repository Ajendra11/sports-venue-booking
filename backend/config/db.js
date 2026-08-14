import mongoose from 'mongoose';
import { requireEnv } from './env.js';

const uri = requireEnv('MONGODB_URI');

mongoose.set('strictQuery', true);

export async function connectToDatabase() {
  try {
    console.log('Connecting to MongoDB Atlas...');

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // Throws a clear error after 5 seconds if blocked
    });

    console.log('✓ Mongoose successfully connected to MongoDB');
    return mongoose.connection;
  } catch (error) {
    // Booting without a database leaves every route failing at runtime with an
    // opaque 500, so fail loudly at startup instead.
    console.error('✗ Mongoose connection error:', error.message);
    process.exit(1);
  }
}

// Runtime event listeners
mongoose.connection.on('error', (err) => {
  console.error('✗ MongoDB runtime connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('! MongoDB disconnected');
});

export default mongoose;
