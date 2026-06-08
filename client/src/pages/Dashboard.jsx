import { useState, useEffect } from 'react'
import API from '../api/axios'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

const periods = ['week', 'month', 'year']

const StatCard = ({ label, value, color }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
    <p className="text-gray-400 text-sm mb-1">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>
      ₹{Number(value || 0).toLocaleString('en-IN')}
    </p>
  </div>
)

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [period, setPeriod] = useState('month')
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummary()
    fetchChartData()
  }, [period])

  const fetchSummary = async () => {
    try {
      const res = await API.get(`/transactions/summary?period=${period}`)
      setSummary(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchChartData = async () => {
    try {
      const res = await API.get('/transactions')
      const transactions = res.data

      const grouped = {}
      transactions.forEach((t) => {
        const date = new Date(t.date).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short'
        })
        if (!grouped[date]) grouped[date] = { date, in: 0, out: 0 }
        if (t.type === 'deposit' || t.type === 'sale') {
          grouped[date].in += t.amount
        } else {
          grouped[date].out += t.amount
        }
      })

      setChartData(Object.values(grouped).slice(-10))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-8">
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Your gaming economy at a glance</p>
          </div>
          <div className="flex gap-2">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  period === p
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total In"
            value={summary?.totalIn}
            color="text-green-400"
          />
          <StatCard
            label="Total Out"
            value={summary?.totalOut}
            color="text-red-400"
          />
          <StatCard
            label="Net Profit / Loss"
            value={summary?.netProfit}
            color={summary?.netProfit >= 0 ? 'text-indigo-400' : 'text-red-400'}
          />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-white font-semibold mb-4">Transaction History</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #1f2937',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="in"
                  stroke="#4ade80"
                  strokeWidth={2}
                  dot={false}
                  name="Money In"
                />
                <Line
                  type="monotone"
                  dataKey="out"
                  stroke="#f87171"
                  strokeWidth={2}
                  dot={false}
                  name="Money Out"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No transactions yet. Add some to see the chart.</p>
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-2">Summary</h2>
          <p className="text-gray-400 text-sm">
            {summary?.transactionCount || 0} transactions in the selected period.
            Net position is{' '}
            <span className={summary?.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
              {summary?.netProfit >= 0 ? 'profitable' : 'at a loss'}
            </span>.
          </p>
        </div>
      </div>
    </div>
  )
}