import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAuth } from '../context/AuthContext.jsx'
import styles from './TCAPage.module.css'

export default function TCAPage() {
  const { authAxios } = useAuth()
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [clientId, setClientId] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const params = { start, end }
      if (clientId) params.client_id = clientId
      const res = await authAxios.get('/api/analytics/tca', { params })
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch TCA data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>TCA Analysis</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>Start Date</label>
          <input
            className={styles.input}
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>End Date</label>
          <input
            className={styles.input}
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Client ID (optional)</label>
          <input
            className={styles.input}
            type="text"
            placeholder="e.g. 1"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          />
        </div>
        <button className={styles.btn} type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Run TCA'}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      {data && data.length === 0 && (
        <p className={styles.empty}>No trade data for the selected range.</p>
      )}

      {data && data.length > 0 && (
        <div className={styles.chartSection}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="trade_date" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="avg_slippage_bps"
                stroke="#0057FF"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Avg Slippage (bps)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avg_price_diff"
                stroke="#000"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Avg Price Diff"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
