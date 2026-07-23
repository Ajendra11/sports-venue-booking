import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { sampleVenues } from './data/venues.js';
import venueRoutes from './routes/venueRoutes.js'; 
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import "./config/db.js"; // Correct path to your Mongoose setup

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/venues', venueRoutes);  
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
