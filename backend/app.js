import express from "express";
import cors from "cors";
import logRoutes from "./routes/logRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/logs", logRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("✅ Backend API is running!");
});

export default app;
