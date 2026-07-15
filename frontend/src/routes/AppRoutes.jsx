/**
 * routes/AppRoutes.jsx
 * -----------------------------------------------------------------------
 * Centralized route table. Keeping routes in one file makes the app's
 * navigable surface easy to audit at a glance.
 * -----------------------------------------------------------------------
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import EmployeeDashboard from '../pages/EmployeeDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRole="employee">
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
