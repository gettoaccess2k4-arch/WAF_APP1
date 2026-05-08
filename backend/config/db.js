import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'waflab',
  user:     process.env.DB_USER     || 'waflab',
  password: process.env.DB_PASS     || 'waflab123',
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

export async function testConnection() {
  const client = await pool.connect();
  const { rows } = await client.query('SELECT NOW() AS now, current_database() AS db');
  client.release();
  console.log(`[DB] Connected → ${rows[0].db} at ${rows[0].now}`);
}
