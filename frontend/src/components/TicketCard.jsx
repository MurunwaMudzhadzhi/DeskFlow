/**
 * components/TicketCard.jsx
 * -----------------------------------------------------------------------
 * Renders a single ticket as a work-order "stub": a colored priority
 * edge, a monospaced ticket number corner tag, and a status pill. Admins
 * additionally get a StatusDropdown to change the ticket's status inline.
 * -----------------------------------------------------------------------
 */

import StatusDropdown from './StatusDropdown';
import styles from '../styles/TicketCard.module.css';

const STATUS_STYLES = {
  Open: styles.statusOpen,
  'In Progress': styles.statusProgress,
  Resolved: styles.statusResolved,
};

const PRIORITY_STYLES = {
  Low: styles.priorityLow,
  Medium: styles.priorityMedium,
  High: styles.priorityHigh,
};

const formatDate = (isoString) => {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function TicketCard({ ticket, isAdmin = false, onStatusChange }) {
  const shortId = ticket._id?.slice(-6).toUpperCase();

  return (
    <article className={`${styles.card} ${PRIORITY_STYLES[ticket.priority] || ''}`}>
      <div className={styles.stubTag}>#{shortId}</div>

      <header className={styles.header}>
        <h3 className={styles.title}>{ticket.title}</h3>
        <span className={`${styles.statusPill} ${STATUS_STYLES[ticket.status] || ''}`}>{ticket.status}</span>
      </header>

      <p className={styles.description}>{ticket.description}</p>

      <div className={styles.meta}>
        <span className={styles.metaItem}>
          <span className={styles.metaLabel}>Priority</span>
          <span className={`${styles.priorityTag} ${PRIORITY_STYLES[ticket.priority] || ''}`}>{ticket.priority}</span>
        </span>
        <span className={styles.metaItem}>
          <span className={styles.metaLabel}>Category</span>
          <span>{ticket.category || 'Other'}</span>
        </span>
        <span className={styles.metaItem}>
          <span className={styles.metaLabel}>Filed</span>
          <span>{formatDate(ticket.createdAt)}</span>
        </span>
        {isAdmin && (
          <span className={styles.metaItem}>
            <span className={styles.metaLabel}>Employee</span>
            <span>{ticket.createdByUsername}</span>
          </span>
        )}
      </div>

      {isAdmin && onStatusChange && (
        <footer className={styles.footer}>
          <StatusDropdown value={ticket.status} onChange={(status) => onStatusChange(ticket._id, status)} />
        </footer>
      )}
    </article>
  );
}
