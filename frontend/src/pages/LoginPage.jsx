/**
 * pages/LoginPage.jsx
 * -----------------------------------------------------------------------
 * Username / password / role login screen. On success, redirects to the
 * Employee or Admin dashboard based on the returned role.
 * -----------------------------------------------------------------------
 */

import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import ErrorAlert from '../components/ErrorAlert';
import styles from '../styles/LoginPage.module.css';

export default function LoginPage() {
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '', role: 'employee' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (isAuthenticated) {
    return <Navigate to={role === 'admin' ? '/admin' : '/employee'} replace />;
  }

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data = await login(form);
      navigate(data.role === 'admin' ? '/admin' : '/employee', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.brandBlock}>
          <span className={styles.brandMark} aria-hidden="true">
            DF
          </span>
          <h1 className={styles.brandTitle}>DeskFlow</h1>
          <p className={styles.brandTagline}>Internal IT Service Request Portal</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              id="username"
              type="text"
              className={styles.input}
              value={form.username}
              onChange={handleChange('username')}
              placeholder="employee1"
              autoComplete="username"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={form.password}
              onChange={handleChange('password')}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Sign in as</span>
            <div className={styles.roleToggle}>
              <button
                type="button"
                className={`${styles.roleOption} ${form.role === 'employee' ? styles.roleActive : ''}`}
                onClick={() => setForm((prev) => ({ ...prev, role: 'employee' }))}
              >
                Employee
              </button>
              <button
                type="button"
                className={`${styles.roleOption} ${form.role === 'admin' ? styles.roleActive : ''}`}
                onClick={() => setForm((prev) => ({ ...prev, role: 'admin' }))}
              >
                Admin
              </button>
            </div>
          </div>

          <ErrorAlert message={error} />

          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className={styles.hint}>
          Demo credentials — Employee: <code>employee1 / Employee@123</code> · Admin: <code>admin1 / Admin@123</code>
        </p>
      </div>
    </div>
  );
}
