

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// ✅ FIX: Always resolve .env relative to soc_backend/, not the scripts/ folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import mongoose from "mongoose";
import User from "../models/user.model.js";
import connectDB from "../config/db.js";

const ADMIN_EMAIL = "avneesh123@gmail.com"; 
const ADMIN_PASSWORD = "Ajinkya@21";        
const ADMIN_NAME = "admin";                 

const createAdmin = async () => {
  await connectDB();

  const existing = await User.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    console.log("⚠️  Admin already exists:", ADMIN_EMAIL);
    process.exit(0);
  }

  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD, // pre-save hook will hash this
    role: "admin",
  });

  // ✅ FIX: Log the correct password
  console.log("✅ Admin created successfully!");
  console.log("   Email   :", ADMIN_EMAIL);
  console.log("   Password:", ADMIN_PASSWORD);

  process.exit(0);
};

createAdmin().catch((err) => {
  console.error("❌ Failed to create admin:", err.message);
  process.exit(1);
});
