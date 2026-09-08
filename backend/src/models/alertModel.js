import { pool } from '../db/pool.js';

export async function createAlert(client, { deviceId, scanId, type, message }) {
  const { rows } = await client.query(
    `INSERT INTO alerts (device_id, scan_id, type, message) VALUES ($1, $2, $3, $4) RETURNING *`,
    [deviceId, scanId, type, message]
  );
  return rows[0];
}

export async function listAlerts({ acknowledged } = {}) {
  let sql = `
    SELECT a.*, d.mac_address, d.vendor, d.hostname
    FROM alerts a
    JOIN devices d ON d.id = a.device_id
  `;
  const params = [];
  if (acknowledged !== undefined) {
    params.push(acknowledged);
    sql += ` WHERE a.is_acknowledged = $${params.length}`;
  }
  sql += ' ORDER BY a.created_at DESC';
  const { rows } = await pool.query(sql, params);
  return rows;
}

export async function acknowledgeAlert(id, acknowledgedByUserId = null) {
  const { rows } = await pool.query(
    'UPDATE alerts SET is_acknowledged = true, acknowledged_by_user_id = $2 WHERE id = $1 RETURNING *',
    [id, acknowledgedByUserId]
  );
  return rows[0] || null;
}
