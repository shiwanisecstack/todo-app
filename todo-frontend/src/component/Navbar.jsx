import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const linkClass = ({ isActive }) =>
  `px-3 py-1 rounded ${isActive ? 'text-green-600 font-semibold' : 'text-gray-600 hover:text-green-600'}`

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-green-500">
          TODOS APP
        </Link>

        <div className="flex items-center gap-1 text-sm">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/about" className={linkClass}>About</NavLink>
          {user && <NavLink to="/todos" className={linkClass}>My Todos</NavLink>}

          {user ? (
            <>
              <span className="ml-3 text-gray-500 hidden sm:inline">Hi, {user.name}</span>
              <button
                onClick={handleLogout}
                className="ml-3 border border-gray-300 rounded px-3 py-1 hover:bg-gray-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="ml-3 px-3 py-1 rounded border border-gray-300 hover:bg-gray-100">
                Login
              </Link>
              <Link to="/signup" className="px-3 py-1 rounded bg-green-500 hover:bg-green-600 text-white">
                Signup
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
