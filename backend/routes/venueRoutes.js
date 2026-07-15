import express from 'express';
import { getVenues, getVenueById, addVenue } from '../controllers/venueController.js';
import { validateVenue, handleValidationErrors } from '../validators/venueValidator.js';
const router = express.Router();

router.get('/', getVenues);
router.get('/:id', getVenueById);
router.post('/', addVenue, validateVenue, handleValidationErrors);

export default router;

