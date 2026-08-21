const express = require("express");
const Match = require("../models/Match");
const User = require("../models/User");
const Player = require("../models/Player");

const router = express.Router();

// ==========================================
// RECALCULATE PLAYER STATISTICS
// Match performances are the source of truth
// ==========================================

const recalculatePlayerStats = async (playerId) => {
  const matches = await Match.find({
    status: "Completed",
    "playerPerformances.player": playerId,
  }).select("playerPerformances");

  let matchesPlayed = 0;
  let totalRuns = 0;
  let ballsFaced = 0;
  let wickets = 0;
  let ballsBowled = 0;
  let fours = 0;
  let sixes = 0;
  let singles = 0;
  let bestScore = 0;

  for (const match of matches) {
    const performance = match.playerPerformances.find(
      (item) => item.player.toString() === playerId.toString(),
    );

    if (!performance) {
      continue;
    }

    matchesPlayed += 1;

    totalRuns += performance.runs || 0;
    ballsFaced += performance.ballsFaced || 0;
    wickets += performance.wickets || 0;
    ballsBowled += performance.ballsBowled || 0;
    fours += performance.fours || 0;
    sixes += performance.sixes || 0;

    singles += Math.max(
      0,
      (performance.runs || 0) -
        (performance.fours || 0) * 4 -
        (performance.sixes || 0) * 6,
    );

    if ((performance.runs || 0) > bestScore) {
      bestScore = performance.runs;
    }
  }

  const strikeRate = ballsFaced > 0 ? (totalRuns / ballsFaced) * 100 : 0;

  await Player.findByIdAndUpdate(playerId, {
    matchesPlayed,
    totalRuns,
    strikeRate: Number(strikeRate.toFixed(2)),
    bestScore,
    ballsFaced,
    wickets,
    ballsBowled,
    fours,
    sixes,
    singles,
  });
};

// ==========================================
// GET ALL MATCHES
// ==========================================

router.get("/", async (req, res) => {
  try {
    const matches = await Match.find()
      .populate("playerOfMatch", "name photo jerseyNumber role")
      .populate("playerPerformances.player", "name photo jerseyNumber role")
      .sort({ date: 1 });

    res.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);

    res.status(500).json({
      message: "Failed to fetch matches",
    });
  }
});

// ==========================================
// GET COMPLETED MATCHES FOR ONE PLAYER
// ==========================================

router.get("/player/:playerId/completed", async (req, res) => {
  try {
    const { playerId } = req.params;

    const matches = await Match.find({
      status: "Completed",
      "playerPerformances.player": playerId,
    })
      .populate("playerOfMatch", "name photo jerseyNumber role")
      .populate("playerPerformances.player", "name photo jerseyNumber role")
      .sort({ date: -1 });

    res.json(matches);
  } catch (error) {
    console.error("Error fetching player's completed matches:", error);

    res.status(500).json({
      message: "Failed to fetch player's completed matches",
    });
  }
});

// ==========================================
// GET ONE MATCH
// ==========================================

router.get("/:id", async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("playerOfMatch", "name photo jerseyNumber role")
      .populate("playerPerformances.player", "name photo jerseyNumber role");

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    res.json(match);
  } catch (error) {
    console.error("Error fetching match:", error);

    res.status(500).json({
      message: "Failed to fetch match",
    });
  }
});

// ==========================================
// CREATE MATCH
// ADMIN ONLY
// ==========================================

router.post("/", async (req, res) => {
  try {
    // ------------------------------------------
    // CHECK ADMIN AUTHENTICATION
    // ------------------------------------------

    const adminId = req.headers["x-user-id"];

    if (!adminId) {
      return res.status(401).json({
        message: "Admin authentication required",
      });
    }

    const admin = await User.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        message: "Admin account not found",
      });
    }

    if (admin.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can create matches",
      });
    }

    // ------------------------------------------
    // READ MATCH DATA
    // ------------------------------------------

    const {
      opponent,
      promotionalPhoto,
      venue,
      date,
      time,
      tournament,
      status,
      outcome,
      ourScore,
      opponentScore,
      result,
      playerOfMatch,
      playerOfMatchRuns,
      playerOfMatchWickets,
      playerOfMatchPerformance,
      playerPerformances,
    } = req.body;

    console.log("PROMOTIONAL PHOTO RECEIVED BY BACKEND:", promotionalPhoto);

    const match = new Match({
      opponent,
      promotionalPhoto: promotionalPhoto || "",
      venue,
      date,
      time,
      tournament,
      status,
      outcome: outcome || undefined,
      ourScore,
      opponentScore,
      result,
      playerPerformances: playerPerformances || [],
      playerOfMatch: playerOfMatch || null,
      playerOfMatchRuns: playerOfMatchRuns || "",
      playerOfMatchWickets: playerOfMatchWickets || "",
      playerOfMatchPerformance: playerOfMatchPerformance || "",
    });

    const savedMatch = await match.save();

    const populatedMatch = await Match.findById(savedMatch._id)
      .populate("playerOfMatch", "name photo jerseyNumber role")
      .populate("playerPerformances.player", "name photo jerseyNumber role");

    res.status(201).json(populatedMatch);
  } catch (error) {
    console.error("Error creating match:", error);

    res.status(500).json({
      message: error.message || "Failed to create match",
    });
  }
});

