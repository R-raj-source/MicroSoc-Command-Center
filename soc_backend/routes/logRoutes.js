// routes/logRoutes.js
import express from "express";
import Log from "../models/Log.js";

const router = express.Router();

// GET all logs
router.get("/", async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});

// GET only unclassified logs
router.get("/unclassified", async (req, res) => {
  try {
    const logs = await Log.find({ classified: false });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch unclassified logs" });
  }
});

// DELETE all logs (optional for testing)
router.delete("/", async (req, res) => {
  try {
    await Log.deleteMany({});
    res.json({ message: "All logs deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete logs" });
  }
});

export default router;
