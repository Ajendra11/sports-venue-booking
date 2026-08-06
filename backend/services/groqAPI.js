import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

// Initialize Groq SDK (automatically picks up process.env.GROQ_API_KEY)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// System prompt tailored specifically for your Sports Venue Booking app
const systemPrompt = `
You are a helpful AI Assistant for 'Sports Venue Booking App'.
Your role is to assist users in finding sports courts (futsal, badminton, basketball, tennis, etc.), answer questions about venue amenities, pricing, and booking policies, and recommend ideal times for matches.
Respond clearly, politely, and keep responses concise and structured. If a user asks a question unrelated to sports or venues, politely redirect them back to sports venue assistance. Ask a maximum of one question at a time to keep the conversation flowing.
`;

/**
 * Sends conversation messages to Groq AI
 * @param {Array} conversationHistory - Array of message objects [{role: 'user'|'assistant', content: string}]
 */
export const askGroq = async (conversationHistory = []) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...conversationHistory, // Passes chat history dynamically
      ],
      model: "llama-3.3-70b-versatile", // Active, top-performing model on Groq
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || "Sorry, I couldn't process your request.";
  } catch (error) {
    console.error("Groq API Error:", error);
    throw new Error("Failed to get response from Groq AI service.");
  }
};