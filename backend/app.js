const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const logRoutes = require("./routes/logRoutes");
app.use("/api/logs", logRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("✅ Backend API is running!");
});

module.exports = app;
