const { pool } = require('./db');

async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        email         TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role          TEXT NOT NULL CHECK(role IN ('worker', 'company')),
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS worker_profiles (
        id            SERIAL PRIMARY KEY,
        user_id       INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        first_name    TEXT NOT NULL,
        last_name     TEXT NOT NULL,
        phone         TEXT,
        city          TEXT,
        country       TEXT DEFAULT 'SK',
        bio           TEXT,
        avatar_url    TEXT,
        hourly_rate   NUMERIC(10,2),
        available     BOOLEAN DEFAULT true,
        years_exp     INTEGER DEFAULT 0,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS worker_skills (
        id         SERIAL PRIMARY KEY,
        worker_id  INTEGER NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
        skill      TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS company_profiles (
        id           SERIAL PRIMARY KEY,
        user_id      INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        company_name TEXT NOT NULL,
        description  TEXT,
        city         TEXT,
        country      TEXT DEFAULT 'SK',
        website      TEXT,
        logo_url     TEXT,
        phone        TEXT,
        employee_count TEXT,
        verified     BOOLEAN DEFAULT false,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS job_posts (
        id           SERIAL PRIMARY KEY,
        company_id   INTEGER NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
        title        TEXT NOT NULL,
        description  TEXT,
        city         TEXT,
        country      TEXT DEFAULT 'SK',
        salary_min   NUMERIC(10,2),
        salary_max   NUMERIC(10,2),
        salary_type  TEXT DEFAULT 'hourly' CHECK(salary_type IN ('hourly','monthly','project')),
        job_type     TEXT DEFAULT 'full-time' CHECK(job_type IN ('full-time','part-time','project','temporary')),
        status       TEXT DEFAULT 'active' CHECK(status IN ('active','paused','closed')),
        required_skills TEXT[],
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS applications (
        id           SERIAL PRIMARY KEY,
        job_id       INTEGER NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
        worker_id    INTEGER NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
        message      TEXT,
        status       TEXT DEFAULT 'pending' CHECK(status IN ('pending','viewed','accepted','rejected')),
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(job_id, worker_id)
      );

      CREATE TABLE IF NOT EXISTS saved_items (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        item_type  TEXT NOT NULL CHECK(item_type IN ('job','worker')),
        item_id    INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, item_type, item_id)
      );
    `);
    console.log('✅ Database schema ready');
  } catch (err) {
    console.error('❌ Database init error:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { initDatabase };
