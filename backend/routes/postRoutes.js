const express = require("express");
const Post = require("../models/Post");
const User = require("../models/User");

const router = express.Router();

// ==========================================
// GET ALL POSTS
// ==========================================

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("createdBy", "name")
      .populate("match", "opponent date status")
      .populate("player", "name photo jerseyNumber role")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);

    res.status(500).json({
      message: "Failed to fetch posts",
    });
  }
});

// ==========================================
// GET ONE POST
// ==========================================

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("createdBy", "name")
      .populate("match", "opponent date status")
      .populate("player", "name photo jerseyNumber role");

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);

    res.status(500).json({
      message: "Failed to fetch post",
    });
  }
});

// ==========================================
// CREATE POST - ADMIN ONLY
// ==========================================

router.post("/", async (req, res) => {
  try {
    const adminId = req.headers["x-user-id"];

    if (!adminId) {
      return res.status(401).json({
        message: "Admin authentication required.",
      });
    }

    const admin = await User.findById(adminId);

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can create posts.",
      });
    }

    const { caption, media, category, match, player } = req.body;

    if (!caption || !caption.trim()) {
      return res.status(400).json({
        message: "Caption is required.",
      });
    }

    const post = new Post({
      caption: caption.trim(),
      media: media || [],
      category: category || "Other",
      match: match || null,
      player: player || null,
      createdBy: admin._id,
    });

    const savedPost = await post.save();

    const populatedPost = await savedPost.populate([
      {
        path: "createdBy",
        select: "name",
      },
      {
        path: "match",
        select: "opponent date status",
      },
      {
        path: "player",
        select: "name photo jerseyNumber role",
      },
    ]);

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Error creating post:", error);

    res.status(500).json({
      message: error.message || "Failed to create post.",
    });
  }
});

// ==========================================
// UPDATE POST - ADMIN ONLY
// ==========================================

router.put("/:id", async (req, res) => {
  try {
    const adminId = req.headers["x-user-id"];

    if (!adminId) {
      return res.status(401).json({
        message: "Admin authentication required.",
      });
    }

    const admin = await User.findById(adminId);

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can edit posts.",
      });
    }

    const { caption, media, category, match, player } = req.body;

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        caption: caption?.trim(),
        media: media || [],
        category: category || "Other",
        match: match || null,
        player: player || null,
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("createdBy", "name")
      .populate("match", "opponent date status")
      .populate("player", "name photo jerseyNumber role");

    if (!post) {
      return res.status(404).json({
        message: "Post not found.",
      });
    }

    res.json(post);
  } catch (error) {
    console.error("Error updating post:", error);

    res.status(500).json({
      message: error.message || "Failed to update post.",
    });
  }
});

// ==========================================
// DELETE POST - ADMIN ONLY
// ==========================================

router.delete("/:id", async (req, res) => {
  try {
    const adminId = req.headers["x-user-id"];

    if (!adminId) {
      return res.status(401).json({
        message: "Admin authentication required.",
      });
    }

    const admin = await User.findById(adminId);

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can delete posts.",
      });
    }

    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found.",
      });
    }

    res.json({
      message: "Post deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting post:", error);

    res.status(500).json({
      message: "Failed to delete post.",
    });
  }
});

module.exports = router;
