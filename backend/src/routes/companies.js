const express = require('express');
const { query, getOne } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/companies/me/profile ─────────────────────────────────────────────
router.get('/me/profile', authenticateToken, requireRole('company'), async (req, res) => {
  try {
    const profile = await getOne(`
      SELECT cp.*, u.email
      FROM company_profiles cp
      JOIN users u ON u.id = cp.user_id
      WHERE cp.user_id = ?
    `, [req.user.id]);

    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── PUT /api/companies/me/profile ─────────────────────────────────────────────
router.put('/me/profile', authenticateToken, requireRole('company'), async (req, res) => {
  try {
    const { company_name, description, city, country, website, phone, employee_count } = req.body;

    await query(`
      UPDATE company_profiles SET
        company_name   = COALESCE(?, company_name),
        description    = ?,
        city           = ?,
        country        = COALESCE(?, country),
        website        = ?,
        phone          = ?,
        employee_count = ?,
        updated_at     = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `, [company_name, description || null, city || null, country,
        website || null, phone || null, employee_count || null, req.user.id]);

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// ── GET /api/companies/:id ────────────────────────────────────────────────────
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const company = await getOne(`
      SELECT cp.*, u.email,
        (SELECT COUNT(*) FROM job_posts WHERE company_id = cp.id AND status = 'active') AS active_jobs
      FROM company_profiles cp
      JOIN users u ON u.id = cp.user_id
      WHERE cp.id = ?
    `, [req.params.id]);

    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
