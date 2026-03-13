// controllers/threatEngine.js
import Log from "../models/Log.js";
import Incident from "../models/Incident.js";
import User from "../models/user.model.js";
import { getNextAnalystIndex } from "../utils/assignmentTracker.js";
import { getIO } from "../socket.js";           // ← NEW

const classifyLog = async () => {
  try {
    const unclassifiedLogs = await Log.find({ classified: false });

    for (const log of unclassifiedLogs) {
      const { severity, attackType } = log;

      log.classified = true;
      await log.save();

      if (severity !== "Low") {
        // ✅ Sort by createdAt so the list order is always stable
        // Without sort, MongoDB can return analysts in any order
        // meaning index 0 could be a different person each time
        const analysts = await User.find({ role: "analyst" }).sort({ createdAt: 1 });

        let assignedTo = null;
        if (analysts.length > 0) {
          const index = await getNextAnalystIndex(analysts.length);
          assignedTo = analysts[index]._id;
        }

        const incident = await Incident.create({
          attackType,
          severity,
          logs: [log._id],
          assignedTo,
        });

        // ─────────────────────────────────────────────────────
        // EMIT new_incident event to ALL connected clients
        // We populate assignedTo so the frontend gets the full
        // analyst name/email directly — no extra fetch needed
        // ─────────────────────────────────────────────────────
        const populatedIncident = await incident.populate("assignedTo", "name email role avatar");
        getIO().emit("new_incident", populatedIncident);   // ← NEW
      }
    }
  } catch (err) {
    console.error("Threat engine error:", err);
  }
};

export default classifyLog;
