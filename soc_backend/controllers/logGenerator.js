// controllers/logGenerator.js
import Log from "../models/Log.js";
import classifyLog from "./threatEngine.js";
import { getIO } from "../socket.js";           // ← NEW

const randomIP = () =>
  `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(
    Math.random() * 255
  )}.${Math.floor(Math.random() * 255)}`;

const attackTypes = [
  "Brute Force",
  "Port Scan",
  "Malware Upload",
  "SQL Injection",
  "DDoS",
  "Privilege Escalation",
  "Unauthorized Access",
];

const severityMap = {
  "Brute Force": "High",
  "Port Scan": "Medium",
  "Malware Upload": "Critical",
  "SQL Injection": "High",
  "DDoS": "Critical",
  "Privilege Escalation": "High",
  "Unauthorized Access": "Medium",
};

export const generateRandomLog = async () => {
  try {
    const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];

    const log = new Log({
      attackType,
      sourceIP: randomIP(),
      targetSystem: `server-${Math.floor(Math.random() * 10)}`,
      severity: severityMap[attackType],
      message: `${attackType} attempt detected`,
      classified: false,
      timestamp: new Date(),
    });

    await log.save();
    console.log("Generated Log:", log.attackType, log.sourceIP);

    // ─────────────────────────────────────────────────────────
    // EMIT new_log event to ALL connected frontend clients
    // Every browser that has the dashboard open receives this
    // instantly via the persistent WebSocket connection
    // ─────────────────────────────────────────────────────────
    getIO().emit("new_log", log);               // ← NEW

    // Trigger threat engine to classify this log
    await classifyLog();
  } catch (err) {
    console.error("Error generating log:", err);
  }
};

export const startLogGenerator = (intervalMs = 5000) => {
  console.log(`Starting log generator every ${intervalMs / 1000}s`);
  setInterval(generateRandomLog, intervalMs);
};
