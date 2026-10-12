/**
 * tests/integration/tickets.gaps.test.js
 * -----------------------------------------------------------------------
 * Day 3: closes the integration-level gaps listed in docs/TEST_PLAN.md
 * (G1 search filter, G3 missing-token checks, G4 status handling).
 * -----------------------------------------------------------------------
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/models/Ticket');
const Ticket = require('../../src/models/Ticket');
const app = require('../../src/app');

const EMPLOYEE_ID = '665f1a2e8b1a4c0012a3b111';
const ADMIN_ID = '665f1a2e8b1a4c0012a3b999';
const TICKET_ID = '665f1c2e8b1a4c0012a3b456';

const employeeToken = jwt.sign(
  { id: EMPLOYEE_ID, username: 'employee1', role: 'employee' },
  process.env.JWT_SECRET
);
const adminToken = jwt.sign({ id: ADMIN_ID, username: 'admin1', role: 'admin' }, process.env.JWT_SECRET);

// Builds a chainable mock matching Ticket.find(filter).sort().skip().limit()
const mockFindChain = (resolvedTickets) => ({
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockResolvedValue(resolvedTickets),
});

afterEach(() => jest.clearAllMocks());

describe('missing token returns 401 on every protected ticket route', () => {
  it.each([
    ['GET', '/api/tickets'],
    ['GET', '/api/tickets/stats'],
    ['GET', `/api/tickets/${TICKET_ID}`],
    ['PUT', `/api/tickets/${TICKET_ID}`],
  ])('%s %s', async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path).send({ status: 'Resolved' });

    expect(res.status).toBe(401);
    expect(Ticket.find).not.toHaveBeenCalled();
    expect(Ticket.findById).not.toHaveBeenCalled();
    expect(Ticket.countDocuments).not.toHaveBeenCalled();
  });
});

describe('GET /api/tickets (search and pagination)', () => {
  it('passes the search term to a $text filter', async () => {
    Ticket.find.mockReturnValue(mockFindChain([]));
    Ticket.countDocuments.mockResolvedValue(0);

    const res = await request(app)
      .get('/api/tickets?search=printer')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Ticket.find).toHaveBeenCalledWith(
      expect.objectContaining({ $text: { $search: 'printer' } })
    );
  });

  it('combines the search filter with employee scoping', async () => {
    Ticket.find.mockReturnValue(mockFindChain([]));
    Ticket.countDocuments.mockResolvedValue(0);

    await request(app).get('/api/tickets?search=laptop').set('Authorization', `Bearer ${employeeToken}`);

    expect(Ticket.find).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: EMPLOYEE_ID, $text: { $search: 'laptop' } })
    );
  });

  it('translates page and limit into skip and limit', async () => {
    const chain = mockFindChain([]);
    Ticket.find.mockReturnValue(chain);
    Ticket.countDocuments.mockResolvedValue(0);

    await request(app).get('/api/tickets?page=3&limit=5').set('Authorization', `Bearer ${adminToken}`);

    expect(chain.skip).toHaveBeenCalledWith(10);
    expect(chain.limit).toHaveBeenCalledWith(5);
  });
});

describe('PUT /api/tickets/:id (status handling)', () => {
  // The controller enforces no transition rules: any allowed status value is
  // accepted, including moving a Resolved ticket back to an earlier state.
  it.each(['Open', 'In Progress', 'Resolved'])('accepts "%s" for a ticket that is currently Resolved', async (status) => {
    const mockTicket = { _id: TICKET_ID, status: 'Resolved', resolutionNotes: '', save: jest.fn().mockResolvedValue(true) };
    Ticket.findById.mockResolvedValue(mockTicket);

    const res = await request(app)
      .put(`/api/tickets/${TICKET_ID}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status });

    expect(res.status).toBe(200);
    expect(mockTicket.status).toBe(status);
    expect(mockTicket.save).toHaveBeenCalledTimes(1);
  });

  it('leaves existing resolutionNotes untouched when none are sent', async () => {
    const mockTicket = {
      _id: TICKET_ID,
      status: 'Open',
      resolutionNotes: 'Existing notes',
      save: jest.fn().mockResolvedValue(true),
    };
    Ticket.findById.mockResolvedValue(mockTicket);

    const res = await request(app)
      .put(`/api/tickets/${TICKET_ID}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'In Progress' });

    expect(res.status).toBe(200);
    expect(mockTicket.resolutionNotes).toBe('Existing notes');
  });
});