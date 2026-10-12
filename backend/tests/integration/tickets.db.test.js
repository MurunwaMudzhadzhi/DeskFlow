/**
 * tests/integration/tickets.db.test.js
 * -----------------------------------------------------------------------
 * Day 4: runs the ticket endpoints against a REAL (in-memory) MongoDB via
 * mongodb-memory-server, with nothing mocked. Proves what the mocked suites
 * cannot: schema validation, defaults, the $text search index, and query
 * scoping against real documents (TEST_PLAN G5).
 * -----------------------------------------------------------------------
 */

const mongoose = require('mongoose');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

const Ticket = require('../../src/models/Ticket');
const app = require('../../src/app');

jest.setTimeout(120000); // the first run downloads a MongoDB binary

const EMPLOYEE_A = '665f1a2e8b1a4c0012a3b111';
const EMPLOYEE_B = '665f1a2e8b1a4c0012a3b222';
const ADMIN_ID = '665f1a2e8b1a4c0012a3b999';

const tokenFor = (id, username, role) => jwt.sign({ id, username, role }, process.env.JWT_SECRET);
const employeeAToken = tokenFor(EMPLOYEE_A, 'employee-a', 'employee');
const employeeBToken = tokenFor(EMPLOYEE_B, 'employee-b', 'employee');
const adminToken = tokenFor(ADMIN_ID, 'admin1', 'admin');

const seed = (overrides = {}) =>
  Ticket.create({
    title: 'Printer on floor 2 is jammed',
    description: 'Paper keeps jamming in the printer near the finance team.',
    priority: 'Medium',
    category: 'Hardware',
    createdBy: EMPLOYEE_A,
    createdByUsername: 'employee-a',
    ...overrides,
  });

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create({ instance: { launchTimeout: 120000 } });
  await mongoose.connect(mongod.getUri());
  await Ticket.init(); // wait for index builds, including the text index
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

beforeEach(async () => {
  await Ticket.deleteMany({});
});

describe('Ticket schema (real MongoDB)', () => {
  it('applies defaults for status, priority, category and resolutionNotes', async () => {
    const ticket = await Ticket.create({
      title: 'Cannot open VPN client',
      description: 'The VPN client crashes immediately after launch.',
      createdBy: EMPLOYEE_A,
      createdByUsername: 'employee-a',
    });

    expect(ticket.status).toBe('Open');
    expect(ticket.priority).toBe('Low');
    expect(ticket.category).toBe('Other');
    expect(ticket.resolutionNotes).toBe('');
  });

  it('rejects a title shorter than 5 characters', async () => {
    await expect(seed({ title: 'Fix' })).rejects.toThrow(/at least 5 characters/i);
  });

  it('rejects a status outside the allowed values', async () => {
    await expect(seed({ status: 'Closed' })).rejects.toThrow(/Status must be one of/i);
  });

  it('has a text index covering title and description', async () => {
    const indexes = await Ticket.collection.indexes();

    expect(indexes.some((index) => index.key && index.key._fts === 'text')).toBe(true);
  });
});

