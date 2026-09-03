import cron from 'node-cron';
import { runScan } from './scanService.js';
import { hasRunningScan } from '../models/scanModel.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export function startScheduler() {
  if (!cron.validate(env.scanCronSchedule)) {
    logger.warn(`Invalid SCAN_CRON_SCHEDULE "${env.scanCronSchedule}" — scheduler not started`);
    return;
  }

  cron.schedule(env.scanCronSchedule, async () => {
    if (await hasRunningScan()) {
      logger.warn('Scheduled scan skipped: a scan is already running');
      return;
    }
    try {
      await runScan({ trigger: 'scheduled' });
    } catch (err) {
      logger.error('Scheduled scan failed', err);
    }
  });

  logger.info(`Scheduler started (cron: "${env.scanCronSchedule}")`);
}
