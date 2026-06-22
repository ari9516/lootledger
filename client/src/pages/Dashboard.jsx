import { useState, useEffect, useCallback } from 'react'
import API from '../api/axios'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const PERIODS = [
  { key: 'week', label: 'Weekly' },
  { key: 'month', label: 'Monthly' },
  { key: 'year', label: 'Yearly' },
]

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color, icon, sub }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold tracking-widest uppercase text-gray-500">{label}</span>
      <span className="text-xl">{icon}</span>
    </div>
    <p className={`text-3xl font-bold tracking-tight ${color}`}>
      {value < 0 ? '-' : ''}₹{Math.abs(Number(value || 0)).toLocaleString('en-IN')}
    </p>
    {sub && <p className="text-xs text-gray-500">{sub}</p>}
  </div>
)

// ─── Section Heading ──────────────────────────────────────────────────────────
const SectionHeading = ({ title, subtitle }) => (
  <div className="mb-4">
    <h2 className="text-base font-semibold text-white">{title}</h2>
    {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
  </div>
)

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ type }) =>
  type === 'profit' ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-900/30 text-green-400">
      ↑ Profit
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-900/30 text-red-400">
      ↓ Loss
    </span>
  )

// ─── Amount Cell ──────────────────────────────────────────────────────────────
const AmountCell = ({ type, amount }) => (
  <span className={`font-semibold tabular-nums ${type === 'profit' ? 'text-green-400' : 'text-red-400'}`}>
    {type === 'profit' ? '+' : '-'}₹{amount.toLocaleString('en-IN')}
  </span>
)

