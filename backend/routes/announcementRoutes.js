const express = require("express");
const router = express.Router();

const Announcement = require("../models/Announcement");

// GET ALL ANNOUNCEMENTS

router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});

// CREATE ANNOUNCEMENT

router.post("/", async (req, res) => {
  try {
    const announcement = await Announcement.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      createdBy: "Admin",
    });

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create announcement",
    });
  }
});

// DELETE ANNOUNCEMENT

router.delete("/:id", async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);

    res.json({
      message: "Announcement deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Delete failed",
    });
  }
});

module.exports = router;
