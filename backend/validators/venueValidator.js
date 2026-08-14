import { body, validationResult } from 'express-validator';

export const validateVenue = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('sportType').trim().notEmpty().withMessage('Sport type is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('pricePerHour').isFloat({ min: 0 }).withMessage('Price per hour must be a positive number'),
  body('facilities').optional().isArray().withMessage('Facilities must be an array of strings'),
  body('imageUrl').optional({ values: 'falsy' }).isURL().withMessage('Image URL must be a valid URL')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Collapse to a single readable message so the UI can surface it directly
    return res.status(400).json({
      error: errors.array().map((e) => e.msg).join('. '),
      errors: errors.array()
    });
  }
  next();
};

export { handleValidationErrors };
