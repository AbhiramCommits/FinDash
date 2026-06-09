const express = require('express');
const pool = require('../db/pool');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/rbac');

const router = express.Router();

function isValidDate(str) {
  return /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(Date.parse(str));
}

router.use(verifyToken);

router.get('/summary', async (_req, res, next) => {
  try {
    const [totals, byAlgo] = await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS total_trades,
                COALESCE(SUM(notional), 0) AS total_notional,
                COALESCE(AVG(slippage_bps), 0) AS avg_slippage_bps
         FROM trades
         WHERE trade_date >= CURRENT_DATE - INTERVAL '30 days'`
      ),
      pool.query(
        `SELECT algo_used, COUNT(*)::int AS trade_count
         FROM trades
         WHERE trade_date >= CURRENT_DATE - INTERVAL '30 days'
         GROUP BY algo_used
         ORDER BY trade_count DESC`
      ),
    ]);

    res.json({
      ...totals.rows[0],
      by_algo: byAlgo.rows,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/tca', async (req, res, next) => {
  const { start, end, client_id } = req.query;

  if (!start || !end || !isValidDate(start) || !isValidDate(end)) {
    return res.status(400).json({ error: 'Valid start and end dates (YYYY-MM-DD) are required' });
  }

  if (start > end) {
    return res.status(400).json({ error: 'start date must be before or equal to end date' });
  }

  const clientId = client_id ? parseInt(client_id, 10) : null;
  if (client_id && (isNaN(clientId) || clientId < 1)) {
    return res.status(400).json({ error: 'client_id must be a positive integer' });
  }

  try {
    const result = await pool.query(
      `SELECT trade_date,
              COALESCE(AVG(slippage_bps), 0) AS avg_slippage_bps,
              COALESCE(AVG(execution_price - benchmark_price), 0) AS avg_price_diff
       FROM trades
       WHERE trade_date >= $1
         AND trade_date <= $2
         AND ($3::int IS NULL OR client_id = $3)
       GROUP BY trade_date
       ORDER BY trade_date`,
      [start, end, clientId]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get(
  '/clients',
  requireRole('admin', 'analyst'),
  async (_req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT c.name,
                c.type,
                COUNT(t.id)::int AS trade_count,
                COALESCE(AVG(t.slippage_bps), 0) AS avg_slippage
         FROM clients c
         LEFT JOIN trades t ON c.id = t.client_id
         GROUP BY c.id, c.name, c.type
         ORDER BY c.name`
      );

      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/top-algos', async (_req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT algo_used,
              COALESCE(AVG(slippage_bps), 0) AS avg_slippage_bps
       FROM trades
       GROUP BY algo_used
       ORDER BY avg_slippage_bps ASC
       LIMIT 3`
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
