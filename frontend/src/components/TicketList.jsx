/**
 * components/TicketList.jsx
 * -----------------------------------------------------------------------
 * Renders a collection of TicketCards, plus loading and empty states.
 * The empty state is treated as an invitation to act, per DeskFlow's
 * interface voice guidelines.
 * -----------------------------------------------------------------------
 */

import TicketCard from './TicketCard';
import LoadingSpinner from './LoadingSpinner';
import styles from '../styles/TicketList.module.css';

export default function TicketList({ tickets, loading, isAdmin = false, onStatusChange, emptyMessage }) {
  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <LoadingSpinner label="Loading tickets" />
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon} aria-hidden="true">
          ⎘
        </span>
        <p className={styles.emptyTitle}>No tickets here yet</p>
        <p className={styles.emptyBody}>
          {emptyMessage || 'When a ticket is filed, it will show up in this list.'}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {tickets.map((ticket) => (
        <TicketCard key={ticket._id} ticket={ticket} isAdmin={isAdmin} onStatusChange={onStatusChange} />
      ))}
    </div>
  );
}
