// routes/incidentRoutes.js
import express from "express";
import Incident from "../models/Incident.js";
import User from "../models/user.model.js";
import { verifyJWT, admin } from "../middleware/auth.middleware.js";

const router = express.Router();

// ✅ All incident routes require authentication
router.use(verifyJWT);

// ========================
// GET ALL INCIDENTS (with pagination)
// ========================
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // ✅ Optional filter by severity or status
    const filter = {};
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.status) filter.status = req.query.status;

    const [incidents, total] = await Promise.all([
      Incident.find(filter)
        .populate("logs")
        .populate("assignedTo", "name email role avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Incident.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: incidents,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch incidents" });
  }
});

// ========================
// GET SINGLE INCIDENT
// ========================
router.get("/:id", async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate("logs")
      .populate("assignedTo", "name email role avatar");

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    res.json({ success: true, data: incident });
  } catch (err) {
    res.status(500).json({ message: "Error fetching incident" });
  }
});

// ========================
// UPDATE INCIDENT STATUS
// ========================
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["Open", "In Progress", "Resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedIncident = await Incident.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("logs")
      .populate("assignedTo", "name email role");

    if (!updatedIncident) return res.status(404).json({ message: "Incident not found" });

    res.json({ success: true, data: updatedIncident });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
});

// ========================
// MANUALLY ASSIGN INCIDENT TO ANALYST (admin only)
// ========================
router.put("/:id/assign", admin, async (req, res) => {
  try {
    const { analystId } = req.body;

    const analyst = await User.findById(analystId);
    if (!analyst || analyst.role !== "analyst") {
      return res.status(400).json({ message: "Invalid analyst ID" });
    }

    const updatedIncident = await Incident.findByIdAndUpdate(
      req.params.id,
      { assignedTo: analystId },
      { new: true }
    )
      .populate("assignedTo", "name email role")
      .populate("logs");

    if (!updatedIncident) return res.status(404).json({ message: "Incident not found" });

    res.json({ success: true, data: updatedIncident });
  } catch (err) {
    res.status(500).json({ message: "Failed to assign incident" });
  }
});

export default router;
