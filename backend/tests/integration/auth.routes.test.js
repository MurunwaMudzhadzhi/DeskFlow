/**
 * tests/integration/auth.routes.test.js
 * -----------------------------------------------------------------------
 * Exercises POST /api/auth/login and GET /api/auth/me through the real
 * Express app (routing, validation, controllers, error handling) with
 * the Mongoose User model mocked so no live database is required.
 * -----------------------------------------------------------------------
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/models/User');
const User = require('../../src/models/User');
const app = require('../../src/app');

const buildMockUser = (overrides = {}) => ({
  _id: '665f1a2e8b1a4c0012a3b111',
  username: 'admin1',
  role: 'admin',
  fullName: 'Riley Chen',
  department: 'IT Operations',
  isActive: true,
  comparePassword: jest.fn().mockResolvedValue(true),
  ...overrides,
});

describe('POST /api/auth/login', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns 200 and a valid JWT for correct credentials', async () => {
    const mockUser = buildMockUser();
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin1', password: 'Admin@123', role: 'admin' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('admin');
    expect(res.body.data.username).toBe('admin1');

    // The returned token should be verifiable with our test JWT_SECRET
    const decoded = jwt.verify(res.body.data.token, process.env.JWT_SECRET);
    expect(decoded.role).toBe('admin');
  });

  it('returns 401 when the user does not exist', async () => {
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'ghost', password: 'whatever1', role: 'employee' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 401 when the password does not match', async () => {
    const mockUser = buildMockUser({ comparePassword: jest.fn().mockResolvedValue(false) });
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin1', password: 'WrongPass1', role: 'admin' });

    expect(res.status).toBe(401);
  });

  it('returns 401 when the selected role does not match the account role', async () => {
    const mockUser = buildMockUser({ role: 'employee' });
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'employee1', password: 'Employee@123', role: 'admin' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/not registered as admin/i);
  });

  it('returns 401 for a deactivated account even with correct credentials', async () => {
    const mockUser = buildMockUser({ isActive: false });
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin1', password: 'Admin@123', role: 'admin' });

    expect(res.status).toBe(401);
  });

  it('returns 400 with field-level details when the body fails validation', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'ab', password: '123' }); // too short on both fields

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.details)).toBe(true);
    expect(res.body.details.length).toBeGreaterThan(0);
    expect(User.findOne).not.toHaveBeenCalled(); // validation should short-circuit before the DB is touched
  });

  it('returns 400 when the request body is missing entirely', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns 401 when no Authorization header is present', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 200 with the user profile for a valid token', async () => {
    const token = jwt.sign({ id: '665f1a2e8b1a4c0012a3b111', username: 'admin1', role: 'admin' }, process.env.JWT_SECRET);
    User.findById.mockResolvedValue(buildMockUser());

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.username).toBe('admin1');
  });

  it('returns 404 when the token is valid but the user no longer exists', async () => {
    const token = jwt.sign({ id: 'deleted-user-id', username: 'ghost', role: 'employee' }, process.env.JWT_SECRET);
    User.findById.mockResolvedValue(null);

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
