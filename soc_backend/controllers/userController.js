// controllers/userController.js
import User from "../models/user.model.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET all users (admin only)
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password -refreshToken");
  res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});

// ✅ FIX: avatarUrl → avatar (matches schema field name)
export const createAnalyst = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(400, "User with this email already exists");
  }

  // Handle avatar upload to Cloudinary
  let avatar = null;
  const avatarFile = req.files?.avatar?.[0]; // multer.fields → req.files
  if (avatarFile) {
    const uploadResult = await uploadonCloudinary(avatarFile.path);
    if (uploadResult?.url) {
      avatar = uploadResult.url;
    }
  }

  // ✅ Use "avatar" to match schema (not "avatarUrl")
  const user = await User.create({
    name,
    email,
    password, // pre-save hook hashes this
    role: "analyst",
    avatar,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      "Analyst created successfully"
    )
  );
});

// DELETE analyst (admin only)
export const deleteAnalyst = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === "admin") throw new ApiError(403, "Cannot delete an admin account");

  await user.deleteOne();
  return res.status(200).json(new ApiResponse(200, {}, "Analyst deleted successfully"));
});
