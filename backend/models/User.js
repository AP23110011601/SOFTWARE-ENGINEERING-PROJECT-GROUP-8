const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  cropType: { type: String, required: true },
  soilType: { type: String, required: true },
  landSize: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  active: { type: Boolean, default: true },
  lastLogin: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);