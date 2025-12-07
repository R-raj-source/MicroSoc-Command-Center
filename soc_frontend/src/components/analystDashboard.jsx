import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAssignedIncidents, updateIncidentStatus } from "../services/api";
import "./dashboard.css"; // can reuse Admin CSS

const AnalystDashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState(""); // logged-in user ID
  const [incidents, setIncidents] = useState([]);

  // Check login and role on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token) {
      navigate("/login");
    } else {
      setUserRole(role?.toLowerCase() || "");
      setUserId(user?._id || "");
      fetchAssignedIncidents(user?._id);
    }
  }, [navigate]);

  // Fetch incidents assigned to this analyst
  const fetchAssignedIncidents = async (analystId) => {
    try {
      const res = await getAssignedIncidents(analystId);
      setIncidents(res.data || []);
    } catch (err) {
      console.error("Error fetching incidents:", err);
    }
  };

  // Update incident status
  const handleStatusChange = async (incidentId, newStatus) => {
    try {
      await updateIncidentStatus(incidentId, newStatus);
      fetchAssignedIncidents(userId); // refresh incidents
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome to Analyst Dashboard</h1>
      <p className="dashboard-role">
        Logged in as: <strong>{userRole}</strong>
      </p>

      <h2>Assigned Incidents</h2>
      {incidents.length === 0 ? (
        <p>No incidents assigned to you yet.</p>
      ) : (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Incident ID</th>
              <th>Logs</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Update Status</th>
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
                <td>
                  <select
                    value={incident.status}
                    onChange={(e) =>
                      handleStatusChange(incident._id, e.target.value)
                    }
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

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default AnalystDashboard;
