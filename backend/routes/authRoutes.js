const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/**
 * POST /api/auth/register
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "User already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: role || "standard",
    });

    return res.status(201).json({
      status: true,
      message: "User registered successfully.",
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/login
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Invalid credentials.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        status: false,
        message: "Invalid credentials.",
      });
    }

   // After you verified email/password:

// Debug log (temporary) — helps confirm what the DB has
console.log("LOGIN user.role from DB:", user.role);

const token = jwt.sign(
  {
    id: user._id,
    email: user.email,
    role: user.role, // <-- use DB value directly
  },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

return res.status(200).json({
  status: true,
  message: "Login successful.",
  data: {
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role, // <-- use DB value directly
    },
  },
});
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
      error: error.message,
    });
  }
});

module.exports = router;