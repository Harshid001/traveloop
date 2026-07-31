const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

describe('Auth Security', () => {
  test('JWT token generation and verification', () => {
    const secret = 'test-jwt-secret';
    const payload = { id: '507f1f77bcf86cd799439011', role: 'user' };
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    expect(token).toBeTruthy();
    const decoded = jwt.verify(token, secret);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.role).toBe('user');
  });

  test('JWT with invalid signature is rejected', () => {
    const token = jwt.sign({ id: '1' }, 'secret-a', { expiresIn: '1h' });
    expect(() => jwt.verify(token, 'secret-b')).toThrow();
  });

  test('expired tokens are rejected', () => {
    const token = jwt.sign({ id: '1' }, 'secret', { expiresIn: '0s' });
    expect(() => jwt.verify(token, 'secret')).toThrow(jwt.TokenExpiredError);
  });

  test('bcrypt hashes and compares passwords', async () => {
    const password = 'Str0ngP@ss1';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    expect(hash).not.toBe(password);
    const match = await bcrypt.compare(password, hash);
    expect(match).toBe(true);
    const noMatch = await bcrypt.compare('wrong-password', hash);
    expect(noMatch).toBe(false);
  });
});

describe('Input Sanitization', () => {
  test('regex special characters are escaped', () => {
    const input = 'test.*+?^${}()|[\\]';
    const escaped = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    expect(escaped).toBe('test\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\\\\\]');
  });
});