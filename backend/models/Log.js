import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  logType: String,
  source: String,
  message: String,
  timestamp: String,
  ip: String,
  threatLevel: {
    type: String,
    enum: ["NONE", "LOW", "MEDIUM", "HIGH"],
    default: "NONE"
  }
});

const Log = mongoose.model("Log", logSchema);

export default Log;
