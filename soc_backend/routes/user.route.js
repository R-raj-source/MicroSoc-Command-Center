// routes/user.route.js
import express from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,       // ← NEW
} from "../controllers/authController.js";
import { createAnalyst, getAllUsers, deleteAnalyst } from "../controllers/userController.js";
import { verifyJWT, admin } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

// ========================
// PUBLIC AUTH ROUTES
// ========================
router.post("/login",   loginUser);
router.post("/refresh", refreshAccessToken);   // ← NEW — no auth middleware (token IS the auth)
router.post("/logout", logoutUser); // ✅ no verifyJWT — works even with expired tokens

// ========================
// USER MANAGEMENT (admin only)
// ========================
router.get("/", verifyJWT, admin, getAllUsers);

router.post(
  "/create",
  upload.fields([
    { name: "avatar",      maxCount: 1 },
    { name: "coverImage",  maxCount: 1 },
  ]),
  verifyJWT,
  admin,
  createAnalyst
);

router.delete("/:id", verifyJWT, admin, deleteAnalyst);

export default router;
