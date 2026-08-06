import { askGroq } from '../services/groqAPI.js';

/**
 * @desc    Get AI recommendations or answer chat queries using Groq
 * @route   POST /api/ai/recommend
 * @access  Public (or Protected)
 */
export const handleAiQuery = async (req, res) => {
  try {
    const { messages, prompt } = req.body;

    // Support both multi-turn chat array (messages) and single prompt input
    let conversation = [];

    if (messages && Array.isArray(messages) && messages.length > 0) {
      conversation = messages;
    } else if (prompt && typeof prompt === 'string') {
      conversation = [{ role: 'user', content: prompt }];
    } else {
      return res.status(400).json({
        success: false,
        error: 'Please provide either a "prompt" string or a "messages" array.',
      });
    }

    // Call Groq AI service
    const reply = await askGroq(conversation);

    return res.status(200).json({
      success: true,
      answer: reply,
    });
  } catch (error) {
    console.error('AI Controller Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to process AI query',
      details: error.message,
    });
  }
};