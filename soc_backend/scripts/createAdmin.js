// scripts/createAdmin.js

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "../models/User.js";
import connectDB from "../config/db.js";

const createAdmin = async () => {
  await connectDB();

  const adminEmail = "Avneesh123@gmail.com";

  let admin = await User.findOne({ email: adminEmail });

  if (admin) {
    console.log("Admin already exists:", adminEmail);
    process.exit(0);
  }

  admin = await User.create({
    name: "Admin",
    email: adminEmail,
    password: "Ajinkya@21",   
    role: "admin",
  });

  console.log("Admin created successfully!");
  console.log("Email:", adminEmail);
  console.log("Password: Virat@18");

  process.exit(0);
};

createAdmin();
