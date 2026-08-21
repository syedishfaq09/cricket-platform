const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    isCaptain: {
      type: Boolean,
      default: false,
    },

    photo: {
      type: String,
      default: "",
    },

    jerseyNumber: {
      type: Number,
    },

    role: {
      type: String,
      enum: ["Batsman", "Bowler", "All-rounder", "Wicketkeeper"],
    },

    battingStyle: {
      type: String,
    },

    bowlingStyle: {
      type: String,
    },

    bio: {
      type: String,
      default: "",
    },

    // ==========================================
    // BATTING STATISTICS
    // Admin controlled
    // ==========================================

    matchesPlayed: {
      type: Number,
      default: 0,
    },

    totalRuns: {
      type: Number,
      default: 0,
    },

    strikeRate: {
      type: Number,
      default: 0,
    },

    bestScore: {
      type: Number,
      default: 0,
    },

    ballsFaced: {
      type: Number,
      default: 0,
    },

    wickets: {
      type: Number,
      default: 0,
    },

    ballsBowled: {
      type: Number,
      default: 0,
    },

    sixes: {
      type: Number,
      default: 0,
    },

    fours: {
      type: Number,
      default: 0,
    },

    singles: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Player", playerSchema);
