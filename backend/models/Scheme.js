const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    link: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Central", "Andhra Pradesh", "Telangana", "Other"],
      default: "Central",
    },
    active: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Scheme", schemeSchema);
