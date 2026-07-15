/**
 * pages/EmployeeDashboard.jsx
 * -----------------------------------------------------------------------
 * Employee-facing dashboard: create a ticket, and see only the tickets
 * this employee has filed, with live stats.
 * -----------------------------------------------------------------------
 */

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import TicketForm from '../components/TicketForm';
import TicketList from '../components/TicketList';
import StatsCards from '../components/StatsCards';
import ErrorAlert from '../components/ErrorAlert';
import useTickets from '../hooks/useTickets';
import useToast from '../hooks/useToast';
import ticketService from '../services/ticketService';
import styles from '../styles/Dashboard.module.css';

export default function EmployeeDashboard() {
  const { tickets, loading, error, refetch } = useTickets();
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      const data = await ticketService.getTicketStats();
      setStats(data);
    } catch {
      // Stats are supplementary; a failure here shouldn't block the page.
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleCreate = async (payload) => {
    setSubmitting(true);
    setFormError(null);
    try {
      await ticketService.createTicket(payload);
      showToast('Ticket filed successfully.', 'success');
      await Promise.all([refetch(), loadStats()]);
      return true;
    } catch (err) {
      setFormError(err.message || 'Could not file ticket.');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.content}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>My tickets</h1>
          <p className={styles.pageSubtitle}>File a new IT request and track its progress.</p>
        </div>

        <StatsCards stats={stats} />

        <div className={styles.layout}>
          <section className={styles.formColumn}>
            <h2 className={styles.sectionTitle}>File a new ticket</h2>
            <ErrorAlert message={formError} onDismiss={() => setFormError(null)} />
            <TicketForm onSubmit={handleCreate} submitting={submitting} />
          </section>

          <section className={styles.listColumn}>
            <h2 className={styles.sectionTitle}>Your ticket history</h2>
            <ErrorAlert message={error} onRetry={refetch} />
            <TicketList
              tickets={tickets}
              loading={loading}
              isAdmin={false}
              emptyMessage="File your first ticket using the form to get IT support."
            />
          </section>
        </div>
      </main>
    </div>
  );
}
