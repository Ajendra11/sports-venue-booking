import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { sampleVenues } from './data/venues.js';
import venueRoutes from './routes/venueRoutes.js'; 
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import aiRoutes from './routes/aiRoutes.js'; // Import AI routes
import "./config/db.js"; // Mongoose setup

dotenv.config();

const app = express();

// 1. CORS Middleware - Explicitly includes Netlify frontend domain
const allowedOrigins = [
  'https://sportsvenuebooking.netlify.app',
  process.env.FRONTEND_URL,
  'http://localhost:5173', // Default Vite port
  'http://localhost:3000'  // React default port
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback to allow connection if origin check fails
    }
  },
  credentials: true, // Allow cookies and authorization headers
}));

// 2. Body Parsers & Cookie Parser
app.use(express.json());
app.use(cookieParser());

// 3. Root, Health & Sample Routes
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Sports Venue Booking API is running live on Render!',
    timestamp: new Date()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy', timestamp: new Date() });
});

app.get('/api/sample-venues', (req, res) => {
  res.json(sampleVenues);
});

// 4. API Routes
app.use('/api/venues', venueRoutes);  
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ai', aiRoutes); // <--- Registered Groq AI Route here

// 5. 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({ error: `Not Found - ${req.originalUrl}` });
});

// 6. Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// 7. Dynamic Port for Render Deployment
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;