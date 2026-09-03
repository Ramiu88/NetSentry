import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  logger.error(`${req.method} ${req.path} failed`, err);
  res.status(err.statusCode || 500).json({ error: err.message || 'Internal server error' });
}
