import * as alertModel from '../models/alertModel.js';
import { logger } from '../utils/logger.js';

/**
 * Alerts once per device, the first time it is ever seen (devices are
 * created with is_known=false). Once an admin allowlists a device via
 * PATCH /api/devices/:id { is_known: true }, it will never alert again.
 */
export async function detectAnomalies({ scanId, newDeviceIds }, client) {
  for (const deviceId of newDeviceIds) {
    await alertModel.createAlert(client, {
      deviceId,
      scanId,
      type: 'unknown_device',
      message: 'New, unrecognized device detected on the network.',
    });
    logger.warn(`Scan ${scanId}: unknown device alert created for device ${deviceId}`);
  }
}