// ─── Divider Row ──────────────────────────────────────────────────────────────
const NetRow = ({ net }) => (
  <tr className="border-t border-gray-700">
    <td colSpan={3} className="py-3 pr-4 text-right text-xs font-semibold tracking-widest uppercase text-gray-500">
      Net Result
    </td>
    <td className={`py-3 text-right font-bold tabular-nums text-sm ${net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
      {net >= 0 ? '+' : '-'}₹{Math.abs(net).toLocaleString('en-IN')}
    </td>
  </tr>
)

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pnlOnly = (txns) => txns.filter((t) => t.type === 'profit' || t.type === 'loss')

const calcNet = (txns) => {
  const profit = txns.filter((t) => t.type === 'profit').reduce((s, t) => s + t.amount, 0)
  const loss = txns.filter((t) => t.type === 'loss').reduce((s, t) => s + t.amount, 0)
  return { profit, loss, net: profit - loss }
}

const fmt = (date, opts) => new Date(date).toLocaleDateString('en-IN', opts)

const getWeekBounds = (date) => {
  const d = new Date(date)
  const start = new Date(d)
  start.setDate(d.getDate() - d.getDay())
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

const SHORT = { day: 'numeric', month: 'short' }
const LONG  = { day: 'numeric', month: 'short', year: 'numeric' }

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [transactions, setTransactions]       = useState([])
  const [summary, setSummary]                 = useState(null)
  const [period, setPeriod]                   = useState('month')
  const [periodOptions, setPeriodOptions]     = useState([])
  const [selectedKey, setSelectedKey]         = useState(null)
  const [selectedBucket, setSelectedBucket]  = useState(null)
  const [chartData, setChartData]             = useState([])
  const [loading, setLoading]                 = useState(true)

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const res  = await API.get('/transactions')
      const data = res.data
      setTransactions(data)
      buildSummary(data)
      buildChart(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const buildSummary = (data) => {
    const filtered = pnlOnly(data)
    const now      = new Date()

    const since = (days) => {
      const d = new Date(now)
      d.setDate(d.getDate() - days)
      return d
    }
    const sinceMonths = (m) => {
      const d = new Date(now)
      d.setMonth(d.getMonth() - m)
      return d
    }

    const slice = (from) => pnlOnly(data.filter((t) => new Date(t.date) >= from))

    setSummary({
      all:     calcNet(filtered),
      weekly:  calcNet(slice(since(7))),
      monthly: calcNet(slice(sinceMonths(1))),
      yearly:  calcNet(slice(sinceMonths(12))),
      count:   filtered.length,
    })
  }

  // ── Chart ─────────────────────────────────────────────────────────────────
  const buildChart = (data) => {
    const grouped = {}
    pnlOnly(data).forEach((t) => {
      const label = fmt(t.date, SHORT)
      if (!grouped[label]) grouped[label] = { date: label, profit: 0, loss: 0 }
      if (t.type === 'profit') grouped[label].profit += t.amount
      else grouped[label].loss += t.amount
    })
    setChartData(Object.values(grouped).slice(-15))
  }

  // ── Period Options ────────────────────────────────────────────────────────
  const buildOptions = useCallback(
    (txns, mode) => {
      const filtered = pnlOnly(txns)
      if (!filtered.length) return []

      if (mode === 'week') {
        const map = {}
        filtered.forEach((t) => {
          const { start } = getWeekBounds(t.date)
          const key = start.toISOString().split('T')[0]
          if (!map[key]) map[key] = { start, txns: [] }
          map[key].txns.push(t)
        })

        return Object.entries(map)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([key, { start, txns: wt }]) => {
            const end = new Date(start)
            end.setDate(start.getDate() + 6)
            const { profit, loss, net } = calcNet(wt)
            return {
              key,
              label: `${fmt(start, SHORT)} – ${fmt(end, LONG)}`,
              profit, loss, net,
              transactions: wt,
            }
          })
      }

      if (mode === 'month') {
        const map = {}
        filtered.forEach((t) => {
          const d   = new Date(t.date)
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
          if (!map[key]) map[key] = { month: d.getMonth(), year: d.getFullYear(), txns: [] }
          map[key].txns.push(t)
        })

        return Object.entries(map)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([key, { month, year, txns: mt }]) => {
            const { profit, loss, net } = calcNet(mt)
            const label = new Date(year, month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
            return { key, label, profit, loss, net, transactions: mt }
          })
      }

      return []
    },
    []
  )

  useEffect(() => {
    if (!transactions.length) return
    const opts = buildOptions(transactions, period)
    setPeriodOptions(opts)
    if (opts.length) {
      setSelectedKey(opts[0].key)
      setSelectedBucket(opts[0])
    } else {
      setSelectedKey(null)
      setSelectedBucket(null)
    }
  }, [transactions, period, buildOptions])

  const handleSelect = (key) => {
    const bucket = periodOptions.find((o) => o.key === key)
    setSelectedKey(key)
    setSelectedBucket(bucket || null)
  }

  // ── Get ALL TIME data ───────────────────────────────────────────────────
  const getAllTimeData = () => {
    if (!summary) return { profit: 0, loss: 0, net: 0 }
    return summary.all
  }

  const allTimeData = getAllTimeData()

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 px-4 py-10 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-indigo-400 mb-1">
              LootLedger
            </p>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Profit &amp; Loss
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track, analyse and review your gaming economy
            </p>
          </div>

          {/* Period toggle */}
          <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 self-start sm:self-auto">
            {PERIODS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  period === key
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── KPI Cards - NET OVERVIEW (ALL TIME) ────────────────────── */}
        <div>
          <SectionHeading
            title="Net Overview"
            subtitle="All-time profit & loss summary"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Total Profit"
              value={allTimeData.profit}
              color="text-green-400"
              icon="📈"
              sub="Sum of all profit entries"
            />
            <StatCard
              label="Total Loss"
              value={allTimeData.loss}
              color="text-red-400"
              icon="📉"
              sub="Sum of all loss entries"
            />
            <StatCard
              label="Net Result"
              value={allTimeData.net}
              color={allTimeData.net >= 0 ? 'text-indigo-400' : 'text-red-500'}
              icon={allTimeData.net >= 0 ? '🎯' : '💔'}
              sub={allTimeData.net >= 0 ? 'You are in profit' : 'You are in loss'}
            />
          </div>
        </div>

        {/* ── Period Report Dropdown ───────────────────────────────────── */}
        {period !== 'year' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  {period === 'week' ? 'Week-wise' : 'Month-wise'} Report
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select a {period === 'week' ? 'week' : 'month'} to view detailed transactions
                </p>
              </div>

              {periodOptions.length > 0 && (
                <select
                  value={selectedKey || ''}
                  onChange={(e) => handleSelect(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 sm:min-w-[320px]"
                >
                  {periodOptions.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Selected bucket summary pills */}
            {selectedBucket && (
              <div className="px-6 pt-4 pb-2 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-green-900/20 border border-green-900/40 px-4 py-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Profit</p>
                  <p className="text-sm font-bold text-green-400 tabular-nums">
                    +₹{selectedBucket.profit.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="rounded-xl bg-red-900/20 border border-red-900/40 px-4 py-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Loss</p>
                  <p className="text-sm font-bold text-red-400 tabular-nums">
                    -₹{selectedBucket.loss.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className={`rounded-xl px-4 py-3 text-center border ${
                  selectedBucket.net >= 0
                    ? 'bg-indigo-900/20 border-indigo-900/40'
                    : 'bg-red-900/20 border-red-900/40'
                }`}>
                  <p className="text-xs text-gray-500 mb-1">Net</p>
                  <p className={`text-sm font-bold tabular-nums ${
                    selectedBucket.net >= 0 ? 'text-indigo-400' : 'text-red-400'
                  }`}>
                    {selectedBucket.net >= 0 ? '+' : '-'}₹{Math.abs(selectedBucket.net).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            )}

            {/* Transactions table */}
            {selectedBucket && selectedBucket.transactions.length > 0 ? (
              <div className="px-6 pb-6 mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-800">
                      <th className="pb-2 font-semibold text-xs tracking-wider text-gray-500 uppercase">Date</th>
                      <th className="pb-2 font-semibold text-xs tracking-wider text-gray-500 uppercase">Type</th>
                      <th className="pb-2 font-semibold text-xs tracking-wider text-gray-500 uppercase">Category</th>
                      <th className="pb-2 font-semibold text-xs tracking-wider text-gray-500 uppercase text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {[...selectedBucket.transactions]
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((t) => (
                        <tr key={t.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="py-3 text-gray-400 text-xs">
                            {fmt(t.date, LONG)}
                          </td>
                          <td className="py-3">
                            <Badge type={t.type} />
                          </td>
                          <td className="py-3 text-white text-xs">{t.category}</td>
                          <td className="py-3 text-right">
                            <AmountCell type={t.type} amount={t.amount} />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot>
                    <NetRow net={selectedBucket.net} />
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="px-6 py-10 text-center text-gray-600 text-sm">
                No transactions found for this period.
              </div>
            )}
          </div>
        )}

        {/* ── Dual Y-Axis Chart ───────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <SectionHeading
            title="Profit vs Loss Over Time (Dual Axis)"
            subtitle="Green = Profit Day (left axis) · Red = Loss Day (right axis)"
          />
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                
                {/* Left Y-Axis - PROFIT */}
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  tick={{ fill: '#4ade80', fontSize: 11 }}
                  axisLine={{ stroke: '#4ade80', strokeWidth: 1 }}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  domain={[0, 'auto']}
                />
                
                {/* Right Y-Axis - LOSS */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#f87171', fontSize: 11 }}
                  axisLine={{ stroke: '#f87171', strokeWidth: 1 }}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  domain={[0, 'auto']}
                />

                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={{ stroke: '#1f2937' }}
                  tickLine={false}
                />
                
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #1f2937',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value, name) => {
                    if (name === 'Profit') return [`₹${value.toLocaleString('en-IN')}`, 'Profit (Day)']
                    if (name === 'Loss') return [`₹${value.toLocaleString('en-IN')}`, 'Loss (Day)']
                    return [value, name]
                  }}
                />
                
                <Legend
                  wrapperStyle={{ fontSize: '12px', color: '#9ca3af', paddingTop: '12px' }}
                />

                {/* Profit Line (Green) - Left Y Axis */}
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="profit"
                  stroke="#4ade80"
                  strokeWidth={2.5}
                  dot={{ fill: '#4ade80', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Profit"
                />

                {/* Loss Line (Red) - Right Y Axis */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="loss"
                  stroke="#f87171"
                  strokeWidth={2.5}
                  dot={{ fill: '#f87171', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Loss"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center gap-2">
              <span className="text-3xl opacity-20">📊</span>
              <p className="text-gray-600 text-sm">No data to display yet.</p>
            </div>
          )}
        </div>

        {/* ── Recent Transactions ──────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <SectionHeading
            title="Recent Profit & Loss"
            subtitle="Your 5 most recent P&L entries across all time"
          />
          {pnlOnly(transactions).length === 0 ? (
            <div className="py-10 text-center">
              <span className="text-3xl opacity-20">📋</span>
              <p className="text-gray-600 text-sm mt-2">No transactions recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-800">
                    <th className="pb-2 font-semibold text-xs tracking-wider text-gray-500 uppercase">Date</th>
                    <th className="pb-2 font-semibold text-xs tracking-wider text-gray-500 uppercase">Type</th>
                    <th className="pb-2 font-semibold text-xs tracking-wider text-gray-500 uppercase">Category</th>
                    <th className="pb-2 font-semibold text-xs tracking-wider text-gray-500 uppercase text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {pnlOnly(transactions)
                    .slice(0, 5)
                    .map((t) => (
                      <tr key={t.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 text-gray-400 text-xs">{fmt(t.date, SHORT)}</td>
                        <td className="py-3"><Badge type={t.type} /></td>
                        <td className="py-3 text-white text-xs">{t.category}</td>
                        <td className="py-3 text-right">
                          <AmountCell type={t.type} amount={t.amount} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <p className="text-center text-xs text-gray-700 pb-4">
          LootLedger · Profit &amp; Loss Dashboard · {new Date().getFullYear()}
        </p>

      </div>
    </div>
  )
}
