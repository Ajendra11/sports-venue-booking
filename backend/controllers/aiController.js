import { askGroq, recommendVenues } from '../services/groqAPI.js';
import Venue from '../models/venueModel.js';
import Booking from '../models/bookingModel.js';
import { ALL_SLOTS } from '../config/slots.js';

/**
 * Attach the still-free slots for `date` to each venue, so the model can
 * factor real availability into its recommendations.
 */
const withAvailability = async (venues, date) => {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return venues.map((v) => ({ ...v.toObject(), availableSlots: null }));
  }

  const bookings = await Booking.find({ date, status: 'confirmed' }).select('venue slots');

  const takenByVenue = new Map();
  for (const b of bookings) {
    const key = String(b.venue);
    if (!takenByVenue.has(key)) takenByVenue.set(key, new Set());
    for (const s of b.slots) takenByVenue.get(key).add(s);
  }

  return venues.map((v) => {
    const taken = takenByVenue.get(String(v._id)) || new Set();
    return {
      ...v.toObject(),
      availableSlots: ALL_SLOTS.filter((s) => !taken.has(s))
    };
  });
};

/**
 * @desc    Structured top-3 venue recommendations based on user preferences
 * @route   POST /api/ai/recommend
 * @access  Public
 */
export const getRecommendations = async (req, res) => {
  try {
    const { sportType, budget, location, date, notes } = req.body || {};

    const venues = await Venue.find({});
    if (venues.length === 0) {
      return res.status(200).json({
        success: true,
        summary: 'There are no venues in the catalogue yet, so there is nothing to recommend.',
        recommendations: []
      });
    }

    const enriched = await withAvailability(venues, date);
    const result = await recommendVenues({ sportType, budget, location, date, notes }, enriched);

    return res.status(200).json({
      success: true,
      summary: result.summary,
      recommendations: result.recommendations
    });
  } catch (error) {
    console.error('AI Recommend Error:', error.message);
    return res.status(502).json({
      success: false,
      error: 'The recommendation service is unavailable right now. Please try again.',
      details: error.message
    });
  }
};

/**
 * @desc    Free-form multi-turn chat assistant grounded in live venue data
 * @route   POST /api/ai/chat
 * @access  Public
 */
export const handleAiQuery = async (req, res) => {
  try {
    const { messages, prompt } = req.body || {};

    // Support both multi-turn chat array (messages) and single prompt input
    let conversation = [];

    if (Array.isArray(messages) && messages.length > 0) {
      conversation = messages
        .filter((m) => m && typeof m.content === 'string')
        .map(({ role, content }) => ({
          role: role === 'assistant' ? 'assistant' : 'user',
          content
        }));
    } else if (typeof prompt === 'string' && prompt.trim()) {
      conversation = [{ role: 'user', content: prompt.trim() }];
    } else {
      return res.status(400).json({
        success: false,
        error: 'Please provide either a "prompt" string or a "messages" array.'
      });
    }

    const venues = await Venue.find({});
    const enriched = await withAvailability(venues, new Date().toISOString().split('T')[0]);
    const reply = await askGroq(conversation, enriched);

    return res.status(200).json({ success: true, answer: reply });
  } catch (error) {
    console.error('AI Chat Error:', error.message);
    return res.status(502).json({
      success: false,
      error: 'The AI assistant is unavailable right now. Please try again.',
      details: error.message
    });
  }
};
