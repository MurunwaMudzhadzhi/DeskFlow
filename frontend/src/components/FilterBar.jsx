/**
 * components/FilterBar.jsx
 * -----------------------------------------------------------------------
 * Search + status/priority filter controls used on the Admin Dashboard.
 * -----------------------------------------------------------------------
 */

import styles from '../styles/FilterBar.module.css';

export default function FilterBar({ filters, onChange }) {
  const handle = (field) => (e) => onChange({ ...filters, [field]: e.target.value });

  return (
    <div className={styles.bar}>
      <input
        type="search"
        className={styles.search}
        placeholder="Search by title or description…"
        value={filters.search}
        onChange={handle('search')}
        aria-label="Search tickets"
      />

      <select className={styles.select} value={filters.status} onChange={handle('status')} aria-label="Filter by status">
        <option value="">All statuses</option>
        <option value="Open">Open</option>
        <option value="In Progress">In Progress</option>
        <option value="Resolved">Resolved</option>
      </select>

      <select
        className={styles.select}
        value={filters.priority}
        onChange={handle('priority')}
        aria-label="Filter by priority"
      >
        <option value="">All priorities</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
    </div>
  );
}
