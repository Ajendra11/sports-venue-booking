import jwt from 'jsonwebtoken';
import Auth from '../models/authModel.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.js';
import { checkAdminCode, isAdminCodeEnabled } from '../config/adminCode.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Helper to send token response with JSON and Cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      token,
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, adminCode } = req.body;

    // Check if user already exists
    const existingUser = await Auth.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Role is never taken from the request body. The only way to register as
    // an admin is to present the server-side signup code.
    let role = 'user';

    if (adminCode) {
      const result = checkAdminCode(adminCode, req.ip);

      if (result === 'throttled') {
        return res.status(429).json({
          error: 'Too many incorrect admin codes. Please try again in 15 minutes.'
        });
      }
      if (result === 'disabled') {
        return res.status(400).json({
          error: 'Admin registration is not enabled on this server.'
        });
      }
      if (result === 'invalid') {
        return res.status(400).json({ error: 'That admin code is not valid.' });
      }

      role = 'admin';
    }

    const user = await Auth.create({ name, email, password, phone, role });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Whether this server accepts an admin signup code
// @route   GET /api/auth/signup-config
export const getSignupConfig = (req, res) => {
  // Only reports that the field exists — never the code itself
  res.json({ adminCodeEnabled: isAdminCodeEnabled() });
};

// @desc    Login user
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly select password
    const user = await Auth.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
export const logoutUser = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
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