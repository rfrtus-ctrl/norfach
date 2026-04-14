const express = require('express');
const { query, getOne } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/workers — Browse workers (companies see this) ────────────────────
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { city, skill, available, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = `
      SELECT wp.*, u.email,
        ARRAY(SELECT skill FROM worker_skills WHERE worker_id = wp.id) AS skills
      FROM worker_profiles wp
      JOIN users u ON u.id = wp.user_id
      WHERE 1=1
    `;
    const params = [];

    if (city) { sql += ' AND LOWER(wp.city) LIKE ?'; params.push(`%${city.toLowerCase()}%`); }
    if (available === 'true') { sql += ' AND wp.available = true'; }
    if (skill) {
      sql += ` AND EXISTS (SELECT 1 FROM worker_skills ws WHERE ws.worker_id = wp.id AND LOWER(ws.skill) LIKE ?)`;
      params.push(`%${skill.toLowerCase()}%`);
    }

    sql += ' ORDER BY wp.available DESC, wp.created_at DESC';
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const workers = await query(sql, params);
    res.json(workers);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// ── GET /api/workers/:id ──────────────────────────────────────────────────────
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const worker = await getOne(`
      SELECT wp.*, u.email,
        ARRAY(SELECT skill FROM worker_skills WHERE worker_id = wp.id) AS skills
      FROM worker_profiles wp
      JOIN users u ON u.id = wp.user_id
      WHERE wp.id = ?
    `, [req.params.id]);

    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    res.json(worker);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /api/workers/me/profile ───────────────────────────────────────────────
router.get('/me/profile', authenticateToken, requireRole('worker'), async (req, res) => {
  try {
    const profile = await getOne(`
      SELECT wp.*, u.email,
        ARRAY(SELECT skill FROM worker_skills WHERE worker_id = wp.id) AS skills
      FROM worker_profiles wp
      JOIN users u ON u.id = wp.user_id
      WHERE wp.user_id = ?
    `, [req.user.id]);

    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── PUT /api/workers/me/profile ───────────────────────────────────────────────
router.put('/me/profile', authenticateToken, requireRole('worker'), async (req, res) => {
  try {
    const {
      first_name, last_name, phone, city, country, bio,
      hourly_rate, available, years_exp, skills,
    } = req.body;

    const existing = await getOne('SELECT id FROM worker_profiles WHERE user_id = ?', [req.user.id]);
    if (!existing) return res.status(404).json({ error: 'Profile not found' });

    await query(`
      UPDATE worker_profiles SET
        first_name = COALESCE(?, first_name),
        last_name  = COALESCE(?, last_name),
        phone      = ?,
        city       = ?,
        country    = COALESCE(?, country),
        bio        = ?,
        hourly_rate= ?,
        available  = COALESCE(?, available),
        years_exp  = COALESCE(?, years_exp),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `, [first_name, last_name, phone || null, city || null, country,
        bio || null, hourly_rate || null, available, years_exp, req.user.id]);

    // Replace skills
    if (Array.isArray(skills)) {
      await query('DELETE FROM worker_skills WHERE worker_id = ?', [existing.id]);
      for (const skill of skills.filter(Boolean)) {
        await query('INSERT INTO worker_skills (worker_id, skill) VALUES (?, ?)', [existing.id, skill.trim()]);
      }
    }

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
