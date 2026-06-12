import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) =>
    location.pathname === path
      ? 'text-indigo-400 border-b-2 border-indigo-400'
      : 'text-gray-400 hover:text-white'

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold text-white">
            🎮 LootLedger
          </span>
          <div className="flex gap-6">
            <Link to="/dashboard" className={`text-sm pb-1 transition-all ${isActive('/dashboard')}`}>
              Dashboard
            </Link>
            <Link to="/transactions" className={`text-sm pb-1 transition-all ${isActive('/transactions')}`}>
              Transactions
            </Link>
            <Link to="/journal" className={`text-sm pb-1 transition-all ${isActive('/journal')}`}>
              Journal
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
