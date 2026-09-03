import { Router } from 'express';
import * as scanModel from '../models/scanModel.js';
import { createScanRecord, executeScan } from '../services/scanService.js';
import { logger } from '../utils/logger.js';

export const scansRouter = Router();

scansRouter.post('/', async (req, res, next) => {
  try {
    if (await scanModel.hasRunningScan()) {
      return res.status(409).json({ error: 'A scan is already running' });
    }

    const { targetCidr } = req.body || {};
    const scan = await createScanRecord({ trigger: 'manual', targetCidr });

    // Fire and forget: the scan can take a while, the client polls GET /api/scans/:id.
    executeScan(scan).catch((err) => logger.error(`Manual scan ${scan.id} failed`, err));

    res.status(202).json(scan);
  } catch (err) {
    next(err);
  }
});

scansRouter.get('/', async (req, res, next) => {
  try {
    res.json(await scanModel.listScans());
  } catch (err) {
    next(err);
  }
});

scansRouter.get('/:id', async (req, res, next) => {
  try {
    const scan = await scanModel.getScanById(req.params.id);
    if (!scan) return res.status(404).json({ error: 'Scan not found' });
    const sightings = await scanModel.getScanSightings(scan.id);
    res.json({ ...scan, sightings });
  } catch (err) {
    next(err);
  }
});
