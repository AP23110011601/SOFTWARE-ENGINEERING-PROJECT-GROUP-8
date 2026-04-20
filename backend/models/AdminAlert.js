const mongoose = require("mongoose");

const adminAlertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    category: { type: String, default: "general", trim: true },
    targetType: {
      type: String,
      enum: ["all", "user"],
      default: "all",
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    /** @deprecated Use adminResolved — kept for older records */
    resolved: { type: Boolean, default: false },
    /** Dismissed on the admin panel (applies to all users) */
    adminResolved: { type: Boolean, default: false },
    adminResolvedAt: { type: Date, default: null },
    /** Per-farmer dismissals on the user Alerts page */
    resolvedByUsers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        resolvedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminAlert", adminAlertSchema);
