import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { sampleVenues } from './data/venues.js';
import venueRoutes from './routes/venueRoutes.js'; 
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import "./config/db.js"; // Correct path to your Mongoose setup

dotenv.config();

const app = express();

// 1. CORS Middleware (allows requests from frontend or localhost)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173', // Default Vite port
  'http://localhost:3000'  // React default port
].filter(Boolean); // Filters out undefined process.env.FRONTEND_URL if not set

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  credentials: true, // Allow cookies / headers to be sent
}));

// 2. Body Parsers & Cookie Parser
app.use(express.json());
app.use(cookieParser());

// 3. Health & Sample Routes
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is healthy' });
});

app.get('/api/sample-venues', (req, res) => {
  res.json(sampleVenues);
});

// 4. API Routes
app.use('/api/venues', venueRoutes);  
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);

// 5. Dynamic Port for Render Deployment
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});