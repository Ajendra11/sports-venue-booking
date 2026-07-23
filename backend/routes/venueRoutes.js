import express from 'express';
import { getVenues, getVenueById, addVenue, updateVenue, deleteVenue } from '../controllers/venueController.js';
import { validateVenue, handleValidationErrors } from '../validators/venueValidator.js';

const router = express.Router();

router.get('/', getVenues);
router.get('/:id', getVenueById);

// Middleware validation sequences are preserved alongside the updated database save logic
router.post('/', validateVenue, handleValidationErrors, addVenue);

// Route to handle editing / updating venues
router.put('/:id', validateVenue, handleValidationErrors, updateVenue);

// Route to handle deleting venues
router.delete('/:id', deleteVenue);

export default router;
