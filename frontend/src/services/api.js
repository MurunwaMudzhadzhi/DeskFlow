/**
 * services/api.js
 * -----------------------------------------------------------------------
 * Centralized Axios instance. Automatically attaches the JWT bearer
 * token to every outgoing request and normalizes error responses so
 * calling code can rely on a consistent `error.message` shape.
 * -----------------------------------------------------------------------
 */

import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------------------
// Request interceptor: attach JWT if present
// ---------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('deskflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------
// Response interceptor: normalize errors + handle expired sessions
// ---------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const backendMessage = error.response?.data?.message;
    const details = error.response?.data?.details;

    if (status === 401) {
      // Token missing/expired/invalid -> force a clean logout
      localStorage.removeItem('deskflow_token');
      localStorage.removeItem('deskflow_role');
      localStorage.removeItem('deskflow_username');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    const normalizedMessage =
      backendMessage || error.message || 'Something went wrong. Please try again.';

    return Promise.reject({
      status,
      message: normalizedMessage,
      details: details || null,
      raw: error,
    });
  }
);

export default api;
