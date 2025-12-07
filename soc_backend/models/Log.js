import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },

  attackType: {
    type: String,
    enum: [
      "Brute Force",
      "Port Scan",
      "Malware Upload",
      "SQL Injection",
      "DDoS",
      "Privilege Escalation",
      "Unauthorized Access"
    ],
    required: true
  },

  sourceIP: { type: String, required: true },
  targetSystem: { type: String, required: true },

  severity: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    default: "Low",
  },

  message: { type: String, required: true },

  classified: { type: Boolean, default: false },
});

export default mongoose.model("Log", logSchema);