describe('POST /api/tickets (real MongoDB)', () => {
  it('persists a new ticket with defaults and the creator taken from the token', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${employeeAToken}`)
      .send({
        title: 'Laptop will not power on',
        description: 'Screen stays black even after holding the power button for ten seconds.',
        priority: 'High',
        category: 'Hardware',
      });

    expect(res.status).toBe(201);

    const saved = await Ticket.findOne({ title: 'Laptop will not power on' });
    expect(saved).not.toBeNull();
    expect(saved.status).toBe('Open');
    expect(saved.createdBy.toString()).toBe(EMPLOYEE_A);
    expect(saved.createdByUsername).toBe('employee-a');
  });
});

describe('GET /api/tickets (real MongoDB)', () => {
  beforeEach(async () => {
    await seed({ title: 'Printer on floor 2 is jammed' });
    await seed({
      title: 'Cannot connect to office Wi-Fi',
      description: 'The wireless network keeps dropping every few minutes.',
      category: 'Network',
    });
    await seed({
      title: 'Reset my email password',
      description: 'I am locked out of my mailbox after too many attempts.',
      category: 'Access',
      createdBy: EMPLOYEE_B,
      createdByUsername: 'employee-b',
    });
  });

  it('shows an employee only their own tickets', async () => {
    const a = await request(app).get('/api/tickets').set('Authorization', `Bearer ${employeeAToken}`);
    const b = await request(app).get('/api/tickets').set('Authorization', `Bearer ${employeeBToken}`);

    expect(a.status).toBe(200);
    expect(a.body.count).toBe(2);
    expect(b.body.count).toBe(1);
  });

  it('shows an admin every ticket', async () => {
    const res = await request(app).get('/api/tickets').set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(3);
  });

  it('finds tickets through the real $text index', async () => {
    const res = await request(app)
      .get('/api/tickets?search=printer')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
  });

  it('applies employee scoping on top of the search filter', async () => {
    const a = await request(app)
      .get('/api/tickets?search=password')
      .set('Authorization', `Bearer ${employeeAToken}`);
    const b = await request(app)
      .get('/api/tickets?search=password')
      .set('Authorization', `Bearer ${employeeBToken}`);

    expect(a.body.count).toBe(0);
    expect(b.body.count).toBe(1);
  });

  it('applies status and priority filters against real documents', async () => {
    const match = await request(app)
      .get('/api/tickets?status=Open&priority=Medium')
      .set('Authorization', `Bearer ${adminToken}`);
    const none = await request(app)
      .get('/api/tickets?status=Resolved')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(match.body.count).toBe(3);
    expect(none.body.count).toBe(0);
  });
});

describe('GET /api/tickets/:id (real MongoDB)', () => {
  it("returns 403 when an employee requests another employee's ticket", async () => {
    const ticket = await seed();

    const res = await request(app)
      .get(`/api/tickets/${ticket._id}`)
      .set('Authorization', `Bearer ${employeeBToken}`);

    expect(res.status).toBe(403);
  });

  it('returns 200 for the ticket owner', async () => {
    const ticket = await seed();

    const res = await request(app)
      .get(`/api/tickets/${ticket._id}`)
      .set('Authorization', `Bearer ${employeeAToken}`);

    expect(res.status).toBe(200);
  });
});

describe('GET /api/tickets/stats (real MongoDB)', () => {
  beforeEach(async () => {
    await seed({ status: 'Open' });
    await seed({ status: 'In Progress' });
    await seed({ status: 'Resolved', createdBy: EMPLOYEE_B, createdByUsername: 'employee-b' });
  });

  it('counts every ticket by status for an admin', async () => {
    const res = await request(app).get('/api/tickets/stats').set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ open: 1, inProgress: 1, resolved: 1, total: 3 });
  });

  it("counts only the employee's own tickets for an employee", async () => {
    const res = await request(app).get('/api/tickets/stats').set('Authorization', `Bearer ${employeeAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ open: 1, inProgress: 1, resolved: 0, total: 2 });
  });
});

describe('PUT /api/tickets/:id (real MongoDB)', () => {
  it('persists the new status and resolution notes', async () => {
    const ticket = await seed();

    const res = await request(app)
      .put(`/api/tickets/${ticket._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Resolved', resolutionNotes: 'Cleared the paper jam and replaced the roller.' });

    expect(res.status).toBe(200);

    const updated = await Ticket.findById(ticket._id);
    expect(updated.status).toBe('Resolved');
    expect(updated.resolutionNotes).toBe('Cleared the paper jam and replaced the roller.');
  });

  it('returns 404 for a well-formed id that does not exist', async () => {
    const res = await request(app)
      .put(`/api/tickets/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Resolved' });

    expect(res.status).toBe(404);
  });
});