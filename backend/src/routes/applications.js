const express = require('express');
const { query, getOne } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// ── POST /api/applications ─────────────────────────────────────────────────────
router.post('/', authenticateToken, requireRole('worker'), async (req, res) => {
  try {
    const { job_id } = req.body;
    if (!job_id) return res.status(400).json({ error: 'job_id is required' });

    const worker = await getOne('SELECT id FROM worker_profiles WHERE user_id = ?', [req.user.id]);
    if (!worker) return res.status(404).json({ error: 'Worker profile not found' });

    const job = await getOne('SELECT id, status FROM job_posts WHERE id = ?', [job_id]);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.status !== 'active') return res.status(400).json({ error: 'Job is no longer accepting applications' });

    const existing = await getOne(
      'SELECT id FROM applications WHERE job_id = ? AND worker_id = ?',
      [job_id, worker.id]
    );
    if (existing) return res.status(409).json({ error: 'You already applied to this job' });

    const result = await query(
      'INSERT INTO applications (job_id, worker_id, status) VALUES (?, ?, ?) RETURNING id',
      [job_id, worker.id, 'pending']
    );

    res.status(201).json({ id: result.rows[0].id, message: 'Application submitted' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to apply' });
  }
});

// ── GET /api/applications/my ───────────────────────────────────────────────────
router.get('/my', authenticateToken, requireRole('worker'), async (req, res) => {
  try {
    const worker = await getOne('SELECT id FROM worker_profiles WHERE user_id = ?', [req.user.id]);
    if (!worker) return res.json([]);

    const rows = await query(`
      SELECT a.id, a.status, a.created_at,
             j.id AS job_id, j.title, j.city, j.salary_min, j.salary_max, j.salary_type, j.job_type,
             cp.company_name
      FROM applications a
      JOIN job_posts j ON j.id = a.job_id
      JOIN company_profiles cp ON cp.id = j.company_id
      WHERE a.worker_id = ?
      ORDER BY a.created_at DESC
    `, [worker.id]);

    res.json(rows.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load applications' });
  }
});

// ── GET /api/applications/job/:jobId ──────────────────────────────────────────
router.get('/job/:jobId', authenticateToken, requireRole('company'), async (req, res) => {
  try {
    const company = await getOne('SELECT id FROM company_profiles WHERE user_id = ?', [req.user.id]);
    if (!company) return res.json([]);

    const job = await getOne('SELECT id FROM job_posts WHERE id = ? AND company_id = ?', [req.params.jobId, company.id]);
    if (!job) return res.status(403).json({ error: 'Not your job' });

    const rows = await query(`
      SELECT a.id, a.status, a.created_at,
             wp.id AS worker_id, wp.first_name, wp.last_name, wp.city, wp.hourly_rate, wp.years_exp, wp.available,
             u.email
      FROM applications a
      JOIN worker_profiles wp ON wp.id = a.worker_id
      JOIN users u ON u.id = wp.user_id
      WHERE a.job_id = ?
      ORDER BY a.created_at DESC
    `, [req.params.jobId]);

    res.json(rows.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load applicants' });
  }
});

module.exports = router;
