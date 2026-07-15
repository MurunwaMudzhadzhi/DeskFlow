/**
 * routes/ticketRoutes.js
 * -----------------------------------------------------------------------
 * Ticket routes. All routes require a valid JWT. Creation is restricted
 * to employees; status updates are restricted to admins; listing is
 * available to both roles but scoped differently in the controller.
 * -----------------------------------------------------------------------
 */

const express = require('express');
const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  getTicketStats,
} = require('../controllers/ticketController');
const {
  createTicketValidation,
  updateTicketStatusValidation,
  getTicketsValidation,
} = require('../middleware/validators');
const { authenticateJWT, authorizeEmployee, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// All ticket routes require authentication
router.use(authenticateJWT);

/**
 * @openapi
 * /api/tickets:
 *   post:
 *     tags: [Tickets]
 *     summary: Create a new IT service ticket (Employee only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTicketRequest'
 *           example:
 *             title: Laptop will not power on
 *             description: My laptop screen stays black even after holding the power button.
 *             priority: High
 *             category: Hardware
 *     responses:
 *       201:
 *         description: Ticket created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Employee role required
 */
router.post('/', authorizeEmployee, createTicketValidation, createTicket);

/**
 * @openapi
 * /api/tickets:
 *   get:
 *     tags: [Tickets]
 *     summary: List tickets (own tickets for employees, all tickets for admins)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Open, In Progress, Resolved]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A paginated list of tickets
 *       401:
 *         description: Not authenticated
 */
router.get('/', getTicketsValidation, getTickets);

/**
 * @openapi
 * /api/tickets/stats:
 *   get:
 *     tags: [Tickets]
 *     summary: Get aggregate ticket counts for dashboard cards
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ticket statistics
 */
router.get('/stats', getTicketStats);

/**
 * @openapi
 * /api/tickets/{id}:
 *   get:
 *     tags: [Tickets]
 *     summary: Get a single ticket by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket found
 *       403:
 *         description: Not your ticket
 *       404:
 *         description: Ticket not found
 */
router.get('/:id', getTicketById);

/**
 * @openapi
 * /api/tickets/{id}:
 *   put:
 *     tags: [Tickets]
 *     summary: Update a ticket's status (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTicketStatusRequest'
 *           example:
 *             status: In Progress
 *             resolutionNotes: Dispatched a replacement charger to the employee.
 *     responses:
 *       200:
 *         description: Ticket updated
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Ticket not found
 */
router.put('/:id', authorizeAdmin, updateTicketStatusValidation, updateTicketStatus);

module.exports = router;