// ==========================================
// UPDATE GENERAL MATCH INFORMATION
// ADMIN ONLY
//
// This is the route that was missing.
// Used for:
// - opponent
// - venue
// - date
// - time
// - status
// - outcome
// - scores
// - result
// - player of the match
// - tournament
// - photos/logos
// ==========================================

router.put("/:id", async (req, res) => {
  try {
    const adminId = req.headers["x-user-id"];

    // ------------------------------------------
    // CHECK ADMIN AUTHENTICATION
    // ------------------------------------------

    if (!adminId) {
      return res.status(401).json({
        message: "Admin authentication required",
      });
    }

    const admin = await User.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        message: "Admin account not found",
      });
    }

    if (admin.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can edit matches",
      });
    }

    // ------------------------------------------
    // FIND MATCH
    // ------------------------------------------

    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    // ------------------------------------------
    // SAVE OLD STATUS
    // ------------------------------------------

    const oldStatus = match.status;

    // ------------------------------------------
    // UPDATE ONLY GENERAL MATCH INFORMATION
    //
    // IMPORTANT:
    // playerPerformances are NOT changed here.
    // They have their own dedicated route.
    // ------------------------------------------

    const {
      opponent,
      promotionalPhoto,
      playerOfMatchPhoto,
      venue,
      date,
      time,
      tournament,
      status,
      outcome,
      ourScore,
      opponentScore,
      result,
      playerOfMatch,
      playerOfMatchRuns,
      playerOfMatchWickets,
      playerOfMatchPerformance,
    } = req.body;

    match.opponent = opponent;
    match.promotionalPhoto = promotionalPhoto || "";
    match.playerOfMatchPhoto = playerOfMatchPhoto || "";
    match.venue = venue;
    match.date = date;
    match.time = time;
    match.tournament = tournament || "";
    match.status = status;
    match.outcome = outcome || null;
    match.ourScore = ourScore || "";
    match.opponentScore = opponentScore || "";
    match.result = result || "";

    match.playerOfMatch = playerOfMatch || null;
    match.playerOfMatchRuns = playerOfMatchRuns || "";
    match.playerOfMatchWickets = playerOfMatchWickets || "";
    match.playerOfMatchPerformance = playerOfMatchPerformance || "";

    // ------------------------------------------
    // SAVE MATCH
    // ------------------------------------------

    await match.save();

    // ------------------------------------------
    // IF STATUS CHANGED, RECALCULATE STATS
    //
    // Example:
    // Completed -> Upcoming
    // Upcoming -> Completed
    // ------------------------------------------

    if (oldStatus !== status && match.playerPerformances.length > 0) {
      const affectedPlayerIds = new Set(
        match.playerPerformances.map((performance) =>
          performance.player.toString(),
        ),
      );

      for (const playerId of affectedPlayerIds) {
        await recalculatePlayerStats(playerId);
      }
    }

    // ------------------------------------------
    // POPULATE RESPONSE
    // ------------------------------------------

    const populatedMatch = await Match.findById(match._id)
      .populate("playerOfMatch", "name photo jerseyNumber role")
      .populate("playerPerformances.player", "name photo jerseyNumber role");

    res.json({
      message: "Match updated successfully",
      match: populatedMatch,
    });
  } catch (error) {
    console.error("Error updating match:", error);

    res.status(500).json({
      message: "Failed to update match",
      error: error.message,
    });
  }
});

// ==========================================
// UPDATE MATCH PLAYER PERFORMANCES
// ADMIN ONLY
// ALSO UPDATES PLAYER STATISTICS
// ==========================================

