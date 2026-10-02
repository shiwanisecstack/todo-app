import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './component/ProtectedRoute.jsx'
import Home from './pages/home.jsx'
import About from './pages/about.jsx'
import Login from './pages/login.jsx'
import Signup from './pages/signup.jsx'
import ForgotPassword from './pages/forget.jsx'
import ResetPassword from './pages/reset.jsx'
import Todos from './pages/todo.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route
        path="/todos"
        element={
          <ProtectedRoute>
            <Todos />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
