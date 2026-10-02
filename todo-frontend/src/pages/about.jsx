import Layout from '../component/Layout.jsx'

export default function About() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-green-500 mb-4">About</h1>
        <p className="text-gray-700 mb-4">
          TODOS APP is a small full-stack project for keeping track of tasks. Create an account,
          add todos with a title and description, update them, and delete them when you are done.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">Built with</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>React + Vite + Tailwind CSS on the frontend</li>
          <li>Node.js, Express and MongoDB (Mongoose) on the backend</li>
          <li>JWT authentication with password reset</li>
        </ul>
      </div>
    </Layout>
  )
}
