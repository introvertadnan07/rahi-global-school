
import express from "express";
import Contact from "../models/Contact.js";

const router = express.Router();

// POST /api/contact
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (
      !name?.trim() ||
      !email?.trim() ||
      !message?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required.",
      });
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Save message to MongoDB
    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || "",
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been submitted successfully!",
      contactId: contact._id,
    });
  } catch (error) {
    console.error("Contact submission error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Please check the details you entered.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to send your message. Please try again.",
    });
  }
});

export default router;
