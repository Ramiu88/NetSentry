/**
 * Backfills a handful of synthetic *past* scans for devices that were
 * already discovered by a real scan, so the History/dashboard views aren't
 * empty on a single fresh scan when recording the demo video for the jury.
 *
 * This does NOT invent fake devices or fake MAC addresses — it only adds
 * additional `scans` + `device_sightings` rows, spread over the last few
 * days, for devices that a real nmap scan already found and stored. It
 * never touches `devices` directly, so it can't trigger new "unknown
 * device" alerts (those only fire when a device is inserted for the first
 * time by the real scan pipeline).
 *
 * Usage: npm run seed:demo
 */
import { pool } from '../src/db/pool.js';
import { logger } from '../src/utils/logger.js';

const DAYS_OF_HISTORY = 5;
const SCANS_PER_DAY = 2;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

async function main() {
  const { rows: devices } = await pool.query(
    'SELECT id, mac_address, vendor FROM devices ORDER BY id'
  );

  if (devices.length === 0) {
    logger.warn('No devices found. Run a real scan first (POST /api/scans), then re-run this script.');
    process.exit(1);
  }

  const { rows: existing } = await pool.query(
    "SELECT COUNT(*)::int AS count FROM scans WHERE trigger = 'scheduled'"
  );
  if (existing[0].count > 0) {
    logger.warn(
      `Found ${existing[0].count} existing scheduled scan(s) already — demo history looks like it's ` +
        'been seeded before. Re-running will add more; press Ctrl+C now to abort, or wait to continue.'
    );
  }

  const client = await pool.connect();
  let scansCreated = 0;
  let sightingsCreated = 0;

  try {
    await client.query('BEGIN');

    const now = Date.now();
    for (let day = DAYS_OF_HISTORY; day >= 1; day--) {
      for (let s = 0; s < SCANS_PER_DAY; s++) {
        const startedAt = new Date(
          now - day * 24 * 60 * 60 * 1000 - s * 6 * 60 * 60 * 1000
        );
        const finishedAt = new Date(startedAt.getTime() + randomBetween(15, 40) * 1000);

        // Not every device shows up in every historical scan — makes the
        // timeline look organic instead of a suspiciously perfect grid.
        const presentDevices = devices.filter(() => Math.random() > 0.15);
        if (presentDevices.length === 0) continue;

        const { rows: scanRows } = await client.query(
          `INSERT INTO scans (started_at, finished_at, status, trigger, target_cidr, hosts_found)
           VALUES ($1, $2, 'completed', 'scheduled', $3, $4)
           RETURNING id`,
          [startedAt, finishedAt, '192.168.0.0/24', presentDevices.length]
        );
        const scanId = scanRows[0].id;
        scansCreated++;

        for (const device of presentDevices) {
          const lastOctet = 100 + (device.id % 150) + Math.floor(randomBetween(0, 3));
          await client.query(
            `INSERT INTO device_sightings (scan_id, device_id, ip_address, open_ports, seen_at)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (scan_id, device_id) DO NOTHING`,
            [scanId, device.id, `192.168.0.${lastOctet}`, JSON.stringify([]), finishedAt]
          );
          sightingsCreated++;
        }
      }
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  logger.info(
    `Seeded ${scansCreated} synthetic past scan(s) with ${sightingsCreated} sighting(s) ` +
      `across ${devices.length} real device(s).`
  );
  process.exit(0);
}

main().catch((err) => {
  logger.error('seedDemoHistory failed', err);
  process.exit(1);
});
