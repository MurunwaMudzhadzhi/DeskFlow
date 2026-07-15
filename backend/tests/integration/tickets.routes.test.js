/**
 * tests/integration/tickets.routes.test.js
 * -----------------------------------------------------------------------
 * Exercises the ticket endpoints through the real Express app with the
 * Mongoose Ticket model mocked. Covers exactly the scenarios manually
 * verified in Swagger during development: employee-only creation,
 * role-scoped visibility, admin-only status updates, and validation.
 * -----------------------------------------------------------------------
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/models/Ticket');
const Ticket = require('../../src/models/Ticket');
const app = require('../../src/app');

const EMPLOYEE_ID = '665f1a2e8b1a4c0012a3b111';
const ADMIN_ID = '665f1a2e8b1a4c0012a3b999';

const employeeToken = jwt.sign(
  { id: EMPLOYEE_ID, username: 'employee1', role: 'employee' },
  process.env.JWT_SECRET
);
const adminToken = jwt.sign({ id: ADMIN_ID, username: 'admin1', role: 'admin' }, process.env.JWT_SECRET);

const validTicketPayload = {
  title: 'Laptop will not power on',
  description: 'Screen stays black even after holding the power button for ten seconds.',
  priority: 'High',
  category: 'Hardware',
};

// Builds a chainable mock matching Ticket.find(filter).sort().skip().limit()
const mockFindChain = (resolvedTickets) => ({
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockResolvedValue(resolvedTickets),
});

describe('POST /api/tickets', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns 401 with no token at all', async () => {
    const res = await request(app).post('/api/tickets').send(validTicketPayload);
    expect(res.status).toBe(401);
  });

  it('returns 403 when an admin attempts to create a ticket', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validTicketPayload);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/employee role required/i);
    expect(Ticket.create).not.toHaveBeenCalled();
  });

  it('returns 201 and creates the ticket when an employee submits valid data', async () => {
    Ticket.create.mockResolvedValue({ _id: 't1', ...validTicketPayload, status: 'Open', createdBy: EMPLOYEE_ID });

    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send(validTicketPayload);

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('Open');
    expect(Ticket.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: validTicketPayload.title,
        createdBy: EMPLOYEE_ID,
        createdByUsername: 'employee1',
      })
    );
  });

  it('returns 400 when title and description are both too short', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ title: 'Fix', description: 'Short', priority: 'High' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    const fields = res.body.details.map((d) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['title', 'description']));
    expect(Ticket.create).not.toHaveBeenCalled();
  });

  it('returns 400 when priority is missing', async () => {
    const { priority, ...withoutPriority } = validTicketPayload;
    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send(withoutPriority);

    expect(res.status).toBe(400);
  });

  it('returns 400 when priority is not one of the allowed enum values', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ ...validTicketPayload, priority: 'Critical' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/tickets', () => {
  afterEach(() => jest.clearAllMocks());

  it('scopes results to createdBy when the requester is an employee', async () => {
    Ticket.find.mockReturnValue(mockFindChain([]));
    Ticket.countDocuments.mockResolvedValue(0);

    const res = await request(app).get('/api/tickets').set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(200);
    expect(Ticket.find).toHaveBeenCalledWith(expect.objectContaining({ createdBy: EMPLOYEE_ID }));
  });

  it('does not scope by createdBy when the requester is an admin', async () => {
    Ticket.find.mockReturnValue(mockFindChain([{ _id: 't1' }, { _id: 't2' }]));
    Ticket.countDocuments.mockResolvedValue(2);

    const res = await request(app).get('/api/tickets').set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    const filterArg = Ticket.find.mock.calls[0][0];
    expect(filterArg.createdBy).toBeUndefined();
  });

  it('applies status and priority filters from the query string', async () => {
    Ticket.find.mockReturnValue(mockFindChain([]));
    Ticket.countDocuments.mockResolvedValue(0);

    await request(app)
      .get('/api/tickets?status=Open&priority=High')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(Ticket.find).toHaveBeenCalledWith(expect.objectContaining({ status: 'Open', priority: 'High' }));
  });

  it('returns 400 for an invalid status filter value', async () => {
    const res = await request(app)
      .get('/api/tickets?status=Closed')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
  });
});

describe('GET /api/tickets/:id', () => {
  const ticketId = '665f1c2e8b1a4c0012a3b456';
  afterEach(() => jest.clearAllMocks());

  it('returns 404 when the ticket does not exist', async () => {
    Ticket.findById.mockResolvedValue(null);

    const res = await request(app).get(`/api/tickets/${ticketId}`).set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  it('returns 403 when an employee requests a ticket they do not own', async () => {
    Ticket.findById.mockResolvedValue({ _id: ticketId, createdBy: { toString: () => 'someone-elses-id' } });

    const res = await request(app).get(`/api/tickets/${ticketId}`).set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(403);
  });

  it('returns 200 when an employee requests their own ticket', async () => {
    Ticket.findById.mockResolvedValue({ _id: ticketId, createdBy: { toString: () => EMPLOYEE_ID } });

    const res = await request(app).get(`/api/tickets/${ticketId}`).set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(200);
  });

  it('returns 200 when an admin requests any ticket regardless of owner', async () => {
    Ticket.findById.mockResolvedValue({ _id: ticketId, createdBy: { toString: () => 'anyone' } });

    const res = await request(app).get(`/api/tickets/${ticketId}`).set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});

describe('GET /api/tickets/stats', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns aggregate counts scoped to the employee for an employee requester', async () => {
    Ticket.countDocuments
      .mockResolvedValueOnce(2) // open
      .mockResolvedValueOnce(1) // in progress
      .mockResolvedValueOnce(3) // resolved
      .mockResolvedValueOnce(6); // total

    const res = await request(app).get('/api/tickets/stats').set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ open: 2, inProgress: 1, resolved: 3, total: 6 });
    // every countDocuments call should be scoped to this employee
    Ticket.countDocuments.mock.calls.forEach(([filter]) => {
      expect(filter.createdBy).toBe(EMPLOYEE_ID);
    });
  });

  it('returns aggregate counts across all tickets for an admin requester', async () => {
    Ticket.countDocuments.mockResolvedValue(0);

    const res = await request(app).get('/api/tickets/stats').set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const firstCallFilter = Ticket.countDocuments.mock.calls[0][0];
    expect(firstCallFilter.createdBy).toBeUndefined();
  });
});

describe('PUT /api/tickets/:id', () => {
  const ticketId = '665f1c2e8b1a4c0012a3b456';
  afterEach(() => jest.clearAllMocks());

  it('returns 403 when an employee attempts to update ticket status', async () => {
    const res = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ status: 'Resolved' });

    expect(res.status).toBe(403);
    expect(Ticket.findById).not.toHaveBeenCalled();
  });

  it('returns 200 and updates status when an admin makes a valid request', async () => {
    const mockTicket = { _id: ticketId, status: 'Open', resolutionNotes: '', save: jest.fn().mockResolvedValue(true) };
    Ticket.findById.mockResolvedValue(mockTicket);

    const res = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'In Progress', resolutionNotes: 'Dispatched a replacement charger.' });

    expect(res.status).toBe(200);
    expect(mockTicket.status).toBe('In Progress');
    expect(mockTicket.resolutionNotes).toBe('Dispatched a replacement charger.');
    expect(mockTicket.save).toHaveBeenCalledTimes(1);
  });

  it('returns 404 when the ticket does not exist', async () => {
    Ticket.findById.mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Resolved' });

    expect(res.status).toBe(404);
  });

  it('returns 400 for an invalid status value', async () => {
    const res = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Closed' });

    expect(res.status).toBe(400);
    expect(Ticket.findById).not.toHaveBeenCalled();
  });

  it('returns 400 for a malformed ticket id', async () => {
    const res = await request(app)
      .put('/api/tickets/not-a-valid-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Resolved' });

    expect(res.status).toBe(400);
  });
});
