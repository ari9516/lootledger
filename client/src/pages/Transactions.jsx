import { useState, useEffect } from 'react'
import API from '../api/axios'
import TransactionCard from '../components/TransactionCard'

const TYPES = ['deposit', 'sale', 'purchase', 'withdrawal', 'loss']

const emptyForm = {
  amount: '',
  type: 'deposit',
  category: '',
  date: new Date().toISOString().split('T')[0],
  notes: ''
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const res = await API.get('/transactions')
      setTransactions(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (editingId) {
        await API.put(`/transactions/${editingId}`, form)
      } else {
        await API.post('/transactions', form)
      }
      setForm(emptyForm)
      setEditingId(null)
      setShowForm(false)
      fetchTransactions()
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (transaction) => {
    setForm({
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: transaction.date.split('T')[0],
      notes: transaction.notes || ''
    })
    setEditingId(transaction.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return
    try {
      await API.delete(`/transactions/${id}`)
      fetchTransactions()
    } catch (err) {
      console.error(err)
    }
  }

  const handleCancel = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter((t) => t.type === filter)

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-8">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Transactions</h1>
            <p className="text-gray-400 text-sm mt-1">{transactions.length} total transactions</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              + Add Transaction
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-white font-semibold mb-4">
              {editingId ? 'Edit Transaction' : 'New Transaction'}
            </h2>
            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t} className="capitalize">{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. CS2 Skins, Valorant Points"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-400 mb-1 block">Notes (optional)</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Any additional notes..."
                />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all"
                >
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Add Transaction'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-3 rounded-lg text-sm font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', ...TYPES].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${
                filter === t
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-400 text-center py-12">Loading transactions...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No transactions found.</p>
            <p className="text-gray-600 text-sm mt-1">Add your first one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((t) => (
              <TransactionCard
                key={t.id}
                transaction={t}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}