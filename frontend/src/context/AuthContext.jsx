/**
 * context/AuthContext.jsx
 * -----------------------------------------------------------------------
 * Global authentication state (token, role, username) backed by
 * localStorage so a page refresh does not log the user out.
 * -----------------------------------------------------------------------
 */

import { createContext, useState, useCallback, useMemo } from 'react';
import authService from '../services/authService';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

const STORAGE_KEYS = {
  token: 'deskflow_token',
  role: 'deskflow_role',
  username: 'deskflow_username',
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.token));
  const [role, setRole] = useState(() => localStorage.getItem(STORAGE_KEYS.role));
  const [username, setUsername] = useState(() => localStorage.getItem(STORAGE_KEYS.username));
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  const login = useCallback(async ({ username: uname, password, role: selectedRole }) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const data = await authService.login({ username: uname, password, role: selectedRole });
      localStorage.setItem(STORAGE_KEYS.token, data.token);
      localStorage.setItem(STORAGE_KEYS.role, data.role);
      localStorage.setItem(STORAGE_KEYS.username, data.username);
      setToken(data.token);
      setRole(data.role);
      setUsername(data.username);
      return data;
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.role);
    localStorage.removeItem(STORAGE_KEYS.username);
    setToken(null);
    setRole(null);
    setUsername(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      role,
      username,
      isAuthenticated: Boolean(token),
      authError,
      authLoading,
      login,
      logout,
    }),
    [token, role, username, authError, authLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
