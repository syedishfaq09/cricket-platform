const express = require("express");
const Player = require("../models/Player");
const User = require("../models/User");

const router = express.Router();

// ==========================================
// GET ALL PLAYERS
// ==========================================
router.get("/", async (req, res) => {
  try {
    const players = await Player.find();

    res.json(players);
  } catch (error) {
    console.error("Error fetching players:", error);

    res.status(500).json({
      message: "Failed to fetch players",
    });
  }
});

// ==========================================
// GET ONE PLAYER
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);

    if (!player) {
      return res.status(404).json({
        message: "Player not found",
      });
    }

    res.json(player);
  } catch (error) {
    console.error("Error fetching player:", error);

    res.status(500).json({
      message: "Failed to fetch player",
    });
  }
});

// ==========================================
// UPDATE PLAYER PROFILE
// ==========================================
router.put("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    // ------------------------------------------
    // AUTHENTICATION CHECK
    // ------------------------------------------
    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        message: "User account not found",
      });
    }

    // ------------------------------------------
    // FIND PLAYER
    // ------------------------------------------
    const player = await Player.findById(req.params.id);

    if (!player) {
      return res.status(404).json({
        message: "Player not found",
      });
    }

    // ==========================================
    // ADMIN UPDATE
    // ==========================================
    if (user.role === "admin") {
      const {
        name,
        photo,
        jerseyNumber,
        role,
        battingStyle,
        bowlingStyle,
        bio,
        isCaptain,
      } = req.body;

      if (name !== undefined) {
        player.name = name;
      }

      if (photo !== undefined) {
        player.photo = photo;
      }

      if (jerseyNumber !== undefined) {
        player.jerseyNumber = jerseyNumber;
      }

      if (role !== undefined) {
        player.role = role;
      }

      if (battingStyle !== undefined) {
        player.battingStyle = battingStyle;
      }

      if (bowlingStyle !== undefined) {
        player.bowlingStyle = bowlingStyle;
      }

      if (bio !== undefined) {
        player.bio = bio;
      }

      if (isCaptain !== undefined) {
        player.isCaptain = isCaptain;
      }

      await player.save();

      return res.json({
        message: "Player updated successfully by admin",
        player,
      });
    }

    // ==========================================
    // PLAYER UPDATE
    // ==========================================

    // Only player accounts can use player profile editing
    if (user.role !== "player") {
      return res.status(403).json({
        message: "You are not allowed to edit this profile",
      });
    }

    // Player must be approved
    if (user.status !== "approved") {
      return res.status(403).json({
        message: "Your player account is not approved",
      });
    }

    // Player can edit ONLY their own profile
    if (!user.player || user.player.toString() !== player._id.toString()) {
      return res.status(403).json({
        message: "You can only edit your own player profile",
      });
    }

    // ------------------------------------------
    // ALLOWED PLAYER FIELDS ONLY
    // ------------------------------------------
    const { name, photo, jerseyNumber, battingStyle, bowlingStyle } = req.body;

    if (name !== undefined) {
      player.name = name;
    }

    if (photo !== undefined) {
      player.photo = photo;
    }

    if (jerseyNumber !== undefined) {
      player.jerseyNumber = jerseyNumber;
    }

    if (battingStyle !== undefined) {
      player.battingStyle = battingStyle;
    }

    if (bowlingStyle !== undefined) {
      player.bowlingStyle = bowlingStyle;
    }

    // IMPORTANT:
    // Players CANNOT modify:
    // - role
    // - bio
    // - isCaptain
    // - future statistics
    //
    // These remain controlled by admin.

    await player.save();

    res.json({
      message: "Profile updated successfully",
      player,
    });
  } catch (error) {
    console.error("Error updating player:", error);

    res.status(500).json({
      message: "Failed to update player profile",
      error: error.message,
    });
  }
});

module.exports = router;
