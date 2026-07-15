/**
 * controllers/ticketController.js
 * -----------------------------------------------------------------------
 * Business logic for ticket creation, retrieval, and status updates.
 * Role-based visibility rules:
 *   - Employees only ever see tickets they created.
 *   - Admins see every ticket in the system, with search + filters.
 * -----------------------------------------------------------------------
 */

const Ticket = require('../models/Ticket');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Create a new ticket
 * @route   POST /api/tickets
 * @access  Private (Employee only)
 */
const createTicket = asyncHandler(async (req, res) => {
  const { title, description, priority, category } = req.body;

  const ticket = await Ticket.create({
    title,
    description,
    priority,
    category,
    createdBy: req.user.id,
    createdByUsername: req.user.username,
  });

  return res.status(201).json({
    success: true,
    message: 'Ticket created successfully',
    data: ticket,
  });
});

/**
 * @desc    Get tickets. Employees see only their own; Admins see all,
 *          with optional search/filter/pagination.
 * @route   GET /api/tickets
 * @access  Private (Employee + Admin)
 */
const getTickets = asyncHandler(async (req, res) => {
  const { status, priority, search, page = 1, limit = 20 } = req.query;

  const filter = {};

  if (req.user.role === 'employee') {
    filter.createdBy = req.user.id;
  }

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [tickets, total] = await Promise.all([
    Ticket.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Ticket.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    count: tickets.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)) || 1,
    data: tickets,
  });
});

/**
 * @desc    Get a single ticket by id (employee may only fetch their own)
 * @route   GET /api/tickets/:id
 * @access  Private (Employee + Admin)
 */
const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new ApiError(404, 'Ticket not found');
  }

  if (req.user.role === 'employee' && ticket.createdBy.toString() !== req.user.id) {
    throw new ApiError(403, 'You do not have access to this ticket');
  }

  return res.status(200).json({ success: true, data: ticket });
});

/**
 * @desc    Update a ticket's status (and optional resolution notes)
 * @route   PUT /api/tickets/:id
 * @access  Private (Admin only)
 */
const updateTicketStatus = asyncHandler(async (req, res) => {
  const { status, resolutionNotes } = req.body;

  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    throw new ApiError(404, 'Ticket not found');
  }

  ticket.status = status;
  if (typeof resolutionNotes === 'string') {
    ticket.resolutionNotes = resolutionNotes;
  }

  await ticket.save();

  return res.status(200).json({
    success: true,
    message: 'Ticket status updated successfully',
    data: ticket,
  });
});

/**
 * @desc    Get aggregate ticket statistics for dashboard cards
 * @route   GET /api/tickets/stats
 * @access  Private (Employee + Admin)
 */
const getTicketStats = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'employee' ? { createdBy: req.user.id } : {};

  const [open, inProgress, resolved, total] = await Promise.all([
    Ticket.countDocuments({ ...filter, status: 'Open' }),
    Ticket.countDocuments({ ...filter, status: 'In Progress' }),
    Ticket.countDocuments({ ...filter, status: 'Resolved' }),
    Ticket.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    data: { open, inProgress, resolved, total },
  });
});

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  getTicketStats,
};
