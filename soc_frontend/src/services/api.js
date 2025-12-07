import axios from "axios";

// Create axios instance
const API = axios.create({
  baseURL: "http://localhost:5001/api", // backend URL
});

// =====================
// AUTH
// =====================
export const loginUser = (userData) => API.post("/auth/login", userData);

// =====================
// USERS
// =====================
export const createUser = (userData, token) =>
  API.post("/users/create", userData, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getUsers = (token) =>
  API.get("/users", { headers: { Authorization: `Bearer ${token}` } });

// =====================
// LOGS
// =====================

// Fetch all logs (admin dashboard)
export const getAllLogs = () => API.get("/logs");

// Optional: fetch logs by filters (future)
export const getLogsByIncident = (incidentId) =>
  API.get(`/logs?incidentId=${incidentId}`);

// =====================
// INCIDENTS
// =====================

// Fetch all incidents (admin)
export const getAllIncidents = () => API.get("/incidents");

// Fetch only incidents assigned to an analyst
export const getAssignedIncidents = (analystId) =>
  API.get(`/incidents?assignedTo=${analystId}`);

// Update incident status
export const updateIncidentStatus = (incidentId, status) =>
  API.put(`/incidents/${incidentId}/status`, { status });

// Assign incident to analyst (admin)
export const assignIncidentToAnalyst = (incidentId, analystId) =>
  API.put(`/incidents/${incidentId}/assign`, { analystId });

// Optional: create incident (if needed for testing)
export const createIncident = (incidentData) =>
  API.post("/incidents/create", incidentData);

// =====================
// EXPORT
// =====================
export default API;
