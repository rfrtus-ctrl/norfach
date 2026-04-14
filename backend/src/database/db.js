const { Pool, types } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(isProduction && {
    ssl: { rejectUnauthorized: false },
  }),
});

// Return DATE columns as plain YYYY-MM-DD strings (not JS Date objects)
types.setTypeParser(1082, val => val);

async function query(sql, params = []) {
  const result = await pool.query(toNamed(sql), params);
  return result.rows;
}

async function getOne(sql, params = []) {
  const result = await pool.query(toNamed(sql), params);
  return result.rows[0] || null;
}

// Convert SQLite-style ? placeholders to PostgreSQL $1, $2, …
function toNamed(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
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
