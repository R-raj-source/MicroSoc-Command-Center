// routes/logRoutes.js
import express from "express";
import Log from "../models/Log.js";
import { verifyJWT, admin } from "../middleware/auth.middleware.js";

const router = express.Router();

// ✅ All log routes require authentication
router.use(verifyJWT);

// GET all logs (with pagination)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.attackType) filter.attackType = req.query.attackType;

    const [logs, total] = await Promise.all([
      Log.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit),
      Log.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});

// GET only unclassified logs
router.get("/unclassified", async (req, res) => {
  try {
    const logs = await Log.find({ classified: false }).sort({ timestamp: -1 });
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch unclassified logs" });
  }
});

// ✅ DELETE all logs — admin only (dangerous operation, protected)
router.delete("/", admin, async (req, res) => {
  try {
    await Log.deleteMany({});
    res.json({ success: true, message: "All logs deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete logs" });
  }
});

export default router;
