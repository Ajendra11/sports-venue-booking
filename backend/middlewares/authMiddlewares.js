import jwt from 'jsonwebtoken';
import Auth from '../models/authModel.js';
import { JWT_SECRET } from '../config/jwt.js';

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check for Bearer token in headers
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authorized, no token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find user in MongoDB without returning password
    req.user = await Auth.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized, user not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized, invalid or expired token' });
  }
};

/**
 * Restricts a route to admin accounts. Always chain after `protect`, which
 * is what populates req.user.
 */
export const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
};
