const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'traveloop-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
          const metaStr = Object.keys(meta).length > 1 ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} [${level}]: ${stack || message}${metaStr}`;
        })
      ),
    }),
  ],
});

if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({ filename: 'logs/error.log', level: 'error', maxsize: 10 * 1024 * 1024, maxFiles: 5 })
  );
  logger.add(
    new winston.transports.File({ filename: 'logs/combined.log', maxsize: 10 * 1024 * 1024, maxFiles: 5 })
  );
}

const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: Date.now() - start,
      ip: req.ip,
    });
  });
  next();
};

module.exports = { logger, requestLogger };