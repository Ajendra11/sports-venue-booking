import client, { authHeader, toApiError } from './client.js';

export const getVenues = async () => {
  try {
    const { data } = await client.get('/venues');
    return data;
  } catch (error) {
    throw toApiError(error, 'Failed to load venues');
  }
};

export const getVenueById = async (id) => {
  try {
    const { data } = await client.get(`/venues/${id}`);
    return data;
  } catch (error) {
    throw toApiError(error, 'Failed to load venue');
  }
};

/** Hourly slot availability for a venue on a given YYYY-MM-DD date. */
export const getVenueAvailability = async (id, date) => {
  try {
    const { data } = await client.get(`/venues/${id}/availability`, { params: { date } });
    return data;
  } catch (error) {
    throw toApiError(error, 'Failed to load availability');
  }
};

export const createVenue = async (token, venueData) => {
  try {
    const { data } = await client.post('/venues', venueData, authHeader(token));
    return data;
  } catch (error) {
    throw toApiError(error, 'Failed to create venue');
  }
};

export const updateVenue = async (token, id, venueData) => {
  try {
    const { data } = await client.put(`/venues/${id}`, venueData, authHeader(token));
    return data;
  } catch (error) {
    throw toApiError(error, 'Failed to update venue');
  }
};

export const deleteVenue = async (token, id) => {
  try {
    const { data } = await client.delete(`/venues/${id}`, authHeader(token));
    return data;
  } catch (error) {
    throw toApiError(error, 'Failed to delete venue');
  }
};
