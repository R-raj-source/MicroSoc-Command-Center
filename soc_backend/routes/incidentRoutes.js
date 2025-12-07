// routes/incidentRoutes.js
import express from "express";
import Incident from "../models/Incident.js";
import User from "../models/User.js";

const router = express.Router();


// ========================
// GET ALL INCIDENTS
// ========================
router.get("/", async (req, res) => {
  try {
    const incidents = await Incident.find()
      .populate("logs")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    res.json(incidents);
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
      .populate("assignedTo", "name email role");

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    res.json(incident);
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
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedIncident = await Incident.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("logs")
      .populate("assignedTo", "name email role");

    res.json(updatedIncident);
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
});


// ========================
// MANUALLY ASSIGN INCIDENT TO ANALYST
// ========================
router.put("/:id/assign", async (req, res) => {
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

    res.json(updatedIncident);
  } catch (err) {
    res.status(500).json({ message: "Failed to assign incident" });
  }
});


// ========================
// ⚠ REMOVED — INTERNAL CREATE INCIDENT
// Reason: Threat Engine directly creates incidents now
// ========================
// router.post("/create", ... )   ❌ Removed intentionally


export default router;
