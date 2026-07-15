/**
 * hooks/useTickets.js
 * -----------------------------------------------------------------------
 * Shared data-fetching hook used by both EmployeeDashboard and
 * AdminDashboard. Handles loading/error state and exposes a refetch
 * function plus a status-update helper with optimistic UI update.
 * -----------------------------------------------------------------------
 */

import { useState, useEffect, useCallback } from 'react';
import ticketService from '../services/ticketService';

const useTickets = (filters = {}) => {
  const [tickets, setTickets] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filterKey = JSON.stringify(filters);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ticketService.getTickets(filters);
      setTickets(result.data);
      setMeta({ total: result.total, page: result.page, pages: result.pages });
    } catch (err) {
      setError(err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const changeStatus = useCallback(async (id, payload) => {
    // Optimistic update
    setTickets((prev) => prev.map((t) => (t._id === id ? { ...t, ...payload } : t)));
    try {
      const updated = await ticketService.updateTicketStatus(id, payload);
      setTickets((prev) => prev.map((t) => (t._id === id ? updated : t)));
      return updated;
    } catch (err) {
      // Roll back by refetching on failure
      await fetchTickets();
      throw err;
    }
  }, [fetchTickets]);

  return { tickets, meta, loading, error, refetch: fetchTickets, changeStatus };
};

export default useTickets;
