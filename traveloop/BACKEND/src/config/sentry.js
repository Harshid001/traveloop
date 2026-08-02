const Sentry = require('@sentry/node');
const { env } = require('./env');

function initSentry(app) {
  const dsn = env.SENTRY_DSN;
  if (!dsn) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('SENTRY_DSN not set — error tracking disabled');
    }
    return;
  }

  Sentry.init({
    dsn,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
    ],
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  console.log('Sentry initialized');
}

module.exports = { initSentry };