import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api.js'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = await api(`/auth/reset-password/${token}`, { method: 'POST', body: { password } })
      setMessage(data.message)
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>

        {error && <p className="text-red-600 text-sm text-center mb-3">{error}</p>}
        {message && <p className="text-green-600 text-sm text-center mb-3">{message}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
            className="w-full border border-black rounded px-3 py-3 mb-4 outline-none"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded py-3"
          >
            {busy ? 'Saving...' : 'Update password'}
          </button>
        </form>

        <p className="text-center mt-5">
          <Link to="/login" className="text-blue-600 hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  )
}
