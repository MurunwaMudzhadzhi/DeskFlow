/**
 * components/StatusDropdown.jsx
 * -----------------------------------------------------------------------
 * Admin-only control for changing a ticket's status. Fires onChange with
 * the new status; the parent (TicketCard/AdminDashboard) owns the actual
 * API call so it can apply an optimistic update.
 * -----------------------------------------------------------------------
 */

import styles from '../styles/StatusDropdown.module.css';

const STATUS_OPTIONS = ['Open', 'In Progress', 'Resolved'];

export default function StatusDropdown({ value, onChange, disabled = false }) {
  return (
    <select
      className={`${styles.dropdown} ${styles[value.replace(' ', '')] || ''}`}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Update ticket status"
    >
      {STATUS_OPTIONS.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}
