/**
 * services/authService.js
 * -----------------------------------------------------------------------
 * Wraps all authentication-related API calls.
 * -----------------------------------------------------------------------
 */

import api from './api';

const login = async ({ username, password, role }) => {
  const response = await api.post('/auth/login', { username, password, role });
  return response.data.data; // { token, role, username, fullName, department }
};

const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data.data;
};

const authService = { login, getMe };

export default authService;
