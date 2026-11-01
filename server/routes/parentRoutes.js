import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import nodemailer from "nodemailer";

import Parent from "../models/Parent.js";
import Admission from "../models/Admission.js";
import parentAuthMiddleware from "../middleware/parentAuthMiddleware.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});

function normalizePhone(value) {
  return typeof value === "string" ? value.trim() : "";
}

function hashValue(value) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return crypto
    .createHash("sha256")
    .update(`${value}:${process.env.JWT_SECRET}`)
    .digest("hex");
}

function safeEqual(a, b) {
  const first = Buffer.from(a);
  const second = Buffer.from(b);

  return (
    first.length === second.length &&
    crypto.timingSafeEqual(first, second)
  );
}

function issueParentToken(parent) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign(
    { role: "parent", parentId: parent._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
}

function parentResponse(parent) {
  return {
    id: parent._id,
    name: parent.name,
    username: parent.username || "",
    email: parent.email || "",
    emailVerified: parent.emailVerified === true,
    phone: parent.phone,
  };
}

async function sendRecoveryEmailOtp(email, otp) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP configuration is missing.");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Rahi Global School - Verify Recovery Email",
    text: `Your recovery email verification OTP is ${otp}.

This OTP is valid for 5 minutes.
You can make up to 5 verification attempts.
Do not share this OTP with anyone.

If you did not request this verification, please ignore this email.`,
  });
}

// POST /api/parents/register
router.post("/register", authLimiter, async (req, res) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const username = typeof req.body.username === "string"
      ? req.body.username.trim().toLowerCase()
      : "";
    const phone = normalizePhone(req.body.phone);
    const email = typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
    const password = req.body.password;

    const validUsername = /^[a-z0-9_.-]{3,30}$/.test(username);
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validPhone = /^[0-9+()\-\s]{7,20}$/.test(phone);

    if (
      !name ||
      name.length > 100 ||
      !validUsername ||
      !validEmail ||
      email.length > 254 ||
      !validPhone ||
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 12
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter valid registration details. Password must be 8-12 characters.",
      });
    }

    const existing = await Parent.findOne({
      $or: [{ phone }, { username }, { email }],
    }).lean();

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Phone number, username or email is already registered.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const parent = await Parent.create({
      name,
      username,
      phone,
      email,
      emailVerified: false,
      passwordHash,
    });

    return res.status(201).json({
      success: true,
      message: "Parent account created successfully. Verify your recovery email from your dashboard.",
      token: issueParentToken(parent),
      parent: parentResponse(parent),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Phone number, username or email is already registered.",
      });
    }

    console.error("Parent registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create your account right now.",
    });
  }
});

// POST /api/parents/login
router.post("/login", authLimiter, async (req, res) => {
  try {
    const identifier = typeof req.body.identifier === "string"
      ? req.body.identifier.trim()
      : normalizePhone(req.body.phone);
    const password = req.body.password;

    if (
      !identifier ||
      identifier.length > 254 ||
      typeof password !== "string" ||
      !password ||
      password.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid username or mobile number and password.",
      });
    }

    const normalized = identifier.toLowerCase();

    const parent = await Parent.findOne({
      $or: [
        { phone: identifier },
        { username: normalized },
      ],
    }).select("+passwordHash");

    if (!parent || !(await bcrypt.compare(password, parent.passwordHash))) {
      return res.status(401).json({
        success: false,
        message: "Incorrect username/mobile number or password.",
      });
    }

    return res.json({
      success: true,
      message: "Login successful.",
      token: issueParentToken(parent),
      parent: parentResponse(parent),
    });
  } catch (error) {
    console.error("Parent login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to log in right now.",
    });
  }
});

