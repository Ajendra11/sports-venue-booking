import client, { authHeader, toApiError } from './client.js';

export const getMyBookings = async (token) => {
  try {
    const { data } = await client.get('/bookings', authHeader(token));
    return data;
  } catch (error) {
    throw toApiError(error, 'Failed to fetch bookings');
  }
};

export const createBooking = async (token, bookingData) => {
  try {
    const { data } = await client.post('/bookings', bookingData, authHeader(token));
    return data;
  } catch (error) {
    throw toApiError(error, 'Failed to create booking');
  }
};

/**
 * Cancel a booking via DELETE /api/bookings/:id, per the Week 3 spec.
 * Removing the record also frees its slots for other users.
 */
export const cancelBooking = async (token, bookingId) => {
  try {
    const { data } = await client.delete(`/bookings/${bookingId}`, authHeader(token));
    return data;
  } catch (error) {
    throw toApiError(error, 'Failed to cancel booking');
  }
};
