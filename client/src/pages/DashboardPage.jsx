import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../context/AuthContext.jsx'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const { authAxios } = useAuth()
  const [summary, setSummary] = useState(null)
  const [topAlgos, setTopAlgos] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [sumRes, algoRes] = await Promise.all([
          authAxios.get('/api/analytics/summary'),
          authAxios.get('/api/analytics/top-algos'),
        ])
        setSummary(sumRes.data)
        setTopAlgos(algoRes.data)
      } catch (err) {
        setError('Failed to load dashboard data')
      }
    }
    load()
  }, [authAxios])

  if (error) return <div className={styles.error}>{error}</div>
  if (!summary) return <div className={styles.loading}>Loading...</div>

  const fmtNum = (n) =>
    n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${(n / 1e3).toFixed(0)}K`

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Dashboard</h1>

      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Total Trades</div>
          <div className={styles.cardValue}>{summary.total_trades}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Total Notional</div>
          <div className={styles.cardValue}>{fmtNum(summary.total_notional)}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Avg Slippage</div>
          <div className={styles.cardValue}>{Number(summary.avg_slippage_bps).toFixed(2)} bps</div>
        </div>
      </div>

      <div className={styles.chartSection}>
        <h2 className={styles.chartTitle}>Trades by Algorithm</h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={summary.by_algo}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="algo_used" tick={{ fontSize: 13 }} />
            <YAxis tick={{ fontSize: 13 }} />
            <Tooltip />
            <Bar dataKey="trade_count" fill="#0057FF" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartSection}>
        <h2 className={styles.chartTitle}>Top 3 Algos by Lowest Slippage</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Algorithm</th>
              <th>Avg Slippage (bps)</th>
            </tr>
          </thead>
          <tbody>
            {topAlgos.map((a) => (
              <tr key={a.algo_used}>
                <td>{a.algo_used}</td>
                <td>{Number(a.avg_slippage_bps).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
