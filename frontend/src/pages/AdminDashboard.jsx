/**
 * pages/AdminDashboard.jsx
 * -----------------------------------------------------------------------
 * Admin-facing dashboard: view every ticket in the system, search and
 * filter by status/priority, and update a ticket's status inline with
 * an instant (optimistic) UI update.
 * -----------------------------------------------------------------------
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from '../components/Navbar';
import TicketList from '../components/TicketList';
import StatsCards from '../components/StatsCards';
import FilterBar from '../components/FilterBar';
import ErrorAlert from '../components/ErrorAlert';
import useTickets from '../hooks/useTickets';
import useToast from '../hooks/useToast';
import ticketService from '../services/ticketService';
import styles from '../styles/Dashboard.module.css';

export default function AdminDashboard() {
  const [filters, setFilters] = useState({ search: '', status: '', priority: '' });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [stats, setStats] = useState(null);
  const { showToast } = useToast();

  // Debounce search/filter changes so we don't hammer the API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFilters(filters), 350);
    return () => clearTimeout(timer);
  }, [filters]);

  const apiFilters = useMemo(() => {
    const f = {};
    if (debouncedFilters.search) f.search = debouncedFilters.search;
    if (debouncedFilters.status) f.status = debouncedFilters.status;
    if (debouncedFilters.priority) f.priority = debouncedFilters.priority;
    return f;
  }, [debouncedFilters]);

  const { tickets, loading, error, refetch, changeStatus } = useTickets(apiFilters);

  const loadStats = useCallback(async () => {
    try {
      const data = await ticketService.getTicketStats();
      setStats(data);
    } catch {
      // Stats are supplementary; ignore failures here.
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleStatusChange = async (id, status) => {
    try {
      await changeStatus(id, { status });
      showToast(`Ticket status updated to "${status}".`, 'success');
      loadStats();
    } catch (err) {
      showToast(err.message || 'Could not update ticket status.', 'error');
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.content}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>All company tickets</h1>
          <p className={styles.pageSubtitle}>Triage incoming requests and keep employees updated.</p>
        </div>

        <StatsCards stats={stats} />

        <FilterBar filters={filters} onChange={setFilters} />

        <ErrorAlert message={error} onRetry={refetch} />

        <TicketList
          tickets={tickets}
          loading={loading}
          isAdmin
          onStatusChange={handleStatusChange}
          emptyMessage="No tickets match your current filters."
        />
      </main>
    </div>
  );
}
