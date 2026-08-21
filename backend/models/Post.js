const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
      required: true,
      trim: true,
    },

    media: [
      {
        url: {
          type: String,
          required: true,
        },

        type: {
          type: String,
          enum: ["image", "video"],
          required: true,
        },
      },
    ],

    category: {
      type: String,
      enum: [
        "Match",
        "Victory",
        "Training",
        "Player",
        "Announcement",
        "Celebration",
        "Other",
      ],
      default: "Other",
    },

    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      default: null,
    },

    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Post", postSchema);
