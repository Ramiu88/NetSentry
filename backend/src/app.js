import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { authRouter } from './routes/auth.routes.js';
import { scansRouter } from './routes/scans.routes.js';
import { devicesRouter } from './routes/devices.routes.js';
import { alertsRouter } from './routes/alerts.routes.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', authRouter);
  app.use('/api/scans', authMiddleware, scansRouter);
  app.use('/api/devices', authMiddleware, devicesRouter);
  app.use('/api/alerts', authMiddleware, alertsRouter);

  app.use((req, res) => res.status(404).json({ error: 'Not found' }));
  app.use(errorHandler);

  return app;
}
