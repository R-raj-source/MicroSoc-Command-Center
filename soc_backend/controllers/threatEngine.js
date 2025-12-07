import Log from "../models/Log.js";
import Incident from "../models/Incident.js";
import User from "../models/User.js";
import { getNextAnalystIndex } from "../utils/assignmentTracker.js";

const classifyLog = async () => {
  try {
    const unclassifiedLogs = await Log.find({ classified: false });

    for (const log of unclassifiedLogs) {
      const severity = log.severity;
      const attackType = log.attackType;

      // 1️⃣ Mark log as classified
      log.classified = true;
      await log.save();

      // 2️⃣ Severity-based incident creation
      if (severity !== "Low") {

        // Get all analysts
        const analysts = await User.find({ role: "analyst" });

        let assignedTo = null;

        if (analysts.length > 0) {
          const index = getNextAnalystIndex(analysts.length);
          assignedTo = analysts[index]._id;
        }

        // Create incident
        await Incident.create({
          attackType,
          severity,
          logs: [log._id],
          assignedTo,
        });
      }
    }
  } catch (err) {
    console.error("Threat engine error:", err);
  }
};

export default classifyLog;
