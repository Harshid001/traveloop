const { doubleCsrf } = require('csrf-csrf');
const { env } = require('../config/env');

const {
  generateCsrfToken,
  doubleCsrfProtection,
  invalidCsrfTokenError,
} = doubleCsrf({
  getSecret: () => env.JWT_SECRET,
  getSessionIdentifier: (req) => req.ip || 'unknown',
  cookieName: 'traveloop-csrf-token',
  cookieOptions: {
    httpOnly: false,
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
  },
  size: 64,
  getTokenFromRequest: (req) => req.headers['x-csrf-token'],
});

function csrfErrorHandler(err, req, res, next) {
  if (err === invalidCsrfTokenError) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token',
    });
  }
  next(err);
}

module.exports = { generateCsrfToken, doubleCsrfProtection, csrfErrorHandler };
