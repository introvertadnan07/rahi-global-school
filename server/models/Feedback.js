import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    parentName: {
      type: String,
      required: [true, "Parent name is required."],
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    studentClass: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },
    message: {
      type: String,
      required: [true, "Feedback message is required."],
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Feedback ||
  mongoose.model("Feedback", feedbackSchema);
