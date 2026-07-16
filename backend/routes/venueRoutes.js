import express from 'express';
import { getVenues, getVenueById, addVenue, updateVenue } from '../controllers/venueController.js'; // Added updateVenue
import { validateVenue, handleValidationErrors } from '../validators/venueValidator.js';

const router = express.Router();

router.get('/', getVenues);
router.get('/:id', getVenueById);

// Middleware validation sequences are preserved alongside the updated database save logic
router.post('/', validateVenue, handleValidationErrors, addVenue);

// NEW: Route to handle editing / updating venues
router.put('/:id', validateVenue, handleValidationErrors, updateVenue);

export default router;