import express from "express";
import Admission from "../models/Admission.js";
import Counter from "../models/Counter.js";
import Parent from "../models/Parent.js";
import parentAuthMiddleware from "../middleware/parentAuthMiddleware.js";

const router = express.Router();

async function getNextEnquiryNumber() {
  const currentYear = new Date().getFullYear();
  const counterKey = `admission-${currentYear}`;

  const counter = await Counter.findOneAndUpdate(
    { _id: counterKey },
    { $inc: { sequence: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return `RGS-${currentYear}-${String(counter.sequence).padStart(6, "0")}`;
}

async function submitAdmission(req, res) {
  try {
    const {
      parentName,
      childName,
      phone,
      email,
      classApplyingFor,
      message,
    } = req.body;

    const authenticatedParentId = req.parent?.id || null;

    if (
      typeof childName !== "string" ||
      !childName.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof classApplyingFor !== "string" ||
      !classApplyingFor.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required admission fields.",
      });
    }

    const normalizedChildName = childName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedClass = classApplyingFor.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9+()\-\\s]{7,20}$/;

    if (
      normalizedChildName.length > 100 ||
      normalizedEmail.length > 254 ||
      !emailPattern.test(normalizedEmail) ||
      normalizedClass.length > 50 ||
      (message != null &&
        (typeof message !== "string" || message.length > 1000))
    ) {
      return res.status(400).json({
        success: false,
        message: "Please check your admission details.",
      });
    }

    let finalParentName = "";
    let finalPhone = "";
    let parentId = null;

    if (authenticatedParentId) {
      const parent = await Parent.findById(authenticatedParentId)
        .select("name phone")
        .lean();

      if (!parent) {
        return res.status(401).json({
          success: false,
          message: "Parent account not found. Please log in again.",
        });
      }

      finalParentName = parent.name;
      finalPhone = parent.phone;
      parentId = parent._id;
    } else {
      if (
        typeof parentName !== "string" ||
        !parentName.trim() ||
        typeof phone !== "string" ||
        !phonePattern.test(phone.trim())
      ) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid parent name and phone number.",
        });
      }

      finalParentName = parentName.trim();
      finalPhone = phone.trim();

      if (finalParentName.length > 100) {
        return res.status(400).json({
          success: false,
          message: "Parent name is too long.",
        });
      }
    }

    // Allocate the human-readable reference atomically to avoid duplicate IDs
    // when two enquiries arrive at nearly the same time.
    const enquiryNumber = await getNextEnquiryNumber();

    const admission = await Admission.create({
      enquiryNumber,
      parentId,
      parentName: finalParentName,
      phone: finalPhone,
      childName: normalizedChildName,
      email: normalizedEmail,
      classApplyingFor: normalizedClass,
      message: typeof message === "string" ? message.trim() : "",
    });

    return res.status(201).json({
      success: true,
      message: "Admission enquiry submitted successfully!",
      enquiryId: admission.enquiryNumber,
      mongoId: admission._id,
    });
  } catch (error) {
    console.error("Admission submission error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Please check your admission details.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to submit your enquiry. Please try again.",
    });
  }
}

// Public admission enquiry tracking
router.get("/track/:enquiryId", async (req, res) => {
  try {
    const enquiryId = req.params.enquiryId?.trim().toUpperCase();
    const email =
      typeof req.query.email === "string"
        ? req.query.email.trim().toLowerCase()
        : "";

    if (!/^RGS-\d{4}-\d{6}$/.test(enquiryId || "") || !email) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid enquiry ID and registered email.",
      });
    }

    const admission = await Admission.findOne({
      enquiryNumber: enquiryId,
      email,
    })
      .select("enquiryNumber childName classApplyingFor status createdAt")
      .lean();

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: "No enquiry found. Please check your enquiry ID and registered email.",
      });
    }

    return res.status(200).json({
      success: true,
      enquiry: {
        enquiryId: admission.enquiryNumber,
        childName: admission.childName,
        classApplyingFor: admission.classApplyingFor,
        status: admission.status || "new",
        submittedAt: admission.createdAt || null,
      },
    });
  } catch (error) {
    console.error("Admission tracking error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to track your enquiry. Please try again.",
    });
  }
});

// Public website admission enquiry
router.post("/", submitAdmission);

// Authenticated parent portal admission enquiry
router.post("/parent", parentAuthMiddleware, submitAdmission);

export default router;
