import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Cookie options — secure only in production (localhost is HTTP)
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

// ─────────────────────────────────────────────────────────────
// HELPER: generate both tokens and save refresh token to DB
// ─────────────────────────────────────────────────────────────
export const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken  = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Persist refresh token in DB so we can validate + rotate it
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

// ─────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) throw new ApiError(404, "User not found");

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(200)
    .cookie("accessToken",  accessToken,  cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, { user: loggedInUser }, "Logged in successfully"));
});

// ─────────────────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────────────────
export const logoutUser = asyncHandler(async (req, res) => {
  // ✅ FIX: Read user identity from refreshToken cookie directly
  // This way logout works even when accessToken is expired
  // We try to clean up the DB, but ALWAYS clear cookies regardless

  const incomingRefreshToken = req.cookies?.refreshToken

  if (incomingRefreshToken) {
    try {
      const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
      // Wipe refresh token from DB so it can never be reused
      await User.findByIdAndUpdate(
        decoded._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
      )
    } catch (_) {
      // Refresh token expired or invalid — that's fine
      // We still clear the cookies below, that's all that matters
    }
  }

  // Always clear cookies — this is the actual logout action
  return res
    .status(200)
    .clearCookie("accessToken",  cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"))
})

// ─────────────────────────────────────────────────────────────
// REFRESH ACCESS TOKEN  ← NEW
//
// Flow:
//   1. Read refreshToken from HttpOnly cookie
//   2. Verify its JWT signature with REFRESH_TOKEN_SECRET
//   3. Find the user and check the token matches what's in DB
//      (if it doesn't match, the token was already rotated —
//       means possible token theft → reject)
//   4. Issue a brand-new accessToken + refreshToken
//   5. Save the new refreshToken to DB (old one is now invalid)
//   6. Send both new tokens as cookies
// ─────────────────────────────────────────────────────────────
export const refreshAccessToken = asyncHandler(async (req, res) => {
  // Token comes from cookie (HttpOnly) or Authorization header as fallback
  const incomingRefreshToken =
    req.cookies?.refreshToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!incomingRefreshToken) {
    throw new ApiError(401, "No refresh token — please log in again");
  }

  // Step 1: Verify the JWT signature
  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    // Token expired or tampered with
    throw new ApiError(401, "Refresh token expired or invalid — please log in again");
  }

  // Step 2: Find the user this token belongs to
  const user = await User.findById(decoded._id);
  if (!user) {
    throw new ApiError(401, "User not found — please log in again");
  }

  // Step 3: Rotation check — does the token match what we stored in DB?
  // If NOT, someone is using a stale/stolen refresh token → reject + wipe DB token
  if (incomingRefreshToken !== user.refreshToken) {
    // Wipe the stored token to force full re-login (security measure)
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(401, "Refresh token reuse detected — please log in again");
  }

  // Step 4: All good — issue new token pair (ROTATION: old refresh token is replaced)
  const { accessToken, refreshToken: newRefreshToken } =
    await generateAccessAndRefreshToken(user._id);

  return res
    .status(200)
    .cookie("accessToken",  accessToken,     cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { accessToken }, // also return in body so non-cookie clients can use it
        "Access token refreshed successfully"
      )
    );
});
