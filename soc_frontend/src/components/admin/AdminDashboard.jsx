// src/components/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../../hooks/useSocket'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import {
  getAllIncidents,
  getUsers,
  createUser,
  deleteUser,
  updateIncidentStatus,
  getDashboardStats,
  logoutUser,
} from '../../services/api'
import { getCurrentUser, clearUserData } from '../../utils/auth'
import '../../styles/Dashboard.css'

// ── Chart colour palettes ──────────────────────────────────────────────────
const SEVERITY_COLORS = {
  Critical: '#be185d',
  High:     '#dc2626',
  Medium:   '#d97706',
  Low:      '#2563eb',
}

const STATUS_COLORS = {
  Open:          '#dc2626',
  'In Progress': '#d97706',
  Resolved:      '#16a34a',
}

// Custom label for pie slices
const renderPieLabel = ({ name, percent }) =>
  `${name} ${(percent * 100).toFixed(0)}%`

export default function AdminDashboard() {
  const [incidents, setIncidents] = useState([])
  const [users,     setUsers]     = useState([])
  const [stats,     setStats]     = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [activeTab, setActiveTab] = useState('overview') // overview | incidents | users
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newUser,   setNewUser]   = useState({ name: '', email: '', password: '', avatar: null })
  const [createLoading, setCreateLoading] = useState(false)

  const navigate    = useNavigate()
  const currentUser = getCurrentUser()
  const socket      = useSocket()              // ← persistent WebSocket connection

  useEffect(() => { fetchData() }, [])

  // ── Real-time socket listeners ─────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return

    // New log created by logGenerator → update log count in stats
    socket.on('new_log', (log) => {
      setStats(prev => prev ? {
        ...prev,
        logs: { ...prev.logs, total: (prev.logs?.total || 0) + 1 }
      } : prev)
    })

    // New incident created by threatEngine → prepend to incidents list
    socket.on('new_incident', (incident) => {
      setIncidents(prev => [incident, ...prev])  // newest first
    })

    // Cleanup listeners when component unmounts
    return () => {
      socket.off('new_log')
      socket.off('new_incident')
    }
  }, [socket])

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      const [incidentsRes, usersRes, statsRes] = await Promise.all([
        getAllIncidents(),
        getUsers(),
        getDashboardStats(),
      ])
      setIncidents(incidentsRes.data?.data || [])
      setUsers(usersRes.data?.data     || [])
      setStats(statsRes.data?.data     || null)
    } catch (err) {
      if (err.response?.status === 401) {
        clearUserData(); navigate('/login')
      } else {
        setError('Failed to load dashboard data. Is the backend running?')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Chart data derived from live incidents ─────────────────────────────────
  const severityChartData = Object.entries(
    incidents.reduce((acc, i) => {
      acc[i.severity] = (acc[i.severity] || 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  const statusChartData = Object.entries(
    incidents.reduce((acc, i) => {
      acc[i.status] = (acc[i.status] || 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  // Attack-type bar chart — top 7
  const attackChartData = Object.entries(
    incidents.reduce((acc, i) => {
      acc[i.attackType] = (acc[i.attackType] || 0) + 1
      return acc
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, count]) => ({ name, count }))

  // Analyst workload bar chart
  const workloadData = (stats?.analystWorkload || []).map(w => ({
    name: w.name,
    open: w.openIncidents,
  }))

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCreateUser = async (e) => {
    e.preventDefault()
    setCreateLoading(true)
    try {
      const fd = new FormData()
      fd.append('name',     newUser.name)
      fd.append('email',    newUser.email)
      fd.append('password', newUser.password)
      if (newUser.avatar) fd.append('avatar', newUser.avatar)
      await createUser(fd)
      setShowCreateModal(false)
      setNewUser({ name: '', email: '', password: '', avatar: null })
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create analyst')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete analyst "${userName}"?`)) return
    try { await deleteUser(userId); fetchData() }
    catch (err) { alert(err.response?.data?.message || 'Failed to delete') }
  }

  const handleStatusUpdate = async (incidentId, newStatus) => {
    try {
      await updateIncidentStatus(incidentId, newStatus)
      setIncidents(prev => prev.map(i =>
        i._id === incidentId ? { ...i, status: newStatus } : i
      ))
    } catch { alert('Failed to update status') }
  }

  const handleLogout = async () => {
    await logoutUser(); clearUserData(); navigate('/login')
  }

  const severityClass = s => `badge badge-${({ Critical:'critical', High:'high', Medium:'medium', Low:'low' }[s] || 'low')}`
  const statusClass   = s => `badge badge-${({ Open:'open', 'In Progress':'in-progress', Resolved:'resolved' }[s] || 'open')}`

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) return (
    <div className="dashboard-container">
      <div className="loading">⏳ Loading dashboard...</div>
    </div>
  )

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-container">

      {/* ── Header ── */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🛡️ Admin Dashboard</h1>
            <p>
              Welcome back, <strong>{currentUser?.name}</strong>
              {/* ✅ Live indicator — green dot when socket is connected */}
              <span style={{
                display:'inline-flex', alignItems:'center', gap:'0.3rem',
                marginLeft:'0.75rem', fontSize:'0.8rem',
                color: socket?.connected ? '#16a34a' : '#94a3b8'
              }}>
                <span style={{
                  width:8, height:8, borderRadius:'50%',
                  background: socket?.connected ? '#16a34a' : '#94a3b8',
                  display:'inline-block',
                  boxShadow: socket?.connected ? '0 0 6px #16a34a' : 'none',
                  animation: socket?.connected ? 'pulse-dot 2s infinite' : 'none'
                }} />
                {socket?.connected ? 'Live' : 'Offline'}
              </span>
            </p>
          </div>
          <div className="header-right" style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
            {['overview','incidents','users'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={activeTab === tab ? 'btn-primary' : 'btn-secondary'}
                style={{ textTransform:'capitalize' }}
              >
                {tab === 'overview' ? '📊 Overview' : tab === 'incidents' ? '🚨 Incidents' : '👥 Users'}
              </button>
            ))}
            <button onClick={handleLogout} className="btn-danger" style={{ marginLeft:'0.5rem' }}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {error && (
          <div className="error-banner">
            ⚠️ {error}
            <button onClick={fetchData} className="btn-primary"
              style={{ marginLeft:'1rem', padding:'0.3rem 0.8rem', fontSize:'0.85rem' }}>
              Retry
            </button>
          </div>
        )}

        {/* ── Stat Cards (always visible) ── */}
        <div className="stats-grid">
          {[
            { icon:'📊', value: incidents.length,                                        label:'Total Incidents' },
            { icon:'🔴', value: incidents.filter(i=>i.status==='Open').length,           label:'Open' },
            { icon:'🔄', value: incidents.filter(i=>i.status==='In Progress').length,    label:'In Progress' },
            { icon:'✅', value: incidents.filter(i=>i.status==='Resolved').length,       label:'Resolved' },
            { icon:'👥', value: users.filter(u=>u.role==='analyst').length,              label:'Analysts' },
            { icon:'🪵', value: stats?.logs?.total ?? '—',                               label:'Total Logs' },
          ].map((s, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-content">
                <h3>{s.value}</h3>
                <p>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════
            TAB: OVERVIEW  —  charts
        ══════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <>
            {incidents.length === 0 ? (
              <div className="card">
                <p className="no-data">No incident data yet — charts will appear once the threat engine generates incidents.</p>
              </div>
            ) : (
              <>
                {/* Row 1: two pie charts side by side */}
                <div className="charts-row">

                  {/* Pie — Severity breakdown */}
                  <div className="card chart-card">
                    <h2>Incidents by Severity</h2>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={severityChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          dataKey="value"
                          label={renderPieLabel}
                          labelLine={true}
                        >
                          {severityChartData.map((entry) => (
                            <Cell
                              key={entry.name}
                              fill={SEVERITY_COLORS[entry.name] || '#6366f1'}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => [`${v} incidents`, '']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Pie — Status breakdown */}
                  <div className="card chart-card">
                    <h2>Incidents by Status</h2>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={statusChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          dataKey="value"
                          label={renderPieLabel}
                          labelLine={true}
                        >
                          {statusChartData.map((entry) => (
                            <Cell
                              key={entry.name}
                              fill={STATUS_COLORS[entry.name] || '#6366f1'}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => [`${v} incidents`, '']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Row 2: Attack type bar chart */}
                <div className="card">
                  <h2>Top Attack Types</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={attackChartData} margin={{ top:10, right:20, left:0, bottom:60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize:12 }}
                        angle={-30}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis allowDecimals={false} tick={{ fontSize:12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius:8, border:'1px solid #e2e8f0' }}
                        formatter={(v) => [`${v} incidents`, 'Count']}
                      />
                      <Bar dataKey="count" radius={[6,6,0,0]}>
                        {attackChartData.map((_, idx) => (
                          <Cell
                            key={idx}
                            fill={['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#eab308','#22c55e'][idx % 7]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Row 3: Analyst workload bar chart (only if data exists) */}
                {workloadData.length > 0 && (
                  <div className="card">
                    <h2>Analyst Workload (Open Incidents)</h2>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={workloadData} margin={{ top:10, right:20, left:0, bottom:10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize:13 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize:12 }} />
                        <Tooltip
                          contentStyle={{ borderRadius:8, border:'1px solid #e2e8f0' }}
                          formatter={(v) => [`${v} open`, 'Incidents']}
                        />
                        <Bar dataKey="open" fill="#6366f1" radius={[6,6,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════
            TAB: INCIDENTS — table
        ══════════════════════════════════════════════ */}
        {activeTab === 'incidents' && (
          <div className="card">
            <div className="card-header">
              <h2>All Incidents ({incidents.length})</h2>
              <button onClick={fetchData} className="btn-secondary"
                style={{ padding:'0.5rem 1rem', fontSize:'0.9rem' }}>
                🔄 Refresh
              </button>
            </div>
            <div className="table-container">
              {incidents.length === 0 ? (
                <p className="no-data">No incidents yet. They'll appear as the threat engine runs.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Attack Type</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Assigned To</th>
                      <th>Logs</th>
                      <th>Created</th>
                      <th>Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map(incident => (
                      <tr key={incident._id}>
                        <td><strong>{incident.attackType}</strong></td>
                        <td><span className={severityClass(incident.severity)}>{incident.severity}</span></td>
                        <td><span className={statusClass(incident.status)}>{incident.status}</span></td>
                        <td>
                          {incident.assignedTo ? (
                            <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                              {incident.assignedTo.avatar && (
                                <img src={incident.assignedTo.avatar} alt="" style={{ width:24, height:24, borderRadius:'50%' }} />
                              )}
                              {incident.assignedTo.name}
                            </span>
                          ) : <span style={{ color:'#94a3b8' }}>Unassigned</span>}
                        </td>
                        <td>{incident.logs?.length ?? 0}</td>
                        <td>{new Date(incident.createdAt).toLocaleString()}</td>
                        <td>
                          <select
                            value={incident.status}
                            onChange={e => handleStatusUpdate(incident._id, e.target.value)}
                            className="status-select"
                          >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: USERS — table
        ══════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <div className="card">
            <div className="card-header">
              <h2>Users ({users.length})</h2>
              <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                + Create Analyst
              </button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Avatar</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>
                        {user.avatar
                          ? <img src={user.avatar} alt={user.name} style={{ width:36, height:36, borderRadius:'50%', objectFit:'cover' }} />
                          : <div style={{ width:36, height:36, borderRadius:'50%', background:'#e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>
                              {user.name?.[0]?.toUpperCase()}
                            </div>
                        }
                      </td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        {user.role !== 'admin' && (
                          <button onClick={() => handleDeleteUser(user._id, user.name)}
                            className="btn-danger" style={{ padding:'0.3rem 0.75rem', fontSize:'0.85rem' }}>
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ── Create Analyst Modal ── */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Analyst</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateUser} className="modal-form">
              {[
                { label:'Full Name',      type:'text',     key:'name',     placeholder:'John Doe' },
                { label:'Email Address',  type:'email',    key:'email',    placeholder:'john@microsoc.com' },
                { label:'Password',       type:'password', key:'password', placeholder:'••••••••', min:6 },
              ].map(f => (
                <div className="form-group" key={f.key}>
                  <label>{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={newUser[f.key]}
                    onChange={e => setNewUser({ ...newUser, [f.key]: e.target.value })}
                    required disabled={createLoading}
                    minLength={f.min}
                  />
                </div>
              ))}
              <div className="form-group">
                <label>Avatar (optional)</label>
                <input type="file" accept="image/*" disabled={createLoading}
                  onChange={e => setNewUser({ ...newUser, avatar: e.target.files[0] })} />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="btn-secondary" disabled={createLoading}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={createLoading}>
                  {createLoading ? 'Creating...' : 'Create Analyst'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
