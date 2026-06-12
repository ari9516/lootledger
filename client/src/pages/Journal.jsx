import { useState, useEffect } from 'react'
import API from '../api/axios'

export default function Journal() {
  const [entries, setEntries] = useState([])
  const [summary, setSummary] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    stakedAmount: '',
    profitAmount: '',
    lossAmount: '',
    notes: ''
  })

  useEffect(() => {
    fetchEntries()
    fetchSummary()
  }, [])

  const fetchEntries = async () => {
    try {
      const res = await API.get('/journal')
      setEntries(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSummary = async () => {
    try {
      const res = await API.get('/journal/summary')
      setSummary(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await API.put(`/journal/${editingId}`, form)
      } else {
        await API.post('/journal', form)
      }
      setForm({
        date: new Date().toISOString().split('T')[0],
        stakedAmount: '',
        profitAmount: '',
        lossAmount: '',
        notes: ''
      })
      setEditingId(null)
      setShowForm(false)
      fetchEntries()
      fetchSummary()
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving entry')
    }
  }

  const handleEdit = (entry) => {
    setForm({
      date: entry.date.split('T')[0],
      stakedAmount: entry.stakedAmount,
      profitAmount: entry.profitAmount,
      lossAmount: entry.lossAmount,
      notes: entry.notes || ''
    })
    setEditingId(entry.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return
    try {
      await API.delete(`/journal/${id}`)
      fetchEntries()
      fetchSummary()
    } catch (err) {
      console.error(err)
    }
  }

  const netResultColor = (netResult) => {
    if (netResult > 0) return 'text-green-400'
    if (netResult < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Daily Trading Journal</h1>
            <p className="text-gray-400 text-sm mt-1">Track what you stake, profit, and lose each day</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              + Add Daily Entry
            </button>
          )}
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Total Days Tracked</p>
              <p className="text-2xl font-bold text-white">{summary.entryCount}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Total Staked</p>
              <p className="text-2xl font-bold text-orange-400">₹{summary.totalStaked?.toLocaleString('en-IN') || 0}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Total Profit</p>
              <p className="text-2xl font-bold text-green-400">+₹{summary.totalProfit?.toLocaleString('en-IN') || 0}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Total Net Result</p>
              <p className={`text-2xl font-bold ${netResultColor(summary.totalNetResult)}`}>
                {summary.totalNetResult >= 0 ? '+' : ''}₹{summary.totalNetResult?.toLocaleString('en-IN') || 0}
              </p>
            </div>
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-white font-semibold">
                  {editingId ? 'Edit Entry' : 'New Daily Entry'}
                </h2>
                <button onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setForm({
                    date: new Date().toISOString().split('T')[0],
                    stakedAmount: '',
                    profitAmount: '',
                    lossAmount: '',
                    notes: ''
                  })
                }} className="text-gray-400 hover:text-white text-2xl">
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Amount Staked (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.stakedAmount}
                    onChange={(e) => setForm({ ...form, stakedAmount: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
                    placeholder="How much you put in / risked"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Profit (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.profitAmount}
                    onChange={(e) => setForm({ ...form, profitAmount: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
                    placeholder="Amount you profited (if any)"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Loss (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.lossAmount}
                    onChange={(e) => setForm({ ...form, lossAmount: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
                    placeholder="Amount you lost (if any)"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Notes (optional)</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
                    placeholder="What game? What happened?"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  >
                    {editingId ? 'Update Entry' : 'Save Entry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Journal Table */}
        {loading ? (
          <p className="text-gray-400 text-center py-12">Loading journal...</p>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-gray-500 text-lg">No journal entries yet.</p>
            <p className="text-gray-600 text-sm mt-1">Add your first daily entry above.</p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50 border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Staked</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Profit</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Loss</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Net Result</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Notes</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-800/50 transition-all">
                      <td className="px-6 py-4 text-sm text-white whitespace-nowrap">
                        {new Date(entry.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-orange-400 font-medium">
                        ₹{entry.stakedAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-green-400 font-medium">
                        {entry.profitAmount > 0 ? `+₹${entry.profitAmount.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-red-400 font-medium">
                        {entry.lossAmount > 0 ? `-₹${entry.lossAmount.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className={`px-6 py-4 text-right text-sm font-bold ${netResultColor(entry.netResult)}`}>
                        {entry.netResult >= 0 ? '+' : ''}₹{entry.netResult.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">
                        {entry.notes || '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="text-gray-500 hover:text-indigo-400 text-xs px-2 py-1 rounded transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="text-gray-500 hover:text-red-400 text-xs px-2 py-1 rounded transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-800/30 border-t border-gray-800">
                  <tr>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-400" colSpan="1">
                      Totals:
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-orange-400">
                      ₹{entries.reduce((sum, e) => sum + e.stakedAmount, 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-green-400">
                      +₹{entries.reduce((sum, e) => sum + e.profitAmount, 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-red-400">
                      -₹{entries.reduce((sum, e) => sum + e.lossAmount, 0).toLocaleString('en-IN')}
                    </td>
                    <td className={`px-6 py-4 text-right text-sm font-bold ${netResultColor(entries.reduce((sum, e) => sum + e.netResult, 0))}`}>
                      {entries.reduce((sum, e) => sum + e.netResult, 0) >= 0 ? '+' : ''}
                      ₹{entries.reduce((sum, e) => sum + e.netResult, 0).toLocaleString('en-IN')}
                    </td>
                    <td colSpan="2"></td>
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
