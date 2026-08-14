import client, { authHeader, toApiError } from './client.js';

/** Every booking across all users, with optional filters. */
export const getAllBookings = async (token, params = {}) => {
  try {
    const { data } = await client.get('/admin/bookings', {
      ...authHeader(token),
      params,
    });
    return data;
  } catch (error) {
    throw toApiError(error, 'Failed to load bookings');
  }
};

/** Cancel any user's booking. */
export const adminCancelBooking = async (token, bookingId) => {
  try {
    const { data } = await client.delete(`/admin/bookings/${bookingId}`, authHeader(token));
    return data;
  } catch (error) {
    throw toApiError(error, 'Failed to cancel booking');
  }
};

/** Platform-wide analytics. */
export const getAnalytics = async (token) => {
  try {
    const { data } = await client.get('/admin/analytics', authHeader(token));
    return data;
  } catch (error) {
    throw toApiError(error, 'Failed to load analytics');
  }
};
