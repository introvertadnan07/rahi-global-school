import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import mongoose from "mongoose";

import admissionRoutes from "./routes/admissionRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import parentRoutes from "./routes/parentRoutes.js";
import passwordResetRoutes from "./routes/passwordResetRoutes.js";

import feedbackRoutes from "./routes/feedbackRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow the local Vite frontend ports
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header, such as PowerShell health checks
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
  })
);

app.use(express.json({ limit: "10kb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Rahi Global School backend is running!",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

// API routes
app.use("/api/admissions", admissionRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/parents/password", passwordResetRoutes);
app.use("/api/feedback", feedbackRoutes);

// Connect database before starting the server
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from server/.env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Startup error:", error.message);
    process.exit(1);
  }
}

startServer();


