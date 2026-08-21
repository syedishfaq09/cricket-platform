const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Player = require("../models/Player");

// ==========================================
// ADMIN AUTHENTICATION HELPER
// ==========================================
const verifyAdmin = async (req, res) => {
  const adminId = req.headers["x-user-id"];

  if (!adminId) {
    res.status(401).json({
      message: "Admin authentication required",
    });
    return null;
  }

  const admin = await User.findById(adminId);

  if (!admin) {
    res.status(404).json({
      message: "Admin account not found",
    });
    return null;
  }

  if (admin.role !== "admin") {
    res.status(403).json({
      message: "Only administrators can perform this action",
    });
    return null;
  }

  return admin;
};

// ==========================================
// GET PENDING PLAYER REGISTRATIONS
// ==========================================
router.get("/pending-players", async (req, res) => {
  try {
    const admin = await verifyAdmin(req, res);

    if (!admin) return;

    const pendingPlayers = await User.find({
      role: "player",
      status: "pending",
    }).select("-password");

    res.json(pendingPlayers);
  } catch (error) {
    console.error("Error fetching pending players:", error);

    res.status(500).json({
      message: "Failed to fetch pending players",
    });
  }
});

// ==========================================
// APPROVE PLAYER
// ==========================================
router.put("/players/:id/approve", async (req, res) => {
  try {
    const admin = await verifyAdmin(req, res);

    if (!admin) return;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "Player registration not found",
      });
    }

    if (user.role !== "player") {
      return res.status(400).json({
        message: "This account is not a player account",
      });
    }

    if (user.status === "approved") {
      return res.status(400).json({
        message: "Player is already approved",
      });
    }

    // Prevent creating duplicate Player profiles
    if (user.player) {
      return res.status(400).json({
        message: "Player profile already exists",
      });
    }

    const player = await Player.create({
      name: user.name,
    });

    user.status = "approved";
    user.player = player._id;

    await user.save();

    res.json({
      message: "Player approved successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        player: user.player,
      },
      player,
    });
  } catch (error) {
    console.error("Error approving player:", error);

    res.status(500).json({
      message: "Failed to approve player",
      error: error.message,
    });
  }
});

// ==========================================
// REJECT PLAYER
// ==========================================
router.put("/players/:id/reject", async (req, res) => {
  try {
    const admin = await verifyAdmin(req, res);

    if (!admin) return;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "Player registration not found",
      });
    }

    if (user.role !== "player") {
      return res.status(400).json({
        message: "This account is not a player account",
      });
    }

    user.status = "rejected";

    await user.save();

    res.json({
      message: "Player registration rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting player:", error);

    res.status(500).json({
      message: "Failed to reject player",
      error: error.message,
    });
  }
});

// ==========================================
// ADD PLAYER
// ==========================================
router.post("/players", async (req, res) => {
  try {
    const admin = await verifyAdmin(req, res);

    if (!admin) return;

    const { name, photo, jerseyNumber, role, battingStyle, bowlingStyle, bio } =
      req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Player name is required",
      });
    }

    const player = await Player.create({
      name: name.trim(),
      photo: photo || "",
      jerseyNumber,
      role,
      battingStyle,
      bowlingStyle,
      bio: bio || "",
    });

    res.status(201).json({
      message: "Player added successfully",
      player,
    });
  } catch (error) {
    console.error("Error adding player:", error);

    res.status(500).json({
      message: "Failed to add player",
      error: error.message,
    });
  }
});

// ==========================================
// EDIT PLAYER — ADMIN
// ==========================================
router.put("/players/:id", async (req, res) => {
  try {
    const admin = await verifyAdmin(req, res);

    if (!admin) return;

    const player = await Player.findById(req.params.id);

    if (!player) {
      return res.status(404).json({
        message: "Player not found",
      });
    }

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
      player.name = name.trim();
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

    res.json({
      message: "Player updated successfully",
      player,
    });
  } catch (error) {
    console.error("Error editing player:", error);

    res.status(500).json({
      message: "Failed to edit player",
      error: error.message,
    });
  }
});

// ==========================================
// DELETE PLAYER
// ==========================================
router.delete("/players/:id", async (req, res) => {
  try {
    const admin = await verifyAdmin(req, res);

    if (!admin) return;

    const player = await Player.findById(req.params.id);

    if (!player) {
      return res.status(404).json({
        message: "Player not found",
      });
    }

    // Remove Player reference from any User account
    await User.updateMany(
      { player: player._id },
      {
        $set: {
          player: null,
        },
      },
    );

    await Player.findByIdAndDelete(req.params.id);

    res.json({
      message: "Player deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting player:", error);

    res.status(500).json({
      message: "Failed to delete player",
      error: error.message,
    });
  }
});

// ==========================================
// ASSIGN CAPTAIN
// ==========================================
router.put("/players/:id/captain", async (req, res) => {
  try {
    const admin = await verifyAdmin(req, res);

    if (!admin) return;

    const player = await Player.findById(req.params.id);

    if (!player) {
      return res.status(404).json({
        message: "Player not found",
      });
    }

    // Remove captain status from current captain
    await Player.updateMany(
      { isCaptain: true },
      { $set: { isCaptain: false } },
    );

    // Make selected player captain
    player.isCaptain = true;

    await player.save();

    res.json({
      message: "Captain assigned successfully",
      player,
    });
  } catch (error) {
    console.error("Error assigning captain:", error);

    res.status(500).json({
      message: "Failed to assign captain",
      error: error.message,
    });
  }
});

// ==========================================
// UPDATE PLAYER STATISTICS
// ADMIN ONLY
// ==========================================
router.put("/players/:id/stats", async (req, res) => {
  try {
    const adminId = req.headers["x-user-id"];

    // Check admin ID
    if (!adminId) {
      return res.status(401).json({
        message: "Admin authentication required",
      });
    }

    // Find logged-in user
    const admin = await User.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        message: "Admin account not found",
      });
    }

    // Make sure user is actually an admin
    if (admin.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can update player statistics",
      });
    }

    // Find player
    const player = await Player.findById(req.params.id);

    if (!player) {
      return res.status(404).json({
        message: "Player not found",
      });
    }

    const {
      matchesPlayed,
      totalRuns,
      strikeRate,
      bestScore,
      ballsFaced,
      sixes,
      fours,
      singles,
    } = req.body;

    // Update statistics
    player.matchesPlayed = Number(matchesPlayed) || 0;
    player.totalRuns = Number(totalRuns) || 0;
    player.strikeRate = Number(strikeRate) || 0;
    player.bestScore = Number(bestScore) || 0;
    player.ballsFaced = Number(ballsFaced) || 0;
    player.sixes = Number(sixes) || 0;
    player.fours = Number(fours) || 0;
    player.singles = Number(singles) || 0;

    await player.save();

    res.json({
      message: "Player statistics updated successfully",
      player,
    });
  } catch (error) {
    console.error("Error updating player statistics:", error);

    res.status(500).json({
      message: "Failed to update player statistics",
      error: error.message,
    });
  }
});

module.exports = router;
