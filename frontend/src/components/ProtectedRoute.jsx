/**
 * components/ProtectedRoute.jsx
 * -----------------------------------------------------------------------
 * Route guard. Redirects unauthenticated users to /login, and redirects
 * authenticated users who lack the required role to their own dashboard
 * rather than showing a blank/forbidden page.
 * -----------------------------------------------------------------------
 */

import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function ProtectedRoute({ children, allowedRole }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    const fallback = role === 'admin' ? '/admin' : '/employee';
    return <Navigate to={fallback} replace />;
  }

  return children;
}
