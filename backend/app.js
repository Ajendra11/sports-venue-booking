import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { sampleVenues } from './data/venues.js';
import venueRoutes from './routes/venueRoutes.js'; 
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import "./config/db.js"; // Correct path to your Mongoose setup
import cookieParser from 'cookie-parser';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  return: true,   
  credentials: true, // Allow cookies to be sent
}));

// Sample route to get venues
app.get('/api/sample-venues', (req, res) => {
  res.json(sampleVenues);
});
// Routes
app.use('/api/venues', venueRoutes);  
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
