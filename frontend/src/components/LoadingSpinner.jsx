/**
 * components/LoadingSpinner.jsx
 * -----------------------------------------------------------------------
 * Small reusable loading indicator. Accepts an optional label and a
 * "fullscreen" flag for full-page loading states (e.g. initial auth check).
 * -----------------------------------------------------------------------
 */

import styles from '../styles/LoadingSpinner.module.css';

export default function LoadingSpinner({ label = 'Loading', fullscreen = false }) {
  return (
    <div className={fullscreen ? styles.fullscreen : styles.inline} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
