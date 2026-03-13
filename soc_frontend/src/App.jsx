// src/app.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/auth/Login'
import AdminDashboard from './components/admin/AdminDashboard'
import AnalystDashboard from './components/analyst/AnalystDashboard'
import { isAuthenticated, getUserRole } from './utils/auth'

// ✅ ProtectedRoute — redirects to /login if not authenticated
function ProtectedRoute({ children, requiredRole }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  if (requiredRole && getUserRole() !== requiredRole) {
    // Redirect to correct dashboard if wrong role
    const role = getUserRole()
    return <Navigate to={role === 'admin' ? '/admin' : '/analyst'} replace />
  }
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analyst"
          element={
            <ProtectedRoute requiredRole="analyst">
              <AnalystDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
