import axios from 'axios';

// Single source of truth for the API origin. Everything in src/api uses this —
// previously the chat drawer read a different variable and silently pointed at
// localhost in production.
const configuredUrl = import.meta.env.VITE_API_URL;

// Served from anywhere other than a dev machine, "localhost" means the
// visitor's own computer — so the default is only ever right in development.
const isLocalHost =
  typeof window !== 'undefined' &&
  /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);

export const isApiUrlMisconfigured = !configuredUrl && !isLocalHost;

if (isApiUrlMisconfigured) {
  console.error(
    'VITE_API_URL is not set. This build will try to call http://localhost:3000, ' +
    "which is the visitor's own machine, not your API. Set VITE_API_URL in your " +
    'host\'s environment variables and rebuild — Vite inlines it at build time.'
  );
}

export const API_BASE_URL = (configuredUrl || 'http://localhost:3000').replace(/\/$/, '');

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
    // Name the actual cause rather than blaming the user's connection
    if (isApiUrlMisconfigured) {
      return new Error(
        'This site was built without VITE_API_URL, so it is trying to reach a server ' +
        'on your own machine. Set VITE_API_URL in your hosting environment and redeploy.'
      );
    }
    return new Error(
      `Cannot reach the API at ${API_BASE_URL}. The server may be starting up (free hosting ` +
      'can take up to a minute to wake) — please try again shortly.'
    );
  }
  return new Error(error.message || fallback);
};

export default client;
