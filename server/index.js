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
  ───────────────────────────────────────────────────────────────────────
*/

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`FinDash server running on port ${PORT}`);
});

module.exports = app;
