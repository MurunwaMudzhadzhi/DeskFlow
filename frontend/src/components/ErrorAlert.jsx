/**
 * components/ErrorAlert.jsx
 * -----------------------------------------------------------------------
 * Presents an error message in the interface's own voice: states what
 * happened, never apologizes, offers a dismiss/retry action when given.
 * -----------------------------------------------------------------------
 */

import styles from '../styles/ErrorAlert.module.css';

export default function ErrorAlert({ message, onRetry, onDismiss }) {
  if (!message) return null;

  return (
    <div className={styles.alert} role="alert">
      <span className={styles.icon} aria-hidden="true">
        !
      </span>
      <div className={styles.body}>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          {onRetry && (
            <button type="button" className={styles.action} onClick={onRetry}>
              Try again
            </button>
          )}
          {onDismiss && (
            <button type="button" className={styles.action} onClick={onDismiss}>
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
