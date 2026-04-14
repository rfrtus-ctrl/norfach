const { Pool, types } = require('pg');

// ── Startup diagnostics ────────────────────────────────────────────────────────
const rawUrl = process.env.DATABASE_URL || '';
console.log('[db] NODE_ENV          :', process.env.NODE_ENV);
console.log('[db] DATABASE_URL(50)  :', rawUrl.slice(0, 50) || '(not set)');

if (!rawUrl) {
  console.error('[db] FATAL: DATABASE_URL is not set — exiting');
  process.exit(1);
}

let parsedUrl;
try {
  parsedUrl = new URL(rawUrl);
  console.log('[db] parsed host       :', parsedUrl.hostname);
  console.log('[db] parsed port       :', parsedUrl.port || '5432 (default)');
  console.log('[db] parsed database   :', parsedUrl.pathname.slice(1));
  if (parsedUrl.hostname === 'base' || parsedUrl.hostname === '') {
    console.error('[db] FATAL: hostname resolved to "' + parsedUrl.hostname + '".');
    console.error('[db]        Use the External Database URL from Render dashboard.');
    process.exit(1);
  }
} catch (e) {
  console.error('[db] FATAL: DATABASE_URL is not a valid URL:', e.message);
  process.exit(1);
}

// ── Pool ───────────────────────────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  host:     parsedUrl.hostname,
  port:     parseInt(parsedUrl.port, 10) || 5432,
  database: parsedUrl.pathname.slice(1),
  user:     parsedUrl.username,
  password: parsedUrl.password,
  ssl:      isProduction ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis:       30000,
  max:                     10,
});

pool.on('error', (err) => console.error('[db] pool error:', err.message));

// Return DATE columns as plain YYYY-MM-DD strings (not JS Date objects)
types.setTypeParser(1082, val => val);

// ── Retry logic ────────────────────────────────────────────────────────────────
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

async function connectWithRetry(attempt = 1) {
  try {
    const client = await pool.connect();
    console.log('[db] connected to PostgreSQL on attempt', attempt);
    client.release();
  } catch (err) {
    console.error(`[db] connection attempt ${attempt}/${MAX_RETRIES} failed:`, err.message);
    if (attempt >= MAX_RETRIES) {
      console.error('[db] FATAL: could not connect after', MAX_RETRIES, 'attempts — exiting');
      process.exit(1);
    }
    console.log(`[db] retrying in ${RETRY_DELAY_MS / 1000}s…`);
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    return connectWithRetry(attempt + 1);
  }
}

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

module.exports = { pool, query, getOne, withTransaction, connectWithRetry };
