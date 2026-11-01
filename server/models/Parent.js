import mongoose from "mongoose";

const parentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 254,
      sparse: true,
      unique: true,
    },
    emailVerified: { type: Boolean, default: false },
    pendingEmail: { type: String, default: null, lowercase: true, trim: true },
    emailVerificationOtpHash: { type: String, select: false, default: null },
    emailVerificationOtpExpiresAt: { type: Date, default: null },
    emailVerificationAttempts: { type: Number, default: 0 },
    emailVerificationResendAt: { type: Date, default: null },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 20,
    },
    passwordHash: { type: String, required: true, select: false },
    passwordResetOtpHash: { type: String, select: false, default: null },
    passwordResetOtpExpiresAt: { type: Date, default: null },
    passwordResetAttempts: { type: Number, default: 0 },
    passwordResetResendAt: { type: Date, default: null },
    passwordResetTokenHash: { type: String, select: false, default: null },
    passwordResetTokenExpiresAt: { type: Date, default: null },
    role: { type: String, enum: ["parent"], default: "parent", immutable: true },
  },
  { timestamps: true }
);

export default mongoose.model("Parent", parentSchema);
