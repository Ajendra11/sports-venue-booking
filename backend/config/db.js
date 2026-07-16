import { configDotenv } from "dotenv";
import mongoose from "mongoose";

configDotenv();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("✗ Error: MONGODB_URI is not defined in your .env file");
  process.exit(1);
}

mongoose.set('strictQuery', true);

async function connectToDatabase() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    
    // Connects using the URI from your .env file
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // Throws a clear error after 5 seconds if blocked
    });
    
    console.log('✓ Mongoose successfully connected to MongoDB');
  } catch (error) {
    console.error('✗ Mongoose connection error:', error.message);
  }
}

// Runtime event listeners
mongoose.connection.on('error', err => {
  console.error('✗ MongoDB runtime connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('! MongoDB disconnected');
});

connectToDatabase();

export default mongoose;