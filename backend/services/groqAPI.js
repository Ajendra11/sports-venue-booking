import Groq from 'groq-sdk';
import '../config/env.js';

const MODEL = 'llama-3.3-70b-versatile';

const getClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is missing from environment variables.');
  }
  // Instantiating per request ensures process.env is read fresh
  return new Groq({ apiKey });
};

/** Render venue documents (plus their free slots) as compact text for the model. */
const formatVenues = (venues = []) => {
  if (venues.length === 0) {
    return 'No venues are currently available in the database.';
  }

  return venues
    .map((v) => {
      const facilities = v.facilities?.length ? v.facilities.join(', ') : 'none listed';
      const free = v.availableSlots?.length
        ? v.availableSlots.join(', ')
        : (v.availableSlots ? 'fully booked' : 'not checked');
      return [
        `- id: ${v._id}`,
        `  name: ${v.name}`,
        `  sport: ${v.sportType}`,
        `  location: ${v.location}`,
        `  pricePerHour: Rs. ${v.pricePerHour}`,
        `  facilities: ${facilities}`,
        `  availableSlots: ${free}`
      ].join('\n');
    })
    .join('\n');
};

/**
 * Free-form multi-turn chat assistant, grounded in live venue data.
 * @param {Array} conversationHistory [{role:'user'|'assistant', content:string}]
 * @param {Array} venues Venue documents fetched from MongoDB
 */
export const askGroq = async (conversationHistory = [], venues = []) => {
  const groq = getClient();

  const systemPrompt = `
You are a helpful AI Assistant for the 'Sports Venue Booking' app.
Help users find sports courts, pricing, locations and booking information based ONLY on the real venue inventory below.

=== OUR REAL DATABASE VENUES ===
${formatVenues(venues)}
================================

STRICT RULES:
1. ONLY recommend and discuss the venues listed above.
2. NEVER invent courts, prices, locations or sports that are not in the list.
3. If the user asks for something not in the inventory, say plainly that we don't currently list it.
4. Keep answers concise, polite and clearly structured.
5. Ask at most ONE follow-up question at a time.
`.trim();

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      ...conversationHistory
    ],
    model: MODEL,
    temperature: 0.2, // Low temperature keeps the model tied to database facts
    max_tokens: 600
  });

  return completion.choices[0]?.message?.content || "Sorry, I couldn't process your request.";
};

/**
 * Structured recommender: returns the top 3 venues with a reason each,
 * judged on sport type, budget, location and available slots.
 * @param {Object} preferences { sportType, budget, location, date, notes }
 * @param {Array} venues Venue documents, optionally carrying `availableSlots`
 * @returns {Promise<{recommendations: Array, summary: string}>}
 */
export const recommendVenues = async (preferences = {}, venues = []) => {
  const groq = getClient();

  const { sportType, budget, location, date, notes } = preferences;

  const systemPrompt = `
You are the recommendation engine for the 'Sports Venue Booking' app.

Pick the TOP 3 venues from the inventory below that best match the user's preferences.
Judge each candidate on all four of: sport type, budget (price per hour), location, and available time slots.

=== VENUE INVENTORY ===
${formatVenues(venues)}
=======================

RULES:
1. Recommend ONLY venues from the inventory. Never invent one.
2. Copy the venue "id" field exactly as given — it is required.
3. Return at most 3, ranked best first. Return fewer if fewer genuinely fit; never pad with poor matches.
4. Each reason must be one or two sentences and must cite concrete facts (price, location, sport, or free slots) explaining why it fits THIS user.
5. "matchScore" is an integer 0-100 reflecting fit quality.
6. If nothing fits, return an empty recommendations array and explain why in "summary".

Respond with STRICT JSON only, no markdown fences, in exactly this shape:
{
  "summary": "one short sentence addressed to the user",
  "recommendations": [
    { "id": "<venue id>", "name": "<venue name>", "matchScore": 0, "reason": "<why this fits>", "bestSlots": ["HH:MM"] }
  ]
}
`.trim();

  const userPrompt = `
My preferences:
- Sport: ${sportType || 'any'}
- Budget: ${budget ? `up to Rs. ${budget} per hour` : 'no strict limit'}
- Preferred location: ${location || 'anywhere'}
- Date of interest: ${date || 'flexible'}
- Extra notes: ${notes || 'none'}
`.trim();

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    model: MODEL,
    temperature: 0.3,
    max_tokens: 900,
    response_format: { type: 'json_object' }
  });

  const raw = completion.choices[0]?.message?.content || '{}';

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Fall back to salvaging the first JSON object in the response
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error('AI returned an unparseable recommendation response');
    }
    parsed = JSON.parse(match[0]);
  }

  const list = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];

  // Never trust the model's ids — resolve each against the real inventory and
  // drop anything hallucinated, so the UI only ever renders genuine venues.
  const byId = new Map(venues.map((v) => [String(v._id), v]));

  const recommendations = list
    .map((rec) => {
      const venue = byId.get(String(rec.id));
      if (!venue) return null;
      return {
        venue,
        matchScore: Math.max(0, Math.min(100, Number(rec.matchScore) || 0)),
        reason: String(rec.reason || '').trim(),
        bestSlots: Array.isArray(rec.bestSlots) ? rec.bestSlots.slice(0, 4) : []
      };
    })
    .filter(Boolean)
    .slice(0, 3);

  return {
    summary: String(parsed.summary || '').trim(),
    recommendations
  };
};
