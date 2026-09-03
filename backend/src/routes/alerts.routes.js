import { Router } from 'express';
import * as alertModel from '../models/alertModel.js';

export const alertsRouter = Router();

alertsRouter.get('/', async (req, res, next) => {
  try {
    let acknowledged;
    if (req.query.acknowledged === 'true') acknowledged = true;
    else if (req.query.acknowledged === 'false') acknowledged = false;
    res.json(await alertModel.listAlerts({ acknowledged }));
  } catch (err) {
    next(err);
  }
});

alertsRouter.patch('/:id', async (req, res, next) => {
  try {
    if (req.body?.is_acknowledged !== true) {
      return res.status(400).json({ error: 'Only { is_acknowledged: true } is supported' });
    }
    const alert = await alertModel.acknowledgeAlert(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json(alert);
  } catch (err) {
    next(err);
  }
});
