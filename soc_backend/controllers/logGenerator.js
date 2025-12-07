import Log from "../models/Log.js";
import classifyLog from "./threatEngine.js"; // Make sure default import

// Generate random IP
const randomIP = () =>
  `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(
    Math.random() * 255
  )}.${Math.floor(Math.random() * 255)}`;

// Possible attack types
const attackTypes = [
  "Brute Force",
  "Port Scan",
  "Malware Upload",
  "SQL Injection",
  "DDoS",
  "Privilege Escalation",
  "Unauthorized Access"
];

// Severity mapping
const severityMap = {
  "Brute Force": "High",
  "Port Scan": "Medium",
  "Malware Upload": "Critical",
  "SQL Injection": "High",
  "DDoS": "Critical",
  "Privilege Escalation": "High",
  "Unauthorized Access": "Medium"
};

// Generate a single log
export const generateRandomLog = async () => {
  try {
    const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];

    const log = new Log({
      attackType,
      sourceIP: randomIP(),
      targetSystem: `server-${Math.floor(Math.random() * 10)}`,
      severity: severityMap[attackType],
      message: `${attackType} attempt detected`,
      classified: false, // important for threat engine
      timestamp: new Date() // add timestamp
    });

    await log.save();
    console.log("Generated Log:", log.attackType, log.sourceIP);

    // Trigger threat engine immediately
    await classifyLog();
  } catch (err) {
    console.error("Error generating log:", err);
  }
};

// Start continuous log generation
export const startLogGenerator = (intervalMs = 5000) => {
  console.log(`Starting log generator every ${intervalMs / 1000}s`);
  setInterval(generateRandomLog, intervalMs);
};
