// Must be first: anchors .env loading to the backend directory, whatever
// working directory the process was launched from.
import './config/env.js';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import venueRoutes from './routes/venueRoutes.js';
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { connectToDatabase } from './config/db.js';

const app = express();

// 1. CORS — an unrecognised browser origin is rejected, not waved through.
const allowedOrigins = [
  'https://sportsvenuebooking.netlify.app',
  process.env.FRONTEND_URL,
  'http://localhost:5173', // Default Vite port
  'http://localhost:4173', // Vite preview
  'http://localhost:3000'
].filter(Boolean);

// Any localhost port is fine while developing; production stays on the list above.
const isLocalhost = (origin) => /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

app.use(cors({
  origin: (origin, callback) => {
    // Requests with no Origin header (curl, Postman, server-to-server, health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (process.env.NODE_ENV !== 'production' && isLocalhost(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true // Allow cookies and authorization headers
}));

// 2. Body Parsers & Cookie Parser
app.use(express.json());
app.use(cookieParser());

// 3. Root & Health
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Sports Venue Booking API is running',
    timestamp: new Date()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy', timestamp: new Date() });
});

// 4. API Routes
app.use('/api/venues', venueRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// 5. 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ error: `Not Found - ${req.originalUrl}` });
});

// 6. Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);

  // CORS rejections are a client problem, not a server fault
  const statusCode = /not allowed by CORS/.test(err.message)
    ? 403
    : (res.statusCode === 200 ? 500 : res.statusCode);

  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// 7. Boot: only start listening once the database is actually connected
const PORT = process.env.PORT || 3000;

connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

export default app;
