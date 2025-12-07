// routes/userRoutes.js
import express from "express";
import { createAnalyst } from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, admin, createAnalyst);

export default router;
