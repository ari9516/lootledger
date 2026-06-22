import { useState, useEffect } from 'react'
import API from '../api/axios'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

const periods = ['week', 'month', 'year']

const StatCard = ({ label, value, color, icon }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>
          ₹{Number(value || 0).toLocaleString('en-IN')}
        </p>
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
)

export default function Dashboard() {
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState(null)
  const [period, setPeriod] = useState('month')
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [period])

  const fetchTransactions = async () => {
    try {
      const res = await API.get('/transactions')
      const data = res.data
      setTransactions(data)
      
      // Filter ONLY Profit and Loss
      const filtered = data.filter(t => t.type === 'profit' || t.type === 'loss')
      
      const totalProfit = filtered
        .filter(t => t.type === 'profit')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const totalLoss = filtered
        .filter(t => t.type === 'loss')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const netResult = totalProfit - totalLoss
      
      // Calculate period-wise summaries
      const now = new Date()
      const weekAgo = new Date(now)
      weekAgo.setDate(now.getDate() - 7)
      const monthAgo = new Date(now)
      monthAgo.setMonth(now.getMonth() - 1)
      const yearAgo = new Date(now)
      yearAgo.setFullYear(now.getFullYear() - 1)
      
      const weeklyData = data.filter(t => {
        if (t.type !== 'profit' && t.type !== 'loss') return false
        return new Date(t.date) >= weekAgo
      })
      
      const monthlyData = data.filter(t => {
        if (t.type !== 'profit' && t.type !== 'loss') return false
        return new Date(t.date) >= monthAgo
      })
      
      const yearlyData = data.filter(t => {
        if (t.type !== 'profit' && t.type !== 'loss') return false
        return new Date(t.date) >= yearAgo
      })
      
      const weeklyProfit = weeklyData.filter(t => t.type === 'profit').reduce((sum, t) => sum + t.amount, 0)
      const weeklyLoss = weeklyData.filter(t => t.type === 'loss').reduce((sum, t) => sum + t.amount, 0)
      
      const monthlyProfit = monthlyData.filter(t => t.type === 'profit').reduce((sum, t) => sum + t.amount, 0)
      const monthlyLoss = monthlyData.filter(t => t.type === 'loss').reduce((sum, t) => sum + t.amount, 0)
      
      const yearlyProfit = yearlyData.filter(t => t.type === 'profit').reduce((sum, t) => sum + t.amount, 0)
      const yearlyLoss = yearlyData.filter(t => t.type === 'loss').reduce((sum, t) => sum + t.amount, 0)
      
      setSummary({
        totalProfit,
        totalLoss,
        netResult,
        weekly: { profit: weeklyProfit, loss: weeklyLoss, net: weeklyProfit - weeklyLoss },
        monthly: { profit: monthlyProfit, loss: monthlyLoss, net: monthlyProfit - monthlyLoss },
        yearly: { profit: yearlyProfit, loss: yearlyLoss, net: yearlyProfit - yearlyLoss },
        transactionCount: filtered.length
      })
      
      // Prepare chart data - Profit vs Loss by date
      const grouped = {}
      data.forEach((t) => {
        if (t.type !== 'profit' && t.type !== 'loss') return
        const date = new Date(t.date).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short'
        })
        if (!grouped[date]) grouped[date] = { date, profit: 0, loss: 0 }
        if (t.type === 'profit') {
          grouped[date].profit += t.amount
        } else {
          grouped[date].loss += t.amount
        }
      })
      
      setChartData(Object.values(grouped).slice(-10))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    )
  }

  // Get current period data
  const getPeriodData = () => {
    if (!summary) return { profit: 0, loss: 0, net: 0 }
    switch(period) {
      case 'week': return summary.weekly
      case 'month': return summary.monthly
      case 'year': return summary.yearly
      default: return { profit: summary.totalProfit, loss: summary.totalLoss, net: summary.netResult }
    }
  }

  const periodData = getPeriodData()

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-8">
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Profit & Loss Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Track your gaming profits and losses</p>
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

        {/* Summary Cards - Only Profit & Loss */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total Profit"
            value={periodData.profit}
            color="text-green-400"
            icon="📈"
          />
          <StatCard
            label="Total Loss"
            value={periodData.loss}
            color="text-red-400"
            icon="📉"
          />
          <StatCard
            label="Net Result"
            value={periodData.net}
            color={periodData.net >= 0 ? 'text-indigo-400' : 'text-red-400'}
            icon={periodData.net >= 0 ? '🎯' : '💔'}
          />
        </div>

        {/* Time Period Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">This Week</p>
            <p className={`text-xl font-bold ${summary?.weekly?.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {summary?.weekly?.net >= 0 ? '+' : ''}₹{(summary?.weekly?.net || 0).toLocaleString('en-IN')}
            </p>
            <div className="flex gap-4 mt-1 text-xs">
              <span className="text-green-400">+₹{(summary?.weekly?.profit || 0).toLocaleString('en-IN')}</span>
              <span className="text-red-400">-₹{(summary?.weekly?.loss || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">This Month</p>
            <p className={`text-xl font-bold ${summary?.monthly?.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {summary?.monthly?.net >= 0 ? '+' : ''}₹{(summary?.monthly?.net || 0).toLocaleString('en-IN')}
            </p>
            <div className="flex gap-4 mt-1 text-xs">
              <span className="text-green-400">+₹{(summary?.monthly?.profit || 0).toLocaleString('en-IN')}</span>
              <span className="text-red-400">-₹{(summary?.monthly?.loss || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">This Year</p>
            <p className={`text-xl font-bold ${summary?.yearly?.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {summary?.yearly?.net >= 0 ? '+' : ''}₹{(summary?.yearly?.net || 0).toLocaleString('en-IN')}
            </p>
            <div className="flex gap-4 mt-1 text-xs">
              <span className="text-green-400">+₹{(summary?.yearly?.profit || 0).toLocaleString('en-IN')}</span>
              <span className="text-red-400">-₹{(summary?.yearly?.loss || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Chart - Profit vs Loss */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-white font-semibold mb-4">Profit vs Loss Over Time</h2>
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
                  formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#4ade80"
                  strokeWidth={2}
                  dot={{ fill: '#4ade80' }}
                  name="Profit"
                />
                <Line
                  type="monotone"
                  dataKey="loss"
                  stroke="#f87171"
                  strokeWidth={2}
                  dot={{ fill: '#f87171' }}
                  name="Loss"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No profit or loss transactions yet.</p>
            </div>
          )}
        </div>

        {/* Recent Profit & Loss Transactions */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Recent Profit & Loss</h2>
          {transactions.filter(t => t.type === 'profit' || t.type === 'loss').length === 0 ? (
            <p className="text-gray-500 text-center py-4">No profit or loss transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-gray-400 border-b border-gray-800">
                  <tr>
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Category</th>
                    <th className="text-right py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .filter(t => t.type === 'profit' || t.type === 'loss')
                    .slice(0, 5)
                    .map((t) => (
                      <tr key={t.id} className="border-b border-gray-800">
                        <td className="py-2 text-gray-300">
                          {new Date(t.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </td>
                        <td className="py-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            t.type === 'profit' 
                              ? 'text-green-400 bg-green-900/30' 
                              : 'text-red-400 bg-red-900/30'
                          }`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="py-2 text-white">{t.category}</td>
                        <td className={`py-2 text-right font-semibold ${
                          t.type === 'profit' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {t.type === 'profit' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
