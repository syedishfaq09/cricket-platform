const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

// Store uploaded media temporarily in memory
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
});

// ==========================================
// UPLOAD IMAGE TO CLOUDINARY
// ==========================================

router.post("/media", upload.single("media"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No media uploaded",
      });
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "alamdar-stars",
        resource_type: req.file.mimetype.startsWith("video")
          ? "video"
          : "image",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);

          return res.status(500).json({
            message: "Failed to upload media",
          });
        }

        res.status(200).json({
          message: "Image uploaded successfully",
          mediaUrl: result.secure_url,
          type: req.file.mimetype.startsWith("video") ? "video" : "image",
        });
      },
    );

    stream.end(req.file.buffer);
  } catch (error) {
    console.error("Upload error:", error);

    res.status(500).json({
      message: "Failed to upload media",
    });
  }
});

module.exports = router;
