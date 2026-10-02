import { useEffect, useState } from 'react'
import { api } from '../api.js'
import Layout from '../component/Layout.jsx'

export default function Todos() {
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState(null) // null = adding, id = updating
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/todos')
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setEditingId(null)
  }

  // Add button doubles as Save when editing
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editingId) {
        const updated = await api(`/todos/${editingId}`, {
          method: 'PATCH',
          body: { title, description },
        })
        setItems((prev) => prev.map((t) => (t._id === editingId ? updated : t)))
      } else {
        const created = await api('/todos', { method: 'POST', body: { title, description } })
        setItems((prev) => [...prev, created])
      }
      resetForm()
    } catch (err) {
      setError(err.message)
    }
  }

  const startEdit = (todo) => {
    setEditingId(todo._id)
    setTitle(todo.title)
    setDescription(todo.description || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleDone = async (todo) => {
    setError('')
    try {
      const updated = await api(`/todos/${todo._id}`, {
        method: 'PATCH',
        body: { completed: !todo.completed },
      })
      setItems((prev) => prev.map((t) => (t._id === todo._id ? updated : t)))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this todo?')) return
    setError('')
    try {
      await api(`/todos/${id}`, { method: 'DELETE' })
      setItems((prev) => prev.filter((t) => t._id !== id))
      if (editingId === id) resetForm()
    } catch (err) {
      setError(err.message)
    }
  }

  const doneCount = items.filter((t) => t.completed).length

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 pt-8">
        <h1 className="text-xl font-bold text-center text-green-500 mb-2">MY TODOS</h1>
        {items.length > 0 && (
          <p className="text-center text-sm text-gray-500 mb-4">
            {doneCount} of {items.length} completed
          </p>
        )}

        {error && <p className="text-red-600 text-sm text-center mb-3">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border border-gray-300 px-3 py-3 mb-4 outline-none focus:border-green-500"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 px-3 py-2 mb-4 outline-none focus:border-green-500"
          />
          <div className="flex justify-center gap-2">
            <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2">
              {editingId ? 'Save' : 'Add'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="border border-gray-300 px-5 py-2 hover:bg-gray-100">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="mt-10 mb-10 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">S.N</th>
              <th className="border border-gray-300 px-4 py-2">Done</th>
              <th className="border border-gray-300 px-4 py-2">Title</th>
              <th className="border border-gray-300 px-4 py-2">Description</th>
              <th className="border border-gray-300 px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-6">Loading...</td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-6">No todos yet</td>
              </tr>
            )}
            {items.map((todo, i) => (
              <tr key={todo._id} className={todo.completed ? 'bg-gray-50 text-gray-400' : ''}>
                <td className="border border-gray-300 px-4 py-2 text-center">{i + 1}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleDone(todo)}
                    className="w-4 h-4 accent-green-500"
                  />
                </td>
                <td className={`border border-gray-300 px-4 py-2 ${todo.completed ? 'line-through' : ''}`}>
                  {todo.title}
                </td>
                <td className="border border-gray-300 px-4 py-2">{todo.description}</td>
                <td className="border border-gray-300 px-4 py-2 text-center whitespace-nowrap">
                  <button onClick={() => startEdit(todo)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 mr-2">
                    Update
                  </button>
                  <button onClick={() => handleDelete(todo._id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
