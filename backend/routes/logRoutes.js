const express = require("express");
const { addLog, getLogs } = require("../controllers/logController");

const router = express.Router();

// Add a new log
router.post("/", addLog);

// Get logs
router.get("/", getLogs);

module.exports = router;
