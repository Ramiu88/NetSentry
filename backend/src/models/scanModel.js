import { pool } from '../db/pool.js';

export async function createScan(client, { targetCidr, trigger }) {
  const { rows } = await client.query(
    `INSERT INTO scans (target_cidr, trigger, status) VALUES ($1, $2, 'running') RETURNING *`,
    [targetCidr, trigger]
  );
  return rows[0];
}

export async function completeScan(client, scanId, { hostsFound }) {
  await client.query(
    `UPDATE scans SET status = 'completed', finished_at = now(), hosts_found = $2 WHERE id = $1`,
    [scanId, hostsFound]
  );
}

export async function failScan(client, scanId, errorMessage) {
  await client.query(
    `UPDATE scans SET status = 'failed', finished_at = now(), error_message = $2 WHERE id = $1`,
    [scanId, errorMessage]
  );
}

export async function hasRunningScan() {
  const { rows } = await pool.query("SELECT id FROM scans WHERE status = 'running' LIMIT 1");
  return rows.length > 0;
}

export async function listScans({ limit = 50 } = {}) {
  const { rows } = await pool.query(
    'SELECT * FROM scans ORDER BY started_at DESC LIMIT $1',
    [limit]
  );
  return rows;
}

export async function getScanById(id) {
  const { rows } = await pool.query('SELECT * FROM scans WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function getScanSightings(scanId) {
  const { rows } = await pool.query(
    `SELECT ds.*, d.mac_address, d.vendor, d.hostname, d.is_known
     FROM device_sightings ds
     JOIN devices d ON d.id = ds.device_id
     WHERE ds.scan_id = $1
     ORDER BY ds.ip_address`,
    [scanId]
  );
  return rows;
}
