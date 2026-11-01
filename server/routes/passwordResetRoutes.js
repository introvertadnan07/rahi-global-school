import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
import twilio from "twilio";
import Parent from "../models/Parent.js";

const router = express.Router();

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Try again later." },
});

const genericMessage = "If the account and recovery method are eligible, an OTP will be sent.";

function hashValue(value) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured.");
  return crypto.createHash("sha256").update(`${value}:${process.env.JWT_SECRET}`).digest("hex");
}

function safeEqual(a, b) {
  const first = Buffer.from(a);
  const second = Buffer.from(b);
  return first.length === second.length && crypto.timingSafeEqual(first, second);
}

function normalizeIndianPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  const mobile = digits.length === 10 ? digits : digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : "";

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    throw new Error("Invalid Indian mobile number.");
  }

  return `+91${mobile}`;
}

async function findParent(identifier) {
  const value = identifier.trim();
  return Parent.findOne({
    $or: [{ phone: value }, { username: value.toLowerCase() }],
  }).select("+passwordResetOtpHash +passwordResetTokenHash");
}

async function sendEmailOtp(parent, otp) {
  if (!parent.email || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("Registered email or SMTP configuration is missing.");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: parent.email,
    subject: "Rahi Global School - Password Reset OTP",
    text: `Your password reset OTP is ${otp}. It expires in 5 minutes. Do not share this code.`,
  });
}

async function sendSmsOtp(parent, otp) {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  await client.messages.create({
    body: `Rahi Global School password reset OTP: ${otp}. Valid for 5 minutes. Do not share it.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: normalizeIndianPhone(parent.phone),
  });
}

router.post("/forgot-password", otpLimiter, async (req, res) => {
  try {
    const { identifier, method } = req.body;

    if (typeof identifier !== "string" || !identifier.trim() || identifier.length > 254 || !["email", "sms"].includes(method)) {
      return res.status(400).json({ success: false, message: "Enter valid account details and recovery method." });
    }

    const parent = await findParent(identifier);
    if (!parent) return res.json({ success: true, message: genericMessage });

    const destination = method === "email" ? parent.email : parent.phone;
    if (!destination) return res.json({ success: true, message: genericMessage });

    if (method === "email" && parent.emailVerified !== true) {
      return res.json({ success: true, message: genericMessage });
    }

    if (parent.passwordResetResendAt && parent.passwordResetResendAt > new Date()) {
      return res.status(429).json({ success: false, message: "Please wait before requesting another OTP." });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    parent.passwordResetOtpHash = hashValue(otp);
    parent.passwordResetOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    parent.passwordResetAttempts = 0;
    parent.passwordResetResendAt = new Date(Date.now() + 60 * 1000);
    parent.passwordResetTokenHash = null;
    parent.passwordResetTokenExpiresAt = null;
    await parent.save();

    try {
      if (method === "email") await sendEmailOtp(parent, otp);
      else await sendSmsOtp(parent, otp);
    } catch (deliveryError) {
      parent.passwordResetOtpHash = null;
      parent.passwordResetOtpExpiresAt = null;
      parent.passwordResetResendAt = null;
      await parent.save();

      console.error("Password reset delivery failed:", deliveryError.message);
      return res.status(503).json({ success: false, message: "OTP delivery failed. Check recovery details and try again later." });
    }

    return res.json({ success: true, message: genericMessage });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to process your request right now." });
  }
});

router.post("/verify-otp", otpLimiter, async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    if (typeof identifier !== "string" || typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ success: false, message: "Enter a valid six-digit OTP." });
    }

    const parent = await findParent(identifier);

    if (!parent || !parent.passwordResetOtpHash || !parent.passwordResetOtpExpiresAt || parent.passwordResetOtpExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "OTP is invalid or expired. Request a new OTP." });
    }

    if (parent.passwordResetAttempts >= 5) {
      return res.status(429).json({ success: false, message: "Too many incorrect attempts. Request a new OTP." });
    }

    parent.passwordResetAttempts += 1;
    await parent.save();

    if (!safeEqual(hashValue(otp), parent.passwordResetOtpHash)) {
      return res.status(400).json({ success: false, message: "Incorrect OTP." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    parent.passwordResetTokenHash = hashValue(resetToken);
    parent.passwordResetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    parent.passwordResetOtpHash = null;
    parent.passwordResetOtpExpiresAt = null;
    parent.passwordResetAttempts = 0;
    parent.passwordResetResendAt = null;
    await parent.save();

    return res.json({ success: true, message: "OTP verified. You can now reset your password.", resetToken });
  } catch (error) {
    console.error("OTP verification error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to verify OTP right now." });
  }
});

router.post("/reset-password", otpLimiter, async (req, res) => {
  try {
    const { identifier, resetToken, newPassword } = req.body;

    if (typeof identifier !== "string" || typeof resetToken !== "string" || typeof newPassword !== "string" || newPassword.length < 8 || newPassword.length > 12) {
      return res.status(400).json({ success: false, message: "Enter a valid reset token and password of 8-12 characters." });
    }

    const parent = await findParent(identifier);

    if (!parent || !parent.passwordResetTokenHash || !parent.passwordResetTokenExpiresAt || parent.passwordResetTokenExpiresAt < new Date() || !safeEqual(hashValue(resetToken), parent.passwordResetTokenHash)) {
      return res.status(400).json({ success: false, message: "Password reset session is invalid or expired. Verify OTP again." });
    }

    parent.passwordHash = await bcrypt.hash(newPassword, 12);
    parent.passwordResetTokenHash = null;
    parent.passwordResetTokenExpiresAt = null;
    parent.passwordResetOtpHash = null;
    parent.passwordResetOtpExpiresAt = null;
    parent.passwordResetAttempts = 0;
    parent.passwordResetResendAt = null;
    await parent.save();

    return res.json({ success: true, message: "Password reset successful. Please log in with your new password." });
  } catch (error) {
    console.error("Password reset error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to reset your password right now." });
  }
});

export default router;
