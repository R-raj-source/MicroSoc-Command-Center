// utils/auth.js
// JWT is stored as an HttpOnly cookie by the backend — never accessible via JS.
// We only store non-sensitive user info (name, role) in localStorage for UI use.

// Get current user from localStorage
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

// Get user role
export const getUserRole = () => {
  return localStorage.getItem('role')
}

// Check if user is authenticated (cookie is handled by browser automatically)
// We check localStorage for user info as a proxy
export const isAuthenticated = () => {
  return !!localStorage.getItem('user')
}

// Check if user is admin
export const isAdmin = () => {
  return getUserRole() === 'admin'
}

// Check if user is analyst
export const isAnalyst = () => {
  return getUserRole() === 'analyst'
}

// ✅ FIX: saveUserData now only takes user (no token — JWT is in HttpOnly cookie)
export const saveUserData = (user) => {
  localStorage.setItem('user', JSON.stringify(user))
  localStorage.setItem('role', user.role.toLowerCase().trim())
}

// Clear user data on logout
export const clearUserData = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('role')
}
