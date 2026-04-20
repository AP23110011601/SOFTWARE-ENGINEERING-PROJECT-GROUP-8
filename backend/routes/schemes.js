const express = require("express");
const router = express.Router();
const Scheme = require("../models/Scheme");
const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, async (req, res) => {
  try {
    const schemes = await Scheme.find({ active: true }).sort({ createdAt: -1 });
    res.json({ success: true, schemes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching schemes", error: error.message });
  }
});

module.exports = router;
