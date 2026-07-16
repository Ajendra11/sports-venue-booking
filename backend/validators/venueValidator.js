import {body,validationResult} from 'express-validator'

export const validateVenue = [
  body('name').notEmpty().withMessage('Name is required'),
  body('sportType').notEmpty().withMessage('Sport type is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('pricePerHour').isFloat({ min: 0 }).withMessage('Price per hour must be a positive number')
]

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}



export { handleValidationErrors }; 


