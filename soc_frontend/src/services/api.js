import axios from 'axios'
import { clearUserData } from '../utils/auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // sends/receives HttpOnly cookies automatically
})

// ─────────────────────────────────────────────────────────────
// REQUEST interceptor — attach token from localStorage if present
// (cookies handle it automatically, this is a fallback)
// ─────────────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

// ─────────────────────────────────────────────────────────────
// RESPONSE interceptor — Refresh Token Rotation
//
// When any API call returns 401 (access token expired):
//   1. Try POST /users/refresh (sends refreshToken cookie automatically)
//   2. If refresh succeeds → retry the original failed request
//   3. If refresh fails (refresh token also expired/invalid) → logout + redirect
//
// _retry flag prevents infinite loops:
//   without it, if /refresh itself returns 401 we'd loop forever
// ─────────────────────────────────────────────────────────────
let isRefreshing = false          // prevents multiple simultaneous refresh calls
let failedQueue  = []             // holds requests that arrived while refresh was in progress

// Process all queued requests after refresh resolves/rejects
const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve()
  )
  failedQueue = []
}

api.interceptors.response.use(
  // Pass successful responses straight through
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    // Only handle 401 errors, and don't retry if we already retried once
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Don't try to refresh if the failing request WAS an auth endpoint
    const isAuthEndpoint =
      originalRequest.url?.includes('/users/refresh') ||
      originalRequest.url?.includes('/users/login')  ||
      originalRequest.url?.includes('/users/logout')   // ✅ never intercept logout

    if (isAuthEndpoint) {
      return Promise.reject(error)
    }

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(() => api(originalRequest))
        .catch((err) => Promise.reject(err))
    }

    // Mark this request as retried so we don't loop
    originalRequest._retry = true
    isRefreshing = true

    try {
      // Attempt to get new tokens — refreshToken cookie is sent automatically
      await api.post('/users/refresh')

      // Refresh succeeded — replay all queued requests and the original
      processQueue(null)
      return api(originalRequest)

    } catch (refreshError) {
      // Refresh token also expired or invalid — force logout
      processQueue(refreshError)
      clearUserData()
      window.location.href = '/login'
      return Promise.reject(refreshError)

    } finally {
      isRefreshing = false
    }
  }
)

// ─────────────────────────────────────────────────────────────
// AUTH APIs
// ─────────────────────────────────────────────────────────────
export const loginUser   = (credentials) => api.post('/users/login', credentials)
export const refreshToken = ()            => api.post('/users/refresh')   // ← NEW

export const logoutUser = async () => {
  try { await api.post('/users/logout') } catch (_) {}
  clearUserData()
}

// ─────────────────────────────────────────────────────────────
// USER APIs
// ─────────────────────────────────────────────────────────────
export const getUsers    = ()       => api.get('/users')
export const createUser  = (fd)     => api.post('/users/create', fd)
export const deleteUser  = (userId) => api.delete(`/users/${userId}`)

// ─────────────────────────────────────────────────────────────
// INCIDENT APIs
// ─────────────────────────────────────────────────────────────
export const getAllIncidents      = ()                    => api.get('/incidents')
export const getIncidentById     = (id)                  => api.get(`/incidents/${id}`)
export const updateIncidentStatus = (id, status)         => api.put(`/incidents/${id}/status`, { status })
export const assignIncident       = (id, analystId)      => api.put(`/incidents/${id}/assign`, { analystId })

// ─────────────────────────────────────────────────────────────
// LOG APIs
// ─────────────────────────────────────────────────────────────
export const getAllLogs       = ()   => api.get('/logs')
export const getLogsByIncident = (id) => api.get(`/logs?incidentId=${id}`)

// ─────────────────────────────────────────────────────────────
// DASHBOARD APIs
// ─────────────────────────────────────────────────────────────
export const getDashboardStats = () => api.get('/dashboard/stats')

export default api
