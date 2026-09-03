import { Router } from 'express';
import * as deviceModel from '../models/deviceModel.js';

export const devicesRouter = Router();

devicesRouter.get('/', async (req, res, next) => {
  try {
    res.json(await deviceModel.listDevices({ status: req.query.status }));
  } catch (err) {
    next(err);
  }
});

devicesRouter.get('/:id', async (req, res, next) => {
  try {
    const device = await deviceModel.getDeviceById(req.params.id);
    if (!device) return res.status(404).json({ error: 'Device not found' });
    const sightings = await deviceModel.getDeviceSightings(device.id);
    res.json({ ...device, sightings });
  } catch (err) {
    next(err);
  }
});

devicesRouter.patch('/:id', async (req, res, next) => {
  try {
    const { is_known: isKnown, notes } = req.body || {};
    const device = await deviceModel.updateDevice(req.params.id, { isKnown, notes });
    if (!device) return res.status(404).json({ error: 'Device not found' });
    res.json(device);
  } catch (err) {
    next(err);
  }
});
