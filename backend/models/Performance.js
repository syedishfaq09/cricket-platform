const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },

    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },

    runs: {
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

    runsConceded: {
      type: Number,
      default: 0,
    },

    oversBowled: {
      type: Number,
      default: 0,
    },

    isPlayerOfMatch: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Performance", performanceSchema);
