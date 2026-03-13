// middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

// ✅ FIX 1: Use ACCESS_TOKEN_SECRET (not JWT_SECRET)
// ✅ FIX 2: Decode payload uses _id (not user.id)
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // ✅ Corrected secret name
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // ✅ Corrected payload field: token contains _id, not id
    const user = await User.findById(decoded._id).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid access token - user not found");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

// ✅ Middleware to allow only Admin
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    throw new ApiError(403, "Admin access only");
  }
};
