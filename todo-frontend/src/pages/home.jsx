import { Link } from 'react-router-dom'
import Layout from '../component/Layout.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const features = [
  { title: 'Add tasks fast', text: 'Give each task a title and an optional description in seconds.' },
  { title: 'Stay on track', text: 'Tick tasks off when they are done and edit them any time.' },
  { title: 'Private & secure', text: 'Your todos are tied to your account - only you can see them.' },
]

export default function Home() {
  const { user } = useAuth()

  return (
    <Layout>
      <div className="max-w-3xl mx-auto text-center px-4 py-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
          Organize your day with <span className="text-green-500">TODOS APP</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          A simple place to capture what needs doing and get it finished.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          {user ? (
            <Link to="/todos" className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded">
              Go to my todos
            </Link>
          ) : (
            <>
              <Link to="/signup" className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded">
                Get started
              </Link>
              <Link to="/login" className="border border-gray-300 hover:bg-gray-100 px-6 py-3 rounded">
                Login
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid gap-6 sm:grid-cols-3 px-4 pb-16">
        {features.map((f) => (
          <div key={f.title} className="border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="font-bold text-lg text-green-600 mb-2">{f.title}</h3>
            <p className="text-gray-600 text-sm">{f.text}</p>
          </div>
        ))}
      </div>
    </Layout>
  )
}
