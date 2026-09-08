import { pool } from '../db/pool.js';
import { discoverHosts, enrichHosts } from './nmapService.js';
import { lookupVendor } from './ouiService.js';
import { detectAnomalies } from './anomalyService.js';
import * as scanModel from '../models/scanModel.js';
import * as deviceModel from '../models/deviceModel.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Creates the `scans` row for a new run. Fast (single INSERT) — callers that
 * need to respond to an HTTP request immediately should await this, then run
 * executeScan(scan) without awaiting it.
 */
export async function createScanRecord({ trigger = 'manual', targetCidr, triggeredByUserId = null } = {}) {
  const cidr = targetCidr || env.scanTargetCidr;
  return withClient((client) =>
    scanModel.createScan(client, { targetCidr: cidr, trigger, triggeredByUserId })
  );
}

/**
 * Runs the actual scan cycle for an already-created scan row: discover
 * hosts, enrich with open ports, persist devices + sightings, mark devices
 * that vanished as inactive, and raise alerts for any device seen for the
 * first time.
 */
export async function executeScan(scan) {
  const cidr = scan.target_cidr;

  try {
    logger.info(`Scan ${scan.id} starting (trigger=${scan.trigger}, target=${cidr})`);

    const discovered = await discoverHosts(cidr);
    const ips = discovered.map((h) => h.ip);
    const enriched = await enrichHosts(ips);
    const portsByIp = new Map(enriched.map((h) => [h.ip, h.openPorts]));

    const client = await pool.connect();
    const activeDeviceIds = [];
    const newDeviceIds = [];
    try {
      await client.query('BEGIN');

      for (const host of discovered) {
        if (!host.mac) continue; // can't uniquely key a device without a MAC address
        const vendor = host.nmapVendor || lookupVendor(host.mac);
        const device = await deviceModel.upsertDevice(client, {
          macAddress: host.mac,
          vendor,
          hostname: host.hostname,
        });
        activeDeviceIds.push(device.id);
        if (device.wasInserted) newDeviceIds.push(device.id);

        await deviceModel.insertSighting(client, {
          scanId: scan.id,
          deviceId: device.id,
          ipAddress: host.ip,
          openPorts: portsByIp.get(host.ip) || [],
        });
      }

      await deviceModel.markInactiveExcept(client, activeDeviceIds);
      await scanModel.completeScan(client, scan.id, { hostsFound: discovered.length });

      if (newDeviceIds.length > 0) {
        await detectAnomalies({ scanId: scan.id, newDeviceIds }, client);
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    logger.info(
      `Scan ${scan.id} completed: ${discovered.length} host(s) found, ${newDeviceIds.length} new`
    );
    return scanModel.getScanById(scan.id);
  } catch (err) {
    logger.error(`Scan ${scan.id} failed: ${err.message}`);
    await scanModel.failScan(pool, scan.id, err.message).catch(() => {});
    throw err;
  }
}

/**
 * Convenience wrapper for callers that don't need to respond to an HTTP
 * request before the scan finishes (the scheduler, tests): creates the scan
 * row and runs it to completion in one await.
 */
export async function runScan({ trigger = 'manual', targetCidr } = {}) {
  const scan = await createScanRecord({ trigger, targetCidr });
  return executeScan(scan);
}

async function withClient(fn) {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}
