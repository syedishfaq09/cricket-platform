const express = require("express");
const router = express.Router();

const OTP = require("../models/OTP");
const User = require("../models/User");
const Player = require("../models/Player");

// ==========================================
// NORMALIZE INDIAN PHONE NUMBER
// ==========================================
const normalizePhone = (phone) => {
  if (!phone) return "";

  let cleaned = phone.toString().trim().replace(/\s+/g, "");

  // Remove +91
  if (cleaned.startsWith("+91")) {
    cleaned = cleaned.substring(3);
  }

  // Remove 91 from 12-digit number
  if (cleaned.startsWith("91") && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }

  // Remove leading 0
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = cleaned.substring(1);
  }

  return cleaned;
};

// ==========================================
// SEND OTP
// ==========================================
router.post("/send", async (req, res) => {
  try {
    const { phone } = req.body;

    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone) {
      return res.status(400).json({
        message: "Please enter your phone number",
      });
    }

    // Find user using common Indian phone formats
    const user = await User.findOne({
      $or: [
        { phone: normalizedPhone },
        { phone: `0${normalizedPhone}` },
        { phone: `+91${normalizedPhone}` },
        { phone: `91${normalizedPhone}` },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "Phone number is not registered",
      });
    }

    // Only players can use Player OTP Login
    if (user.role !== "player") {
      return res.status(403).json({
        message: "Please use the Admin Login",
      });
    }

    // Player must be approved
    if (user.status !== "approved") {
      if (user.status === "pending") {
        return res.status(403).json({
          message: "Your registration is still waiting for admin approval",
        });
      }

      if (user.status === "rejected") {
        return res.status(403).json({
          message: "Your player registration was rejected",
        });
      }

      return res.status(403).json({
        message: "Your player account is not approved",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Always store OTP using normalized 10-digit number
    await OTP.deleteMany({
      phone: normalizedPhone,
    });

    await OTP.create({
      phone: normalizedPhone,
      otp,
      expiresAt,
    });

    console.log(`OTP for ${normalizedPhone}: ${otp}`);

    res.json({
      message: "OTP generated successfully",
    });
  } catch (error) {
    console.error("Send OTP error:", error);

    res.status(500).json({
      message: "Failed to generate OTP",
      error: error.message,
    });
  }
});

// ==========================================
// VERIFY OTP
// ==========================================
router.post("/verify", async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone || !otp) {
      return res.status(400).json({
        message: "Phone number and OTP are required",
      });
    }

    const otpRecord = await OTP.findOne({
      phone: normalizedPhone,
      otp,
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    // Find user using common Indian phone formats
    const user = await User.findOne({
      $or: [
        { phone: normalizedPhone },
        { phone: `0${normalizedPhone}` },
        { phone: `+91${normalizedPhone}` },
        { phone: `91${normalizedPhone}` },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Only players can use Player OTP Login
    if (user.role !== "player") {
      return res.status(403).json({
        message: "Please use the Admin Login",
      });
    }

    // Player must be approved
    if (user.status !== "approved") {
      await OTP.deleteOne({
        _id: otpRecord._id,
      });

      if (user.status === "pending") {
        return res.status(403).json({
          message: "Your registration is still waiting for admin approval",
        });
      }

      if (user.status === "rejected") {
        return res.status(403).json({
          message: "Your player registration was rejected",
        });
      }

      return res.status(403).json({
        message: "Your player account is not approved",
      });
    }

    // OTP can only be used once
    await OTP.deleteOne({
      _id: otpRecord._id,
    });

    // Create and link player profile if missing
    if (!user.player) {
      const player = await Player.create({
        name: user.name,
      });

      user.player = player._id;
      await user.save();
    }

    res.json({
      message: "OTP verified successfully",
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
    console.error("OTP verification error:", error);

    res.status(500).json({
      message: "OTP verification failed",
      error: error.message,
    });
  }
});

module.exports = router;