router.put("/:id/performances", async (req, res) => {
  try {
    const adminId = req.headers["x-user-id"];

    // ------------------------------------------
    // CHECK ADMIN AUTHENTICATION
    // ------------------------------------------

    if (!adminId) {
      return res.status(401).json({
        message: "Admin authentication required",
      });
    }

    const admin = await User.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        message: "Admin account not found",
      });
    }

    if (admin.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can enter player performances",
      });
    }

    // ------------------------------------------
    // FIND MATCH
    // ------------------------------------------

    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    if (match.status !== "Completed") {
      return res.status(400).json({
        message:
          "Player performances can only be entered for completed matches",
      });
    }

    const { playerPerformances } = req.body;

    if (!Array.isArray(playerPerformances)) {
      return res.status(400).json({
        message: "Player performances must be an array",
      });
    }

    // ------------------------------------------
    // PREVENT DUPLICATE PLAYERS
    // ------------------------------------------

    const playerIds = playerPerformances.map(
      (performance) => performance.player,
    );

    const uniquePlayerIds = new Set(playerIds);

    if (uniquePlayerIds.size !== playerIds.length) {
      return res.status(400).json({
        message: "A player's performance can only be entered once",
      });
    }

    // ------------------------------------------
    // VERIFY PLAYERS
    // ------------------------------------------

    const validPlayers = await Player.find({
      _id: { $in: playerIds },
    }).select("_id");

    if (validPlayers.length !== playerIds.length) {
      return res.status(400).json({
        message: "One or more selected players do not exist",
      });
    }

    // ------------------------------------------
    // NORMALIZE PERFORMANCE DATA
    // ------------------------------------------

    const newPerformances = playerPerformances.map((performance) => {
      const runs = Math.max(0, Number(performance.runs) || 0);

      const fours = Math.max(0, Number(performance.fours) || 0);

      const sixes = Math.max(0, Number(performance.sixes) || 0);

      const singles = Math.max(0, runs - fours * 4 - sixes * 6);

      return {
        player: performance.player,

        runs,

        wickets: Math.max(0, Number(performance.wickets) || 0),

        ballsFaced: Math.max(0, Number(performance.ballsFaced) || 0),

        ballsBowled: Math.max(0, Number(performance.ballsBowled) || 0),

        fours,

        sixes,

        singles,
      };
    });

    // ------------------------------------------
    // KEEP TRACK OF OLD PLAYERS
    // ------------------------------------------

    const oldPlayerIds = (match.playerPerformances || []).map((performance) =>
      performance.player.toString(),
    );

    const affectedPlayerIds = new Set([
      ...oldPlayerIds,
      ...playerIds.map((id) => id.toString()),
    ]);

    // ------------------------------------------
    // SAVE NEW PERFORMANCE
    // ------------------------------------------

    match.playerPerformances = newPerformances;

    await match.save();

    // ------------------------------------------
    // RECALCULATE ALL AFFECTED PLAYERS
    // ------------------------------------------

    for (const playerId of affectedPlayerIds) {
      await recalculatePlayerStats(playerId);
    }

    // ------------------------------------------
    // POPULATE RESPONSE
    // ------------------------------------------

    const populatedMatch = await Match.findById(match._id)
      .populate("playerOfMatch", "name photo jerseyNumber role")
      .populate("playerPerformances.player", "name photo jerseyNumber role");

    res.json({
      message: "Player performances and statistics saved successfully",
      match: populatedMatch,
    });
  } catch (error) {
    console.error("Error saving player performances:", error);

    res.status(500).json({
      message: "Failed to save player performances",
      error: error.message,
    });
  }
});

// ==========================================
// DELETE MATCH
// ADMIN ONLY
// ==========================================

router.delete("/:id", async (req, res) => {
  try {
    const adminId = req.headers["x-user-id"];

    // ------------------------------------------
    // CHECK ADMIN
    // ------------------------------------------

    if (!adminId) {
      return res.status(401).json({
        message: "Admin authentication required",
      });
    }

    const admin = await User.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        message: "Admin account not found",
      });
    }

    if (admin.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can delete matches",
      });
    }

    // ------------------------------------------
    // FIND MATCH
    // ------------------------------------------

    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    // ------------------------------------------
    // REMEMBER AFFECTED PLAYERS
    // ------------------------------------------

    const affectedPlayerIds = new Set(
      (match.playerPerformances || []).map((performance) =>
        performance.player.toString(),
      ),
    );

    // ------------------------------------------
    // DELETE MATCH
    // ------------------------------------------

    await Match.findByIdAndDelete(req.params.id);

    // ------------------------------------------
    // RECALCULATE PLAYER STATISTICS
    // ------------------------------------------

    for (const playerId of affectedPlayerIds) {
      await recalculatePlayerStats(playerId);
    }

    res.json({
      message: "Match deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting match:", error);

    res.status(500).json({
      message: "Failed to delete match",
      error: error.message,
    });
  }
});

module.exports = router;
