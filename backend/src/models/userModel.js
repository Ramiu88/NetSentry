import { pool } from '../db/pool.js';

export async function countUsers() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM users');
  return rows[0].count;
}

export async function createUser({ username, passwordHash }) {
  const { rows } = await pool.query(
    'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
    [username, passwordHash]
  );
  return rows[0];
}

export async function findUserByUsername(username) {
  const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return rows[0] || null;
}

export async function findUserById(id) {
  const { rows } = await pool.query('SELECT id, username, created_at FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}
