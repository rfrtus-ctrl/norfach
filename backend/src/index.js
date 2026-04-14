require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./database/init');
const { connectWithRetry } = require('./database/db');

const authRoutes         = require('./routes/auth');
const workerRoutes       = require('./routes/workers');
const companyRoutes      = require('./routes/companies');
const jobRoutes          = require('./routes/jobs');
const applicationRoutes  = require('./routes/applications');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', app: 'Norfach API' }));

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/workers',      workerRoutes);
app.use('/api/companies',    companyRoutes);
app.use('/api/jobs',         jobRoutes);
app.use('/api/applications', applicationRoutes);

// ── 404 handler ────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Error handler ──────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ──────────────────────────────────────────────────────────────────────
async function start() {
  try {
    await connectWithRetry();
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Norfach API running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
