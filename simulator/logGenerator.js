const axios = require("axios");

// Different categories of logs
const LOG_TYPES = [
  "LOGIN_SUCCESS",
  "LOGIN_FAILED",
  "FILE_ACCESSED",
  "PORT_SCAN",
  "MALWARE_DETECTED"
];

const SOURCES = [
  "WINDOWS",
  "LINUX",
  "FIREWALL",
  "IDS"
];

// Generate random IP
function randomIP() {
  return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// Generate a random log event
function generateLog() {
  return {
    logType: LOG_TYPES[Math.floor(Math.random() * LOG_TYPES.length)],
    source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
    message: "Auto-generated SOC log event",
    timestamp: new Date().toISOString(),
    ip: randomIP()
  };
}

// Send the generated log to backend
async function sendLog() {
  const log = generateLog();

  try {
    await axios.post("http://localhost:5001/api/logs", log);
    console.log("Log sent:", log);
  } catch (err) {
    console.error("❌ Error sending log:", err.message);
  }
}

// Every 3 seconds create and push a new log
setInterval(sendLog, 3000);
