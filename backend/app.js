import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { sampleVenues } from './data/venues.js';
import router from './routes/venueRoutes.js'; 
import "./config/db.js"; // Correct path to your Mongoose setup

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api/venues', router);  

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});