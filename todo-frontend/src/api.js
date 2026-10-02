// Small fetch wrapper: adds the JWT header and throws on errors.
const BASE = (import.meta.env.VITE_API_URL || '') + '/api'

export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token')

  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    // stale/expired token: drop it so the user is sent back to login
    if (res.status === 401 && token) localStorage.removeItem('token')
    const err = new Error(data.message || 'Something went wrong')
    err.status = res.status
    throw err
  }
  return data
}
