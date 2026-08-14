import axios from 'axios';

// Single source of truth for the API origin. Everything in src/api uses this —
// previously the chat drawer read a different variable and silently pointed at
// localhost in production.
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
).replace(/\/$/, '');

const client = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

/** Authorization header for protected routes. */
export const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

/**
 * Normalise any failure into a single readable message, so callers can
 * surface `error.message` directly without unwrapping axios internals.
 */
export const toApiError = (error, fallback = 'Something went wrong') => {
  if (error.response?.data?.error) return new Error(error.response.data.error);
  if (error.response?.data?.message) return new Error(error.response.data.message);
  if (error.code === 'ERR_NETWORK') {
    return new Error('Cannot reach the server. Please check your connection and try again.');
  }
  return new Error(error.message || fallback);
};

export default client;
