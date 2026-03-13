import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../../services/api'
import { saveUserData } from '../../utils/auth'
import '../../styles/Login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await loginUser({ email, password })

      // ✅ FIX: Backend returns { statusCode, data: { user }, message }
      // There is NO token field in the body — JWT is sent as an HttpOnly cookie automatically
      const user = response.data?.data?.user

      if (!user) {
        setError('Login failed: unexpected server response.')
        return
      }

      // ✅ Save user info to localStorage (no token needed — cookie handles auth)
      saveUserData(user)

      // Redirect based on role
      const role = user.role?.toLowerCase().trim()
      if (role === 'admin') {
        navigate('/admin')
      } else if (role === 'analyst') {
        navigate('/analyst')
      } else {
        setError('Unknown role. Contact system administrator.')
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Login failed. Please check your credentials.'
      setError(message)
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">🛡️</div>
          <h1 className="login-title">MicroSOC</h1>
          <p className="login-subtitle">Command Center Access</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="admin@microsoc.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary login-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="login-footer">
          Secure Access • Authorized Users Only
        </p>
      </div>
    </div>
  )
}
