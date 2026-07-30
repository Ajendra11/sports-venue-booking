const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_BASE_URL = `${BASE_URL}/api/bookings`;

const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

export const getMyBookings = async (token) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: getHeaders(token)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch bookings');
    }
    return data;
  } catch (error) {
    console.error('Fetch bookings error:', error);
    throw error;
  }
};

export const getBookingStats = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      method: 'GET',
      headers: getHeaders(token)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch booking statistics');
    }
    return data;
  } catch (error) {
    console.error('Fetch booking stats error:', error);
    throw error;
  }
};

export const createBooking = async (token, bookingData) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(bookingData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create booking');
    }
    return data;
  } catch (error) {
    console.error('Create booking error:', error);
    throw error;
  }
};

export const cancelBooking = async (token, bookingId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${bookingId}/cancel`, {
      method: 'PUT',
      headers: getHeaders(token)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to cancel booking');
    }
    return data;
  } catch (error) {
    console.error('Cancel booking error:', error);
    throw error;
  }
};

export const deleteBooking = async (token, bookingId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${bookingId}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete booking');
    }
    return data;
  } catch (error) {
    console.error('Delete booking error:', error);
    throw error;
  }
};

