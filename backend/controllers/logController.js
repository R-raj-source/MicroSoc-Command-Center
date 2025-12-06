const Log = require("../models/Log");

// Threat classification rules
function classifyThreat(log) {
  if (log.logType === "MALWARE_DETECTED") return "HIGH";
  if (log.logType === "PORT_SCAN") return "MEDIUM";
  if (log.logType === "LOGIN_FAILED") return "LOW";
  return "NONE";
}

exports.addLog = async (req, res) => {
  try {
    const threatLevel = classifyThreat(req.body);

    const newLog = await Log.create({
      ...req.body,
      threatLevel
    });

    res.status(201).json({
      success: true,
      data: newLog
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Fetch all logs
exports.getLogs = async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 });
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
