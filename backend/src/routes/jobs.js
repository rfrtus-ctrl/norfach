const express = require('express');
const { query, getOne } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/jobs — Browse jobs ───────────────────────────────────────────────
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { city, job_type, salary_type, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = `
      SELECT jp.*, cp.company_name, cp.logo_url, cp.city AS company_city, cp.verified
      FROM job_posts jp
      JOIN company_profiles cp ON cp.id = jp.company_id
      WHERE jp.status = 'active'
    `;
    const params = [];

    if (city) { sql += ' AND LOWER(jp.city) LIKE ?'; params.push(`%${city.toLowerCase()}%`); }
    if (job_type) { sql += ' AND jp.job_type = ?'; params.push(job_type); }
    if (salary_type) { sql += ' AND jp.salary_type = ?'; params.push(salary_type); }

    sql += ' ORDER BY jp.created_at DESC';
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const jobs = await query(sql, params);
    res.json(jobs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /api/jobs/:id ─────────────────────────────────────────────────────────
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const job = await getOne(`
      SELECT jp.*, cp.company_name, cp.logo_url, cp.description AS company_desc,
             cp.city AS company_city, cp.verified, cp.employee_count
      FROM job_posts jp
      JOIN company_profiles cp ON cp.id = jp.company_id
      WHERE jp.id = ?
    `, [req.params.id]);

    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── POST /api/jobs — Company posts a job ─────────────────────────────────────
router.post('/', authenticateToken, requireRole('company'), async (req, res) => {
  try {
    const { title, description, city, country, salary_min, salary_max, salary_type, job_type, required_skills } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const company = await getOne('SELECT id FROM company_profiles WHERE user_id = ?', [req.user.id]);
    if (!company) return res.status(404).json({ error: 'Company profile not found' });

    const job = await getOne(`
      INSERT INTO job_posts (company_id, title, description, city, country, salary_min, salary_max, salary_type, job_type, required_skills)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id
    `, [company.id, title, description || null, city || null, country || 'SK',
        salary_min || null, salary_max || null, salary_type || 'hourly',
        job_type || 'full-time', required_skills || null]);

    res.status(201).json({ id: job.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── PUT /api/jobs/:id ─────────────────────────────────────────────────────────
router.put('/:id', authenticateToken, requireRole('company'), async (req, res) => {
  try {
    const company = await getOne('SELECT id FROM company_profiles WHERE user_id = ?', [req.user.id]);
    const job = await getOne('SELECT * FROM job_posts WHERE id = ? AND company_id = ?', [req.params.id, company?.id]);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const { title, description, city, salary_min, salary_max, salary_type, job_type, status, required_skills } = req.body;
    await query(`
      UPDATE job_posts SET
        title = COALESCE(?, title), description = ?, city = ?,
        salary_min = ?, salary_max = ?, salary_type = COALESCE(?, salary_type),
        job_type = COALESCE(?, job_type), status = COALESCE(?, status),
        required_skills = COALESCE(?, required_skills), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [title, description, city, salary_min, salary_max, salary_type, job_type, status, required_skills, req.params.id]);

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /api/jobs/my/posts — Company's own jobs ───────────────────────────────
router.get('/my/posts', authenticateToken, requireRole('company'), async (req, res) => {
  try {
    const company = await getOne('SELECT id FROM company_profiles WHERE user_id = ?', [req.user.id]);
    if (!company) return res.status(404).json({ error: 'Company profile not found' });

    const jobs = await query(`
      SELECT jp.*,
        (SELECT COUNT(*) FROM applications WHERE job_id = jp.id) AS application_count
      FROM job_posts jp
      WHERE jp.company_id = ?
      ORDER BY jp.created_at DESC
    `, [company.id]);

    res.json(jobs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
