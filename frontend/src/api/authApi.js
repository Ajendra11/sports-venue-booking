import client, { authHeader, toApiError } from './client.js';

export const registerUser = async (name, email, password, phone, adminCode) => {
  try {
    const { data } = await client.post('/auth/register', {
      name,
      email,
      password,
      phone,
      // Omitted entirely unless supplied — the server rejects an empty code
      ...(adminCode ? { adminCode } : {}),
    });
    return data;
  } catch (error) {
    throw toApiError(error, 'Registration failed');
  }
};

/** Whether this server accepts an admin signup code (never returns the code). */
export const getSignupConfig = async () => {
  try {
    const { data } = await client.get('/auth/signup-config');
    return data;
  } catch {
    // If the check fails, hide the field rather than showing one that can't work
    return { adminCodeEnabled: false };
  }
};

export const loginUser = async (email, password) => {
  try {
    const { data } = await client.post('/auth/login', { email, password });
    return data;
  } catch (error) {
    throw toApiError(error, 'Login failed');
  }
};

export const logoutUser = async () => {
  try {
    const { data } = await client.post('/auth/logout');
    return data;
  } catch {
    // Logging out locally must succeed even if the server call fails
    return null;
  }
};

export const getMe = async (token) => {
  try {
    const { data } = await client.get('/auth/me', authHeader(token));
    return data;
  } catch (error) {
    throw toApiError(error, 'Failed to get user');
  }
};
