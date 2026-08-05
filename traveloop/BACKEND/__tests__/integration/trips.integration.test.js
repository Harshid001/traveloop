const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Trip = require('../../src/models/Trip');

jest.setTimeout(300000);

let mongoServer;
let authToken;
let csrfToken;
let csrfCookie;
let userId;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-integration-tests-32chars+';
  process.env.CLIENT_URL = 'http://localhost:5173';
  process.env.EMAIL_USER = '';
  process.env.EMAIL_PASS = '';

  if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('localhost')) {
    try {
      mongoServer = await MongoMemoryServer.create();
      process.env.MONGO_URI = mongoServer.getUri();
    } catch (e) {
      process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/traveloop_test';
    }
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

async function getCsrfTokens() {
  const res = await request(app).get('/api/csrf-token');
  const setCookie = res.headers['set-cookie'];
  const csrfCookie = setCookie.find(c => c.startsWith('traveloop-csrf-token='));
  return { token: res.body.csrfToken, cookie: csrfCookie ? csrfCookie.split(';')[0] : '' };
}

beforeEach(async () => {
  await Trip.deleteMany({});
  await User.deleteMany({});

  const csrf = await getCsrfTokens();
  csrfToken = csrf.token;
  csrfCookie = csrf.cookie;

  const registerRes = await request(app)
    .post('/api/auth/register')
    .set('X-CSRF-Token', csrfToken)
    .set('Cookie', csrfCookie)
    .send({ name: 'Trip Tester', email: 'trip@test.com', password: 'TripTest@123' });

  authToken = registerRes.body.data.token;
  userId = registerRes.body.data._id;
});

function authHeaders() {
  return {
    Authorization: `Bearer ${authToken}`,
    'X-CSRF-Token': csrfToken,
    Cookie: csrfCookie,
  };
}

describe('Trip CRUD', () => {
  test('POST /api/v1/trips creates a new trip', async () => {
    const res = await request(app)
      .post('/api/v1/trips')
      .set(authHeaders())
      .send({
        title: 'My Bali Adventure',
        destination: 'Bali, Indonesia',
        startDate: '2026-09-01',
        endDate: '2026-09-15',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('My Bali Adventure');
    expect(res.body.data.user).toBe(userId);
  });

  test('POST /api/v1/trips fails without title', async () => {
    const res = await request(app)
      .post('/api/v1/trips')
      .set(authHeaders())
      .send({
        startDate: '2026-09-01',
        endDate: '2026-09-15',
      });

    expect(res.status).toBe(400);
  });

  test('GET /api/v1/trips returns user trips', async () => {
    await request(app)
      .post('/api/v1/trips')
      .set(authHeaders())
      .send({ title: 'Trip 1', destination: 'Paris, France', startDate: '2026-09-01', endDate: '2026-09-05' });

    await request(app)
      .post('/api/v1/trips')
      .set(authHeaders())
      .send({ title: 'Trip 2', destination: 'Tokyo, Japan', startDate: '2026-10-01', endDate: '2026-10-10' });

    const res = await request(app)
      .get('/api/v1/trips')
      .set(authHeaders());

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  test('GET /api/v1/trips/:id returns a single trip', async () => {
    const createRes = await request(app)
      .post('/api/v1/trips')
      .set(authHeaders())
      .send({ title: 'Single Trip', destination: 'Rome, Italy', startDate: '2026-08-01', endDate: '2026-08-10' });

    const tripId = createRes.body.data._id;

    const res = await request(app)
      .get(`/api/v1/trips/${tripId}`)
      .set(authHeaders());

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Single Trip');
  });

  test('PUT /api/v1/trips/:id updates a trip', async () => {
    const createRes = await request(app)
      .post('/api/v1/trips')
      .set(authHeaders())
      .send({ title: 'Old Title', destination: 'Berlin, Germany', startDate: '2026-07-01', endDate: '2026-07-05' });

    const tripId = createRes.body.data._id;

    const res = await request(app)
      .put(`/api/v1/trips/${tripId}`)
      .set(authHeaders())
      .send({ title: 'Updated Title' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Title');
  });

  test('DELETE /api/v1/trips/:id deletes a trip', async () => {
    const createRes = await request(app)
      .post('/api/v1/trips')
      .set(authHeaders())
      .send({ title: 'To Delete', destination: 'Madrid, Spain', startDate: '2026-06-01', endDate: '2026-06-05' });

    const tripId = createRes.body.data._id;

    const deleteRes = await request(app)
      .delete(`/api/v1/trips/${tripId}`)
      .set(authHeaders());

    expect(deleteRes.status).toBe(200);

    const getRes = await request(app)
      .get(`/api/v1/trips/${tripId}`)
      .set(authHeaders());

    expect(getRes.status).toBe(404);
  });

  test('GET /api/v1/trips returns empty array for new user', async () => {
    const res = await request(app)
      .get('/api/v1/trips')
      .set(authHeaders());

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  test('cannot access trips without auth', async () => {
    const csrf = await getCsrfTokens();
    const res = await request(app)
      .get('/api/v1/trips')
      .set('X-CSRF-Token', csrf.token)
      .set('Cookie', csrf.cookie);

    expect(res.status).toBe(401);
  });
});