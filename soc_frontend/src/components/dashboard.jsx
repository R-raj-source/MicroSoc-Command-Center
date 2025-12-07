import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser, getAllLogs, getAllIncidents } from "../services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import "./dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  // User creation states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const [userRole, setUserRole] = useState("");

  // Logs and incidents state
  const [logs, setLogs] = useState([]);
  const [incidents, setIncidents] = useState([]);

  // Charts data
  const [severityData, setSeverityData] = useState([]);
  const [topAttackers, setTopAttackers] = useState([]);

  // Check login on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token) {
      navigate("/login");
    } else {
      setUserRole(role?.toLowerCase() || "");
      fetchLogsAndIncidents();
    }
  }, [navigate]);

  // Fetch logs and incidents from backend
  const fetchLogsAndIncidents = async () => {
    try {
      const logsData = await getAllLogs();
      const incidentsData = await getAllIncidents();

      setLogs(logsData.data || []);
      setIncidents(incidentsData.data || []);

      processCharts(logsData.data || []);
    } catch (err) {
      console.log("Error fetching data:", err);
    }
  };

  // Prepare chart data
  const processCharts = (logs) => {
    // Severity distribution
    const severityCount = {};
    logs.forEach((log) => {
      severityCount[log.severity] = (severityCount[log.severity] || 0) + 1;
    });
    const severityArray = Object.keys(severityCount).map((key) => ({
      name: key,
      value: severityCount[key],
    }));
    setSeverityData(severityArray);

    // Top attackers (source IP)
    const attackerCount = {};
    logs.forEach((log) => {
      attackerCount[log.sourceIp] = (attackerCount[log.sourceIp] || 0) + 1;
    });
    const topAttackersArray = Object.entries(attackerCount)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // top 5
    setTopAttackers(topAttackersArray);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Create new user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (password.length < 6 || password.length > 20) {
      alert("Password must be between 6 and 20 characters.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await createUser({ name, email, password, role }, token);
      alert("User created successfully!");
      setName(""); setEmail(""); setPassword(""); setRole("user");
    } catch (err) {
      alert("Error creating user: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome to Admin Dashboard</h1>
      <p className="dashboard-role">Logged in as: <strong>{userRole}</strong></p>

      {/* Charts */}
      <div className="charts-container">
        <div>
          <h3>Severity Distribution</h3>
          <PieChart width={300} height={300}>
            <Pie data={severityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
              {severityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={["#0088FE", "#00C49F", "#FFBB28", "#FF8042"][index % 4]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        <div>
          <h3>Top Attackers</h3>
          <BarChart width={500} height={300} data={topAttackers}>
            <XAxis dataKey="ip" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </div>
      </div>

      {/* Logs Table */}
      <h2>All Logs</h2>
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Attack Type</th>
            <th>Source IP</th>
            <th>Target System</th>
            <th>Severity</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.attackType}</td>
              <td>{log.sourceIp}</td>
              <td>{log.targetSystem}</td>
              <td>{log.severity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Incidents Table */}
      <h2>All Incidents</h2>
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Incident ID</th>
            <th>Logs</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Assigned To</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident) => (
            <tr key={incident._id}>
              <td>{incident._id}</td>
              <td>
                {incident.logs.map((log) => (
                  <div key={log._id}>
                    {log.attackType} ({log.severity})
                  </div>
                ))}
              </td>
              <td>{incident.severity}</td>
              <td>{incident.status}</td>
              <td>{incident.assignedTo?.name || "Unassigned"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* User Creation Form */}
      {userRole === "admin" && (
        <div className="user-form-container">
          <h2>Create New User</h2>
          <form className="user-form" onSubmit={handleCreateUser}>
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} maxLength={20} />
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit">Create User</button>
          </form>
        </div>
      )}

      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
