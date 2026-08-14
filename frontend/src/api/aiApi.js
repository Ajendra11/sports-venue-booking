import client, { toApiError } from './client.js';

/**
 * Structured top-3 venue recommendations.
 * @param {{sportType?:string, budget?:number, location?:string, date?:string, notes?:string}} preferences
 * @returns {Promise<{summary:string, recommendations:Array}>}
 */
export const getRecommendations = async (preferences) => {
  try {
    const { data } = await client.post('/ai/recommend', preferences);
    return data;
  } catch (error) {
    throw toApiError(error, 'Failed to get recommendations');
  }
};

/** Free-form assistant used by the chat drawer. */
export const sendChatMessage = async (messages) => {
  try {
    const { data } = await client.post('/ai/chat', { messages });
    return data;
  } catch (error) {
    throw toApiError(error, 'Failed to reach the AI assistant');
  }
};
