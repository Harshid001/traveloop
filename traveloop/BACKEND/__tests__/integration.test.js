const request = require('supertest');
const app = require('../src/app');

async function getCsrfTokenAndCookie() {
  const res = await request(app).get('/api/csrf-token');
  const setCookie = res.headers['set-cookie'];
  const csrfCookie = setCookie.find(c => c.startsWith('traveloop-csrf-token='));
  return { token: res.body.csrfToken, cookie: csrfCookie.split(';')[0] };
}

describe('Health & Infrastructure', () => {
  test('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /api/csrf-token returns a token and sets cookie', async () => {
    const { token, cookie } = await getCsrfTokenAndCookie();
    expect(token).toBeTruthy();
    expect(cookie).toBeTruthy();
  });

  test('unknown route returns 404', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
  });

  test('unknown top-level route returns 404', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
  });
});

describe('CSRF Protection', () => {
  test('POST to /api/* without CSRF token is rejected', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'test123' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/csrf/i);
  });

  test('GET /api/* does not require CSRF token', async () => {
    const res = await request(app).get('/api/csrf-token');
    expect(res.status).toBe(200);
  });

  test('POST with valid CSRF token passes CSRF check', async () => {
    const { token, cookie } = await getCsrfTokenAndCookie();

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Content-Type', 'application/json')
      .set('X-CSRF-Token', token)
      .set('Cookie', cookie);

    expect(res.status).not.toBe(403);
    expect(res.status).toBe(200);
  });

  test('POST with wrong CSRF token is rejected', async () => {
    const { cookie } = await getCsrfTokenAndCookie();

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Content-Type', 'application/json')
      .set('X-CSRF-Token', 'fake-token')
      .set('Cookie', cookie);

    expect(res.status).toBe(403);
  });
});

describe('Auth Middleware (protect)', () => {
  test('route with protect returns 401 without token', async () => {
    const { token, cookie } = await getCsrfTokenAndCookie();

    const res = await request(app)
      .get('/api/auth/me')
      .set('X-CSRF-Token', token)
      .set('Cookie', cookie);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/no token|not authorized/i);
  });
});
