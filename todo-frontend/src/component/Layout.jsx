import Navbar from './Navbar.jsx'

// Shared shell for pages that show the navbar (Home, About, Todos)
export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-gray-200 text-center text-sm text-gray-500 py-4">
        © {new Date().getFullYear()} TODOS APP
      </footer>
    </div>
  )
}
