import mongoose from "mongoose";

const admissionSchema = new mongoose.Schema(
  {
    enquiryNumber: {
      type: String,
      unique: true,
      sparse: true,
      immutable: true,
      trim: true,
    },

    parentName: {
      type: String,
      required: [true, "Parent name is required"],
      trim: true,
      maxlength: 100,
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parent",
      default: null,
      index: true,
    },

    childName: {
      type: String,
      required: [true, "Child name is required"],
      trim: true,
      maxlength: 100,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[0-9+()\-\\s]{7,20}$/, "Please enter a valid phone number"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
    },

    classApplyingFor: {
      type: String,
      required: [true, "Class applying for is required"],
      trim: true,
      maxlength: 50,
    },

    message: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    status: {
      type: String,
      enum: ["new", "contacted", "completed"],
      default: "new",
    },
  },
  {
    timestamps: true,
  }
);

const Admission = mongoose.model("Admission", admissionSchema);

export default Admission;
