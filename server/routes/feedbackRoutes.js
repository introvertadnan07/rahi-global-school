import express from "express";
import mongoose from "mongoose";
import Feedback from "../models/Feedback.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: submit feedback. New submissions always remain pending.
router.post("/", async (req, res) => {
  try {
    const parentName =
      typeof req.body.parentName === "string" ? req.body.parentName.trim() : "";
    const studentClass =
      typeof req.body.studentClass === "string"
        ? req.body.studentClass.trim()
        : "";
    const message =
      typeof req.body.message === "string" ? req.body.message.trim() : "";
    const rating =
      req.body.rating === "" || req.body.rating == null
        ? null
        : Number(req.body.rating);

    if (parentName.length < 2 || parentName.length > 60) {
      return res.status(400).json({
        success: false,
        message: "Parent name must be between 2 and 60 characters.",
      });
    }

    if (studentClass.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Student class must be 30 characters or fewer.",
      });
    }

    if (message.length < 10 || message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Feedback must be between 10 and 1000 characters.",
      });
    }

    if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number between 1 and 5.",
      });
    }

    const feedback = await Feedback.create({
      parentName,
      studentClass,
      message,
      rating,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Thank you! Your feedback was submitted for review.",
      feedback: {
        _id: feedback._id,
        status: feedback.status,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Submit feedback error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to submit feedback right now.",
    });
  }
});

// Public: only approved feedback is visible on the school website.
router.get("/approved", async (_req, res) => {
  try {
    const feedback = await Feedback.find({ status: "approved" })
      .select("parentName studentClass message rating createdAt")
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return res.json({
      success: true,
      count: feedback.length,
      feedback,
    });
  } catch (error) {
    console.error("Load approved feedback error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load parent feedback.",
    });
  }
});

// All routes below this point require admin authentication.
router.use(authMiddleware);

// Admin: list submissions, including pending/rejected.
router.get("/", async (_req, res) => {
  try {
    const feedback = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return res.json({ success: true, count: feedback.length, feedback });
  } catch (error) {
    console.error("Admin list feedback error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load feedback.",
    });
  }
});

// Admin: approve, reject, or return feedback to pending.
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback ID.",
      });
    }

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be pending, approved, or rejected.",
      });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found.",
      });
    }

    return res.json({
      success: true,
      message: `Feedback ${status}.`,
      feedback,
    });
  } catch (error) {
    console.error("Update feedback status error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update feedback status.",
    });
  }
});

export default router;
