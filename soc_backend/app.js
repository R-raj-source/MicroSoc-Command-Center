// app.js
import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import incidentRoutes from "./routes/incidentRoutes.js";
import logRoutes from "./routes/logRoutes.js";   // Only if you want GET logs API (optional)

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/logs", logRoutes);           // Optional: Get logs from MongoDB
app.use("/api/incidents", incidentRoutes); // For dashboard

// Default Home Route
app.get("/", (req, res) => {
  res.send("SOC Backend API is running...");
});

export default app;
