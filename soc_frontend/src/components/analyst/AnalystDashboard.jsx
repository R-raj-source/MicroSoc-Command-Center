// src/components/analyst/AnalystDashboard.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllIncidents, updateIncidentStatus, logoutUser } from '../../services/api'
import { getCurrentUser, clearUserData } from '../../utils/auth'
import { useSocket } from '../../hooks/useSocket'
import '../../styles/Dashboard.css'

export default function AnalystDashboard() {
  const [incidents, setIncidents] = useState([])
  const [allIncidents, setAllIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('mine') // 'mine' | 'all'
  const navigate = useNavigate()
  const currentUser = getCurrentUser()

  useEffect(() => {
    fetchIncidents()
  }, [])

  const fetchIncidents = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await getAllIncidents()

      // ✅ Backend returns { success, data: [...], pagination }
      const all = response.data?.data || []
      setAllIncidents(all)

      // Filter to this analyst's incidents
      const mine = all.filter(i => i.assignedTo?._id === currentUser?._id)
      setIncidents(mine)
    } catch (err) {
      console.error('Fetch error:', err)
      if (err.response?.status === 401) {
        clearUserData()
        navigate('/login')
      } else {
        setError('Failed to load incidents')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (incidentId, newStatus) => {
    try {
      await updateIncidentStatus(incidentId, newStatus)
      // Optimistic update on both lists
      const update = list => list.map(i => i._id === incidentId ? { ...i, status: newStatus } : i)
      setIncidents(update)
      setAllIncidents(update)
    } catch (err) {
      alert('Failed to update status')
    }
  }

  const handleLogout = async () => {
    await logoutUser()
    clearUserData()
    navigate('/login')
  }

  const socket = useSocket()

  // ── Real-time socket listeners ────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return

    socket.on('new_incident', (incident) => {
      // Add to all incidents
      setAllIncidents(prev => [incident, ...prev])
      // If assigned to this analyst, add to personal list too
      if (incident.assignedTo?._id === currentUser?._id) {
        setIncidents(prev => [incident, ...prev])
      }
    })

    return () => { socket.off('new_incident') }
  }, [socket, currentUser])

  const displayed = filter === 'mine' ? incidents : allIncidents

  // ✅ Severity badge color — matches backend enum values
  const severityClass = (s) => {
    const map = { Critical: 'critical', High: 'high', Medium: 'medium', Low: 'low' }
    return `badge badge-${map[s] || 'low'}`
  }

  // ✅ Status badge — backend enum: "Open" | "In Progress" | "Resolved"
  const statusClass = (s) => {
    const map = { Open: 'open', 'In Progress': 'in-progress', Resolved: 'resolved' }
    return `badge badge-${map[s] || 'open'}`
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">⏳ Loading incidents...</div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* ── Header ── */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {currentUser?.avatar && (
              <img
                src={currentUser.avatar}
                alt="Avatar"
                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }}
              />
            )}
            <div>
              <h1>🔍 Analyst Dashboard</h1>
              <p>Welcome back, <strong>{currentUser?.name}</strong></p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-danger">Logout</button>
        </div>
      </header>

      <main className="dashboard-main">
        {error && (
          <div className="error-banner">
            ⚠️ {error}
            <button onClick={fetchIncidents} className="btn-primary" style={{ marginLeft: '1rem', padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}>Retry</button>
          </div>
        )}

        {/* ── Stats ── */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3>{incidents.length}</h3>
              <p>My Incidents</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔴</div>
            <div className="stat-content">
              <h3>{incidents.filter(i => i.status === 'Open').length}</h3>
              <p>Open</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔄</div>
            <div className="stat-content">
              <h3>{incidents.filter(i => i.status === 'In Progress').length}</h3>
              <p>In Progress</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{incidents.filter(i => i.status === 'Resolved').length}</h3>
              <p>Resolved</p>
            </div>
          </div>
        </div>

        {/* ── Incidents Table ── */}
        <div className="card">
          <div className="card-header">
            <h2>Incidents</h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                onClick={() => setFilter('mine')}
                className={filter === 'mine' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}
              >
                My Incidents ({incidents.length})
              </button>
              <button
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}
              >
                All ({allIncidents.length})
              </button>
              <button onClick={fetchIncidents} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                🔄
              </button>
            </div>
          </div>

          {displayed.length === 0 ? (
            <p className="no-data">
              {filter === 'mine'
                ? 'No incidents assigned to you yet.'
                : 'No incidents in the system yet.'}
            </p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Attack Type</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Created</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map(incident => (
                    <tr key={incident._id}>
                      <td><strong>{incident.attackType}</strong></td>
                      <td>
                        <span className={severityClass(incident.severity)}>
                          {incident.severity}
                        </span>
                      </td>
                      <td>
                        <span className={statusClass(incident.status)}>
                          {incident.status}
                        </span>
                      </td>
                      <td>
                        {incident.assignedTo ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {incident.assignedTo.avatar && (
                              <img src={incident.assignedTo.avatar} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                            )}
                            {incident.assignedTo.name}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>Unassigned</span>
                        )}
                      </td>
                      <td>{new Date(incident.createdAt).toLocaleString()}</td>
                      <td>
                        {/* ✅ Only allow analyst to update their own incidents */}
                        {incident.assignedTo?._id === currentUser?._id ? (
                          <select
                            value={incident.status}
                            onChange={(e) => handleStatusUpdate(incident._id, e.target.value)}
                            className="status-select"
                          >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
