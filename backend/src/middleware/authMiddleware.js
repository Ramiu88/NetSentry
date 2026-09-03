import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
