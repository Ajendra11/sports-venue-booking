import jwt from 'jsonwebtoken';
import Auth from '../models/authModel.js';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Use secure cookies in production // Adjust based on your frontend and backend domains
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};  

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await Auth.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user
    const user = await Auth.create({ name, email, password, phone });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly select password (excluded by default in schema)
    const user = await Auth.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password using the model's instance method
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Get current logged-in user profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await Auth.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Protect middleware - verify JWT token
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      req.user = await Auth.findById(decoded.id);
      if (!req.user) {
        return res.status(401).json({ error: 'Not authorized, user not found' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token provided' });
  }
};
