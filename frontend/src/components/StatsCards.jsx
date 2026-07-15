/**
 * components/StatsCards.jsx
 * -----------------------------------------------------------------------
 * Dashboard statistics row (Open / In Progress / Resolved / Total).
 * Shared by both the Employee and Admin dashboards.
 * -----------------------------------------------------------------------
 */

import styles from '../styles/StatsCards.module.css';

export default function StatsCards({ stats }) {
  const cards = [
    { label: 'Open', value: stats?.open ?? 0, tone: styles.toneOpen },
    { label: 'In Progress', value: stats?.inProgress ?? 0, tone: styles.toneProgress },
    { label: 'Resolved', value: stats?.resolved ?? 0, tone: styles.toneResolved },
    { label: 'Total', value: stats?.total ?? 0, tone: styles.toneTotal },
  ];

  return (
    <div className={styles.row}>
      {cards.map((card) => (
        <div key={card.label} className={`${styles.card} ${card.tone}`}>
          <span className={styles.value}>{card.value}</span>
          <span className={styles.label}>{card.label}</span>
        </div>
      ))}
    </div>
  );
}
