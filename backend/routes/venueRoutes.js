import express from 'express';
import {
  getVenues,
  getVenueById,
  getVenueAvailability,
  addVenue,
  updateVenue,
  deleteVenue
} from '../controllers/venueController.js';
import { protect, adminOnly } from '../middlewares/authMiddlewares.js';
import { validateVenue, handleValidationErrors } from '../validators/venueValidator.js';

const router = express.Router();

// Public reads
router.get('/', getVenues);
router.get('/:id', getVenueById);
router.get('/:id/availability', getVenueAvailability);

// Catalogue changes are administrative — regular accounts browse and book only.
router.post('/', protect, adminOnly, validateVenue, handleValidationErrors, addVenue);
router.put('/:id', protect, adminOnly, validateVenue, handleValidationErrors, updateVenue);
router.delete('/:id', protect, adminOnly, deleteVenue);

export default router;
