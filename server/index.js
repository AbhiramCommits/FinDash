/*
  ──  CURL EXAMPLES  ─────────────────────────────────────────────────────

  # 1. Register a user (admin only — seed an admin first, see step 2)
  curl -s -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <admin_token>" \
    -d '{"username":"analyst1","password":"secret123","role":"analyst"}'

  # 2. Login
  curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"analyst1","password":"secret123"}'

  # 3. Access a protected route (example: /api/auth/register as admin)
  curl -s -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <token_from_login>" \
    -d '{"username":"viewer1","password":"viewerpass","role":"viewer"}'

  # 4. Missing token → 401
  curl -s -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"username":"hacker","password":"bad","role":"viewer"}'

  # 5. Insufficient role (analyst tries to register) → 403
  curl -s -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <analyst_token>" \
    -d '{"username":"newguy","password":"pw","role":"viewer"}'

  # 6. Analytics summary (last 30 days)
  curl -s http://localhost:3000/api/analytics/summary \
    -H "Authorization: Bearer <token>"

  # 7. TCA for a date range with optional client filter
  curl -s "http://localhost:3000/api/analytics/tca?start=2026-03-01&end=2026-06-09&client_id=1" \
    -H "Authorization: Bearer <token>"

  # 8. Client analytics (admin/analyst only)
  curl -s http://localhost:3000/api/analytics/clients \
    -H "Authorization: Bearer <token>"

  # 9. Top 3 algos by lowest slippage
  curl -s http://localhost:3000/api/analytics/top-algos \
    -H "Authorization: Bearer <token>"
  ───────────────────────────────────────────────────────────────────────
*/

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`FinDash server running on port ${PORT}`);
});

module.exports = app;
