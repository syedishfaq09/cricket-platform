const express = require("express");
const router = express.Router();

const User = require("../models/User");

/// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email or phone number is already registered",
      });
    }

    const user = new User({
      name,
      email,
      phone,
      password,
      role: "player",
      status: "pending",
      player: null,
    });

    await user.save();

    res.status(201).json({
      message:
        "Registration successful. Your account is waiting for admin approval.",
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
});

// PLAYER LOGIN
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Phone number/email and password are required",
      });
    }

    const user = await User.findOne({
      $or: [
        { phone: identifier.trim() },
        { email: identifier.trim().toLowerCase() },
      ],
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid phone number/email or password",
      });
    }

    // Player Login is only for player accounts
    if (user.role !== "player") {
      return res.status(403).json({
        message: "Please use Admin Login for admin accounts",
      });
    }

    // Player must be approved by admin
    if (user.status !== "approved") {
      if (user.status === "pending") {
        return res.status(403).json({
          message: "Your account is still waiting for admin approval",
        });
      }

      if (user.status === "rejected") {
        return res.status(403).json({
          message: "Your player registration has been rejected",
        });
      }
    }

    // Current project uses plain-text passwords.
    // We will upgrade this to bcrypt later.
    if (user.password !== password) {
      return res.status(401).json({
        message: "Invalid phone number/email or password",
      });
    }

    res.json({
      message: "Player login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        player: user.player,
      },
    });
  } catch (error) {
    console.error("Player login error:", error);

    res.status(500).json({
      message: "Player login failed",
    });
  }
});
// ADMIN LOGIN
router.post("/admin-login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        message: "Phone number and password are required",
      });
    }

    const user = await User.findOne({ phone: phone.trim() });

    if (!user) {
      return res.status(401).json({
        message: "Invalid phone number or password",
      });
    }

    // Only admin accounts can use Admin Login
    if (user.role !== "admin") {
      return res.status(403).json({
        message: "This account does not have admin access",
      });
    }

    // Current project uses plain-text passwords.
    // We will upgrade this to bcrypt after admin login is working.
    if (user.password !== password) {
      return res.status(401).json({
        message: "Invalid phone number or password",
      });
    }

    res.json({
      message: "Admin login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        player: user.player,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    res.status(500).json({
      message: "Admin login failed",
    });
  }
});

module.exports = router;
