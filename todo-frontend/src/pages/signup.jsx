import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signup(name, email, password)
      navigate('/todos')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const input = 'w-full border border-gray-300 rounded px-3 py-3 mb-4 outline-none focus:border-green-500'

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center text-green-500 mb-6">Signup</h1>

        {error && <p className="text-red-600 text-sm text-center mb-3">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input className={input} placeholder="Your Name" value={name}
            onChange={(e) => setName(e.target.value)} required />
          <input className={input} type="email" placeholder="Your Email" value={email}
            onChange={(e) => setEmail(e.target.value)} required />
          <input className={input} type="password" placeholder="Your Password (min 6 chars)" value={password}
            onChange={(e) => setPassword(e.target.value)} minLength={6} required />
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold rounded py-2"
          >
            {busy ? 'Creating account...' : 'Signup'}
          </button>
        </form>

        <p className="text-center mt-4">
          Already have an account ?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
