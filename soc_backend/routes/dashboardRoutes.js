// routes/dashboardRoutes.js
import express from "express";
import Incident from "../models/Incident.js";
import Log from "../models/Log.js";
import User from "../models/user.model.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);

// ========================
// GET /api/dashboard/stats
// Returns aggregated stats for the SOC dashboard
// ========================
router.get("/stats", async (req, res) => {
  try {
    const [
      totalLogs,
      unclassifiedLogs,
      totalIncidents,
      incidentsBySeverity,
      incidentsByStatus,
      analystWorkload,
      recentActivity,
    ] = await Promise.all([

      // Total logs
      Log.countDocuments(),

      // Unclassified logs
      Log.countDocuments({ classified: false }),

      // Total incidents
      Incident.countDocuments(),

      // Incidents grouped by severity
      Incident.aggregate([
        { $group: { _id: "$severity", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Incidents grouped by status
      Incident.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Analyst workload — how many open incidents each analyst has
      Incident.aggregate([
        { $match: { status: { $ne: "Resolved" }, assignedTo: { $ne: null } } },
        { $group: { _id: "$assignedTo", openIncidents: { $sum: 1 } } },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "analyst",
          },
        },
        { $unwind: "$analyst" },
        {
          $project: {
            _id: 0,
            analystId: "$_id",
            name: "$analyst.name",
            email: "$analyst.email",
            openIncidents: 1,
          },
        },
        { $sort: { openIncidents: -1 } },
      ]),

      // Last 10 incidents (recent activity feed)
      Incident.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("assignedTo", "name email"),
    ]);

    res.json({
      success: true,
      data: {
        logs: { total: totalLogs, unclassified: unclassifiedLogs },
        incidents: {
          total: totalIncidents,
          bySeverity: incidentsBySeverity,
          byStatus: incidentsByStatus,
        },
        analystWorkload,
        recentActivity,
      },
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

export default router;
