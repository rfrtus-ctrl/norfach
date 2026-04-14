const { Pool, types } = require('pg');

// ── Startup diagnostics ────────────────────────────────────────────────────────
const rawUrl = process.env.DATABASE_URL || '';
console.log('[db] NODE_ENV          :', process.env.NODE_ENV);
console.log('[db] DATABASE_URL(50)  :', rawUrl.slice(0, 50) || '(not set)');

if (!rawUrl) {
  console.error('[db] FATAL: DATABASE_URL is not set — exiting');
  process.exit(1);
}

// Parse the URL to catch the "hostname = base" Render misconfiguration
try {
  const parsed = new URL(rawUrl);
  console.log('[db] parsed host       :', parsed.hostname);
  console.log('[db] parsed port       :', parsed.port);
  console.log('[db] parsed database   :', parsed.pathname.slice(1));
  if (parsed.hostname === 'base' || parsed.hostname === '') {
    console.error('[db] FATAL: DATABASE_URL hostname resolved to "' + parsed.hostname + '".');
    console.error('[db]        Use the External Database URL from the Render dashboard,');
    console.error('[db]        not the Internal URL. It should look like:');
    console.error('[db]        postgresql://user:pass@dpg-xxxx.oregon-postgres.render.com/dbname');
    process.exit(1);
  }
} catch (e) {
  console.error('[db] FATAL: DATABASE_URL is not a valid URL:', e.message);
  process.exit(1);
}

// ── Pool ───────────────────────────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: rawUrl,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
});

pool.on('connect', () => console.log('[db] connected to PostgreSQL'));
pool.on('error', (err) => console.error('[db] pool error:', err.message));

// Return DATE columns as plain YYYY-MM-DD strings (not JS Date objects)
types.setTypeParser(1082, val => val);

// ── Helpers ────────────────────────────────────────────────────────────────────

// Convert SQLite-style ? placeholders to PostgreSQL $1, $2, …
function toNamed(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

async function query(sql, params = []) {
  const result = await pool.query(toNamed(sql), params);
  return result.rows;
}

async function getOne(sql, params = []) {
  const result = await pool.query(toNamed(sql), params);
  return result.rows[0] || null;
}

async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, getOne, withTransaction };
