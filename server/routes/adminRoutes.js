
import mongoose from "mongoose";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";

import Admission from "../models/Admission.js";
import Contact from "../models/Contact.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

// Admin login - Owner and Principal
router.post("/login", adminLoginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;

    const admins = [
      {
        username: process.env.ADMIN_USERNAME,
        passwordHash: process.env.ADMIN_PASSWORD_HASH,
        adminType: "owner",
      },
      {
        username: process.env.PRINCIPAL_USERNAME,
        passwordHash: process.env.PRINCIPAL_PASSWORD_HASH,
        adminType: "principal",
      },
    ].filter((admin) => admin.username && admin.passwordHash);

    if (!jwtSecret || admins.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Admin login is not configured on the server.",
      });
    }

    const admin = admins.find((item) => item.username === username);

    const validPassword = admin
      ? await bcrypt.compare(password, admin.passwordHash)
      : false;

    if (!admin || !validPassword) {
      return res.status(401).json({
        success: false,
        message: "Incorrect username or password.",
      });
    }

    const token = jwt.sign(
      {
        role: "admin",
        username: admin.username,
        adminType: admin.adminType,
      },
      jwtSecret,
      { expiresIn: "2h" }
    );

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      adminType: admin.adminType,
      username: admin.username,
      expiresIn: 7200,
    });
  } catch (error) {
    console.error("Admin login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to log in right now.",
    });
  }
});

// Protect all routes below this line
router.use(authMiddleware);

// Get dashboard statistics
router.get("/dashboard", async (req, res) => {
  try {
    const [totalAdmissions, newAdmissions, totalContacts] =
      await Promise.all([
        Admission.countDocuments(),
        Admission.countDocuments({ status: "new" }),
        Contact.countDocuments(),
      ]);

    return res.json({
      success: true,
      stats: {
        totalAdmissions,
        newAdmissions,
        totalContacts,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard statistics.",
    });
  }
});

// Get admission enquiries
router.get("/admissions", async (req, res) => {
  try {
    const admissions = await Admission.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    // Keep MongoDB _id unchanged.
    // Expose a readable ID for dashboard display.
    const formattedAdmissions = admissions.map((admission) => ({
      ...admission,
      enquiryId:
        admission.enquiryNumber || admission._id.toString(),
      enquiryNumber: admission.enquiryNumber || null,
    }));

    return res.json({
      success: true,
      count: formattedAdmissions.length,
      admissions: formattedAdmissions,
    });
  } catch (error) {
    console.error("Admissions error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load admissions.",
    });
  }
});

// Find an admission by MongoDB ID or standard Enquiry ID
router.get("/admissions/:id", async (req, res) => {
  try {
    const identifier = req.params.id;

    const query = mongoose.isValidObjectId(identifier)
      ? {
          $or: [
            { _id: identifier },
            { enquiryNumber: identifier },
          ],
        }
      : { enquiryNumber: identifier };

    const admission = await Admission.findOne(query).lean();

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: "Admission enquiry not found.",
      });
    }

    return res.json({
      success: true,
      admission: {
        ...admission,
        enquiryId:
          admission.enquiryNumber || admission._id.toString(),
      },
    });
  } catch (error) {
    console.error("Find admission error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to find admission enquiry.",
    });
  }
});

// Update admission status using MongoDB ID or standard Enquiry ID
router.patch("/admissions/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["new", "contacted", "completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admission status.",
      });
    }

    const identifier = req.params.id;

    const query = mongoose.isValidObjectId(identifier)
      ? {
          $or: [
            { _id: identifier },
            { enquiryNumber: identifier },
          ],
        }
      : { enquiryNumber: identifier };

    const admission = await Admission.findOneAndUpdate(
      query,
      { $set: { status } },
      { new: true, runValidators: true }
    ).lean();

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: "Admission enquiry not found.",
      });
    }

    return res.json({
      success: true,
      message: "Admission status updated.",
      admission: {
        ...admission,
        enquiryId:
          admission.enquiryNumber || admission._id.toString(),
      },
    });
  } catch (error) {
    console.error("Admission status update error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update admission status.",
    });
  }
});

// Get contact messages
router.get("/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return res.json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (error) {
    console.error("Contacts error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load contact messages.",
    });
  }
});

export default router;
