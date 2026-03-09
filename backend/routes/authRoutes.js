const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/**
 * POST /api/auth/register
 * Body: { email, password }
 */
router.post("/register", async (req, res) => {
  try {
    // 1) Get data from request body
    const { email, password } = req.body;

    // 2) Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // 3) Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    // 4) Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5) Save user to DB
    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // 6) Respond success (never return password)
    return res.status(201).json({
      message: "User registered successfully.",
      user: { id: newUser._id, email: newUser.email },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post("/login", async (req, res) => {
  try {
    // 1) Get credentials from request body
    const { email, password } = req.body;

    // 2) Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // 3) Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // 4) Compare password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // 5) Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email }, // payload
      process.env.JWT_SECRET,              // secret
      { expiresIn: "1d" }                  // expiration
    );

    // 6) Respond with token + user info
    return res.status(200).json({
      message: "Login successful.",
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;