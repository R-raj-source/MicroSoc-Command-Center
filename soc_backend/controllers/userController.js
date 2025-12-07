// controllers/userController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const createAnalyst = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      name,
      email,
      password, // <-- just plain text password, pre-save hook will hash
      role: "analyst",
    });

    res.status(201).json({
      message: "Analyst created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
