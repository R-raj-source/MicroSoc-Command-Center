// app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/user.route.js"; // auth + user management
import incidentRoutes from "./routes/incidentRoutes.js";
import logRoutes from "./routes/logRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

const app = express();

// ✅ Security headers
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser()); // ✅ Required to parse req.cookies for JWT

// Routes
app.use("/api/users", userRoutes);         // login, logout, create analyst, get all
app.use("/api/logs", logRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/dashboard", dashboardRoutes); // ✅ Stats / aggregation endpoint

// ✅ Global error handler — catches all ApiError throws from asyncHandler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
  });
});

// Default Home Route
app.get("/", (req, res) => {
  res.send("SOC Backend API is running...");
});

export default app;
