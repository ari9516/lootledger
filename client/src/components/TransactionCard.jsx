const typeStyles = {
  deposit:    { bg: 'bg-green-900/30',  text: 'text-green-400',  label: 'Deposit' },
  withdrawal: { bg: 'bg-orange-900/30', text: 'text-orange-400', label: 'Withdrawal' },
  profit:     { bg: 'bg-blue-900/30',   text: 'text-blue-400',   label: 'Profit' },
  loss:       { bg: 'bg-red-900/30',    text: 'text-red-400',    label: 'Loss' },
}

const typeSign = {
  deposit: '+', 
  profit: '+', 
  withdrawal: '-', 
  loss: '-'
}

export default function TransactionCard({ transaction, onEdit, onDelete }) {
  const style = typeStyles[transaction.type] || typeStyles.deposit
  const sign = typeSign[transaction.type]
  const isPositive = sign === '+'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between hover:border-gray-700 transition-all">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${style.bg}`}>
          <span className={`text-sm font-bold ${style.text}`}>
            {transaction.type[0].toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-white font-medium">{transaction.category}</p>
          <p className="text-gray-500 text-sm">
            {new Date(transaction.date).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </p>
          {transaction.notes && (
            <p className="text-gray-600 text-xs mt-1">{transaction.notes}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className={`font-bold text-lg ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {sign}₹{transaction.amount.toLocaleString('en-IN')}
          </p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
            {style.label}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(transaction)}
            className="text-gray-500 hover:text-indigo-400 text-sm px-2 py-1 rounded transition-all"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(transaction.id)}
            className="text-gray-500 hover:text-red-400 text-sm px-2 py-1 rounded transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