// POST /api/parents/email/send-otp
router.post("/email/send-otp", parentAuthMiddleware, authLimiter, async (req, res) => {
  try {
    const email = typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    const parent = await Parent.findById(req.parent.id)
      .select("+emailVerificationOtpHash");

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent account not found.",
      });
    }

    if (parent.emailVerified && parent.email === email) {
      return res.json({
        success: true,
        message: "This email address is already verified.",
        alreadyVerified: true,
      });
    }

    const existingEmail = await Parent.findOne({
      email,
      _id: { $ne: parent._id },
    }).lean();

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "This email address is already associated with another account.",
      });
    }

    if (
      parent.emailVerificationResendAt &&
      parent.emailVerificationResendAt > new Date()
    ) {
      return res.status(429).json({
        success: false,
        message: "Please wait before requesting another OTP.",
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    parent.pendingEmail = email;
    parent.emailVerificationOtpHash = hashValue(otp);
    parent.emailVerificationOtpExpiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );
    parent.emailVerificationAttempts = 0;
    parent.emailVerificationResendAt = new Date(
      Date.now() + 60 * 1000
    );

    await parent.save();

    try {
      await sendRecoveryEmailOtp(email, otp);
    } catch (deliveryError) {
      parent.pendingEmail = null;
      parent.emailVerificationOtpHash = null;
      parent.emailVerificationOtpExpiresAt = null;
      parent.emailVerificationResendAt = null;

      await parent.save();

      console.error("Recovery email delivery failed:", deliveryError.message);

      return res.status(503).json({
        success: false,
        message: "Email OTP delivery failed. Please try again later.",
      });
    }

    return res.json({
      success: true,
      message: "Verification OTP sent to your email address. It expires in 5 minutes.",
    });
  } catch (error) {
    console.error("Send recovery email OTP error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to send verification OTP right now.",
    });
  }
});

// POST /api/parents/email/verify-otp
router.post("/email/verify-otp", parentAuthMiddleware, authLimiter, async (req, res) => {
  try {
    const { otp } = req.body;

    if (typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid six-digit OTP.",
      });
    }

    const parent = await Parent.findById(req.parent.id)
      .select("+emailVerificationOtpHash");

    if (
      !parent ||
      !parent.pendingEmail ||
      !parent.emailVerificationOtpHash ||
      !parent.emailVerificationOtpExpiresAt ||
      parent.emailVerificationOtpExpiresAt < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP is invalid or expired. Request a new OTP.",
      });
    }

    if (parent.emailVerificationAttempts >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Request a new OTP.",
      });
    }

    parent.emailVerificationAttempts += 1;
    await parent.save();

    if (!safeEqual(hashValue(otp), parent.emailVerificationOtpHash)) {
      return res.status(400).json({
        success: false,
        message: "Incorrect OTP.",
      });
    }

    const existingEmail = await Parent.findOne({
      email: parent.pendingEmail,
      _id: { $ne: parent._id },
    }).lean();

    if (existingEmail) {
      parent.pendingEmail = null;
      parent.emailVerificationOtpHash = null;
      parent.emailVerificationOtpExpiresAt = null;
      parent.emailVerificationAttempts = 0;
      parent.emailVerificationResendAt = null;
      await parent.save();

      return res.status(409).json({
        success: false,
        message: "This email address is already associated with another account.",
      });
    }

    parent.email = parent.pendingEmail;
    parent.emailVerified = true;
    parent.pendingEmail = null;
    parent.emailVerificationOtpHash = null;
    parent.emailVerificationOtpExpiresAt = null;
    parent.emailVerificationAttempts = 0;
    parent.emailVerificationResendAt = null;

    try {
      await parent.save();
    } catch (saveError) {
      if (saveError.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "This email address is already associated with another account.",
        });
      }
      throw saveError;
    }

    return res.json({
      success: true,
      message: "Recovery email verified and saved successfully.",
      parent: parentResponse(parent),
    });
  } catch (error) {
    console.error("Verify recovery email OTP error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify your email right now.",
    });
  }
});

// GET /api/parents/me
router.get("/me", parentAuthMiddleware, async (req, res) => {
  try {
    const parent = await Parent.findById(req.parent.id)
      .select("name username email emailVerified phone createdAt")
      .lean();

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent account not found.",
      });
    }

    return res.json({ success: true, parent });
  } catch (error) {
    console.error("Parent profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load your profile.",
    });
  }
});

// GET /api/parents/admissions
router.get("/admissions", parentAuthMiddleware, async (req, res) => {
  try {
    const admissions = await Admission.find({
      parentId: req.parent.id,
    })
      .select("_id childName classApplyingFor status createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      admissions: admissions.map((item) => ({
        enquiryId: item._id,
        childName: item.childName,
        classApplyingFor: item.classApplyingFor,
        status: item.status,
        submittedAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Parent admissions error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load your enquiries.",
    });
  }
});

export default router;
