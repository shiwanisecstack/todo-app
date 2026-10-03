import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function VerifyEmail() {
  const { verifyEmail } = useAuth()
  const navigate = useNavigate()
  const { state } = useLocation()
  const email = state?.email
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState(state?.notice || 'Enter the 6-digit code we emailed you.')
  const [busy, setBusy] = useState(false)

  if (!email) return <Navigate to="/signup" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await verifyEmail(email, otp)
      navigate('/todos')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const resend = async () => {
    setError('')
    try {
      const data = await api('/auth/resend-otp', { method: 'POST', body: { email, purpose: 'verify' } })
      setMessage(data.message)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Verify your email</h1>
        <p className="text-gray-500 text-sm text-center mb-1 break-all">{email}</p>
        <p className="text-gray-500 text-xs text-center mb-5">Can't see it? Check your spam folder.</p>

        {error && <p className="text-red-600 text-sm text-center mb-3">{error}</p>}
        {message && !error && <p className="text-green-600 text-sm text-center mb-3">{message}</p>}

        <form onSubmit={handleSubmit}>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            required
            className="w-full border border-black rounded px-3 py-3 mb-4 outline-none text-center tracking-widest text-xl"
          />
          <button
            type="submit"
            disabled={busy || otp.length !== 6}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded py-3"
          >
            {busy ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        <p className="text-center mt-5">
          <button onClick={resend} className="text-blue-600 hover:underline">Resend code</button>
        </p>
        <p className="text-center mt-3">
          <Link to="/login" className="text-blue-600 hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  )
}
