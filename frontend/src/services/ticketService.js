/**
 * services/ticketService.js
 * -----------------------------------------------------------------------
 * Wraps all ticket-related API calls.
 * -----------------------------------------------------------------------
 */

import api from './api';

const createTicket = async (payload) => {
  const response = await api.post('/tickets', payload);
  return response.data.data;
};

const getTickets = async (params = {}) => {
  const response = await api.get('/tickets', { params });
  return response.data; // { success, count, total, page, pages, data }
};

const getTicketStats = async () => {
  const response = await api.get('/tickets/stats');
  return response.data.data; // { open, inProgress, resolved, total }
};

const updateTicketStatus = async (id, payload) => {
  const response = await api.put(`/tickets/${id}`, payload);
  return response.data.data;
};

const ticketService = { createTicket, getTickets, getTicketStats, updateTicketStatus };

export default ticketService;
