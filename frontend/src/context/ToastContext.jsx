/**
 * context/ToastContext.jsx
 * -----------------------------------------------------------------------
 * Minimal global toast notification system. Any component can call
 * `showToast(message, type)` via the useToast hook to surface a
 * transient confirmation or error message in the corner of the screen.
 * -----------------------------------------------------------------------
 */

import { createContext, useCallback, useState, useMemo } from 'react';
import styles from '../styles/Toast.module.css';

// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'success', duration = 4000) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      window.setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.stack} aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`${styles.toast} ${styles[toast.type] || ''}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastContext;
