const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const User = require('../../src/models/User');

jest.setTimeout(300000);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-for-integration-tests-32chars+';
  process.env.CLIENT_URL = 'http://localhost:5173';
  process.env.EMAIL_USER = '';
  process.env.EMAIL_PASS = '';

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
});

async function getCsrfTokens() {
  const res = await request(app).get('/api/csrf-token');
  const setCookie = res.headers['set-cookie'];
  const csrfCookie = setCookie.find(c => c.startsWith('traveloop-csrf-token='));
  return { token: res.body.csrfToken, cookie: csrfCookie ? csrfCookie.split(';')[0] : '' };
}

async function registerUser(userData = {}) {
  const defaults = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Test@1234',
  };
  const { token, cookie } = await getCsrfTokens();
  const res = await request(app)
    .post('/api/auth/register')
    .set('X-CSRF-Token', token)
    .set('Cookie', cookie)
    .send({ ...defaults, ...userData });
  return res;
}

async function loginUser(email, password) {
  const { token, cookie } = await getCsrfTokens();
  const res = await request(app)
    .post('/api/auth/login')
    .set('X-CSRF-Token', token)
    .set('Cookie', cookie)
    .send({ email, password });
  return res;
}

describe('Auth Flow — register → login → me', () => {
  test('POST /api/auth/register creates a new user and returns token', async () => {
    const res = await registerUser();
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.email).toBe('test@example.com');
  });

  test('POST /api/auth/register rejects duplicate email', async () => {
    await registerUser();
    const res = await registerUser();
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test('POST /api/auth/register rejects weak password', async () => {
    const { token, cookie } = await getCsrfTokens();
    const res = await request(app)
      .post('/api/auth/register')
      .set('X-CSRF-Token', token)
      .set('Cookie', cookie)
      .send({ name: 'Test', email: 'weak@example.com', password: '123' });
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/login authenticates a registered user', async () => {
    await registerUser();
    const res = await loginUser('test@example.com', 'Test@1234');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();
  });

  test('POST /api/auth/login rejects wrong password', async () => {
    await registerUser();
    const res = await loginUser('test@example.com', 'WrongPass1!');
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  test('GET /api/auth/me returns user profile with valid token', async () => {
    const registerRes = await registerUser();
    const authToken = registerRes.body.data.token;

    const { token, cookie } = await getCsrfTokens();
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`)
      .set('X-CSRF-Token', token)
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('test@example.com');
    expect(res.body.data.name).toBe('Test User');
    expect(res.body.data._id).toBeTruthy();
  });

  test('GET /api/auth/me returns 401 without token', async () => {
    const { token, cookie } = await getCsrfTokens();
    const res = await request(app)
      .get('/api/auth/me')
      .set('X-CSRF-Token', token)
      .set('Cookie', cookie);

    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me returns 401 with invalid token', async () => {
    const { token, cookie } = await getCsrfTokens();
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid_token_here')
      .set('X-CSRF-Token', token)
      .set('Cookie', cookie);

    expect(res.status).toBe(401);
  });

  test('complete auth flow: register → login → me', async () => {
    const registerRes = await registerUser({
      name: 'Flow User',
      email: 'flow@example.com',
      password: 'FlowTest@123',
    });
    expect(registerRes.status).toBe(201);

    const loginRes = await loginUser('flow@example.com', 'FlowTest@123');
    expect(loginRes.status).toBe(200);
    const token2 = loginRes.body.data.token;
    expect(token2).toBeTruthy();

    const { token, cookie } = await getCsrfTokens();
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token2}`)
      .set('X-CSRF-Token', token)
      .set('Cookie', cookie);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.email).toBe('flow@example.com');
    expect(meRes.body.data.name).toBe('Flow User');
  });
});