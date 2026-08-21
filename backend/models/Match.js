const mongoose = require("mongoose");

const playerPerformanceSchema = new mongoose.Schema(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },

    // Batting
    runs: {
      type: Number,
      default: 0,
      min: 0,
    },

    ballsFaced: {
      type: Number,
      default: 0,
      min: 0,
    },

    fours: {
      type: Number,
      default: 0,
      min: 0,
    },

    sixes: {
      type: Number,
      default: 0,
      min: 0,
    },

    singles: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Bowling
    wickets: {
      type: Number,
      default: 0,
      min: 0,
    },

    ballsBowled: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false },
);

const matchSchema = new mongoose.Schema(
  {
    opponent: {
      type: String,
      required: true,
    },

    opponentLogo: {
      type: String,
      default: "",
    },

    stadiumPhoto: {
      type: String,
      default: "",
    },

    // Promotional image for upcoming match story
    // Optional
    promotionalPhoto: {
      type: String,
      default: "",
    },

    venue: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    tournament: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Upcoming", "Live", "Completed"],
      default: "Upcoming",
    },

    outcome: {
      type: String,
      enum: ["Won", "Lost", "Draw", "No Result"],
      default: null,
    },

    ourScore: {
      type: String,
      default: "",
    },

    opponentScore: {
      type: String,
      default: "",
    },

    result: {
      type: String,
      default: "",
    },

    // ==========================================
    // PLAYER OF THE MATCH
    // ==========================================

    playerOfMatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      default: null,
    },

    // Optional special photo for Player of the Match story
    // If empty, the player's current profile photo will be used
    playerOfMatchPhoto: {
      type: String,
      default: "",
    },

    playerOfMatchRuns: {
      type: String,
      default: "",
    },

    playerOfMatchWickets: {
      type: String,
      default: "",
    },

    playerOfMatchPerformance: {
      type: String,
      default: "",
    },

    // ==========================================
    // PLAYER PERFORMANCES FOR THIS MATCH
    // ==========================================

    playerPerformances: {
      type: [playerPerformanceSchema],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Match", matchSchema);
