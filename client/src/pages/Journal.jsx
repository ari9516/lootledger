import { useState, useEffect } from 'react'
import API from '../api/axios'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

export default function Journal() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({ deposit: 0, withdrawal: 0 })

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const res = await API.get('/transactions')
      const data = res.data
      setTransactions(data)
      
      // Calculate totals
      const totals = data.reduce((acc, t) => {
        if (t.type === 'deposit') {
          acc.deposit += t.amount
        } else if (t.type === 'withdrawal') {
          acc.withdrawal += t.amount
        }
        return acc
      }, { deposit: 0, withdrawal: 0 })
      
      setSummary(totals)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Prepare chart data - group by date
  const getChartData = () => {
    const grouped = {}
    
    transactions.forEach(t => {
      if (t.type === 'deposit' || t.type === 'withdrawal') {
        const date = new Date(t.date).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short'
        })
        if (!grouped[date]) {
          grouped[date] = { date, deposit: 0, withdrawal: 0 }
        }
        if (t.type === 'deposit') {
          grouped[date].deposit += t.amount
        } else {
          grouped[date].withdrawal += t.amount
        }
      }
    })

    return Object.values(grouped)
  }

  const chartData = getChartData()

  // Filter only deposit and withdrawal transactions
  const filteredTransactions = transactions.filter(
    t => t.type === 'deposit' || t.type === 'withdrawal'
  )

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Deposit & Withdrawal Journal</h1>
          <p className="text-gray-400 text-sm mt-1">Track all your deposits and withdrawals</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Deposits</p>
                <p className="text-3xl font-bold text-white">₹{summary.deposit.toLocaleString('en-IN')}</p>
              </div>
              <span className="text-3xl">📥</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Total Withdrawals</p>
                <p className="text-3xl font-bold text-white">₹{summary.withdrawal.toLocaleString('en-IN')}</p>
              </div>
              <span className="text-3xl">📤</span>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-white font-semibold mb-4">Deposits vs Withdrawals</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
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
                <Legend />
                <Bar dataKey="deposit" fill="#4ade80" name="Deposits" radius={[4, 4, 0, 0]} />
                <Bar dataKey="withdrawal" fill="#fb923c" name="Withdrawals" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No deposit or withdrawal transactions yet.</p>
            </div>
          )}
        </div>

        {/* Transactions Table */}
        {loading ? (
          <p className="text-gray-400 text-center py-12">Loading transactions...</p>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-gray-500 text-lg">No transactions found.</p>
            <p className="text-gray-600 text-sm mt-1">Add deposits and withdrawals to see them here.</p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50 border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Category</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-800/50 transition-all">
                      <td className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                          t.type === 'deposit' 
                            ? 'text-green-400 bg-green-900/30' 
                            : 'text-orange-400 bg-orange-900/30'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white">{t.category}</td>
                      <td className={`px-6 py-4 text-right text-sm font-semibold ${
                        t.type === 'deposit' ? 'text-green-400' : 'text-orange-400'
                      }`}>
                        {t.type === 'deposit' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">
                        {t.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-800/30 border-t border-gray-800">
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-400">
                      Totals:
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold">
                      <span className="text-green-400">
                        +₹{filteredTransactions
                          .filter(t => t.type === 'deposit')
                          .reduce((sum, t) => sum + t.amount, 0)
                          .toLocaleString('en-IN')}
                      </span>
                      <span className="text-gray-600 mx-2">|</span>
                      <span className="text-orange-400">
                        -₹{filteredTransactions
                          .filter(t => t.type === 'withdrawal')
                          .reduce((sum, t) => sum + t.amount, 0)
                          .toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}