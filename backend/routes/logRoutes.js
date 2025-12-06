import express from "express";
import { addLog, getLogs } from "../controllers/logController.js";

const router = express.Router();

// Add a new log
router.post("/", addLog);

// Get logs
router.get("/", getLogs);

export default router;
