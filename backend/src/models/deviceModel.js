import { pool } from '../db/pool.js';

/**
 * Upserts a device by MAC address. Returns the device row plus `wasInserted`
 * so callers (scanService/anomalyService) know whether this is a brand new device.
 */
export async function upsertDevice(client, { macAddress, vendor, hostname }) {
  const { rows } = await client.query(
    `INSERT INTO devices (mac_address, vendor, hostname, last_seen_at, is_active, updated_at)
     VALUES ($1, $2, $3, now(), true, now())
     ON CONFLICT (mac_address) DO UPDATE SET
       vendor = COALESCE(EXCLUDED.vendor, devices.vendor),
       hostname = COALESCE(EXCLUDED.hostname, devices.hostname),
       last_seen_at = now(),
       is_active = true,
       updated_at = now()
     RETURNING *, (xmax = 0) AS was_inserted`,
    [macAddress, vendor || null, hostname || null]
  );
  const row = rows[0];
  return { ...row, wasInserted: row.was_inserted };
}

export async function markInactiveExcept(client, activeDeviceIds) {
  if (activeDeviceIds.length === 0) {
    await client.query('UPDATE devices SET is_active = false WHERE is_active = true');
    return;
  }
  await client.query(
    `UPDATE devices SET is_active = false, updated_at = now()
     WHERE is_active = true AND id != ALL($1::int[])`,
    [activeDeviceIds]
  );
}

export async function listDevices({ status } = {}) {
  let sql = 'SELECT * FROM devices';
  const params = [];
  if (status === 'online') {
    sql += ' WHERE is_active = true';
  } else if (status === 'offline') {
    sql += ' WHERE is_active = false';
  } else if (status === 'unknown') {
    sql += ' WHERE is_known = false';
  }
  sql += ' ORDER BY last_seen_at DESC';
  const { rows } = await pool.query(sql, params);
  return rows;
}

export async function getDeviceById(id) {
  const { rows } = await pool.query('SELECT * FROM devices WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function getDeviceSightings(deviceId) {
  const { rows } = await pool.query(
    `SELECT ds.*, s.started_at AS scan_started_at, s.trigger AS scan_trigger
     FROM device_sightings ds
     JOIN scans s ON s.id = ds.scan_id
     WHERE ds.device_id = $1
     ORDER BY ds.seen_at DESC`,
    [deviceId]
  );
  return rows;
}

export async function updateDevice(id, { isKnown, notes }) {
  const { rows } = await pool.query(
    `UPDATE devices SET
       is_known = COALESCE($2, is_known),
       notes = COALESCE($3, notes),
       updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [id, isKnown === undefined ? null : isKnown, notes === undefined ? null : notes]
  );
  return rows[0] || null;
}

export async function insertSighting(client, { scanId, deviceId, ipAddress, openPorts, osGuess }) {
  await client.query(
    `INSERT INTO device_sightings (scan_id, device_id, ip_address, open_ports, os_guess)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (scan_id, device_id) DO UPDATE SET
       ip_address = EXCLUDED.ip_address,
       open_ports = EXCLUDED.open_ports,
       os_guess = EXCLUDED.os_guess`,
    [scanId, deviceId, ipAddress, JSON.stringify(openPorts || []), osGuess || null]
  );
}
