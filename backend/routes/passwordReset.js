const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const User = require("../models/User");
const { verifyToken } = require("../middleware/auth");

// Generate secure reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Store reset tokens (in production, use Redis or database)
const resetTokens = new Map();

// POST /forgot-password - Send reset link
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "Email address is required" 
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "No account found with this email address" 
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const expiryTime = Date.now() + 3600000; // 1 hour expiry
    
    // Store token (in production, store in database with expiry)
    resetTokens.set(resetToken, {
      userId: user._id,
      email: user.email,
      expiry: expiryTime
    });

    console.log("🔐 Password reset requested for:", email);

    // In production, send email with reset link
    // For demo, we'll just return the token
    const resetLink = `http://localhost:3003/reset-password?token=${resetToken}`;
    
    res.json({
      success: true,
      message: `Password reset link sent to ${email}`,
      resetToken: resetToken, // Only for demo purposes
      resetLink: resetLink, // Only for demo purposes
      instructions: "Check your email for the reset link. The link will expire in 1 hour."
    });

  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again.",
      error: error.message 
    });
  }
});

// POST /reset-password - Reset password with token
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Reset token and new password are required" 
      });
    }

    // Validate token
    const tokenData = resetTokens.get(token);
    if (!tokenData) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid or expired reset token" 
      });
    }

    // Check token expiry
    if (Date.now() > tokenData.expiry) {
      resetTokens.delete(token);
      return res.status(400).json({ 
        success: false,
        message: "Reset token has expired. Please request a new one." 
      });
    }

    // Find user
    const user = await User.findById(tokenData.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Hash new password
    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    await User.findByIdAndUpdate(user._id, { 
      password: hashedPassword 
    });

    // Clean up token
    resetTokens.delete(token);

    console.log("✅ Password reset successful for:", tokenData.email);

    res.json({
      success: true,
      message: "Password reset successfully. You can now login with your new password."
    });

  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again.",
      error: error.message 
    });
  }
});

// GET /reset-password - Verify token and show reset form
router.get("/reset-password", async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ 
        success: false,
        message: "Reset token is required" 
      });
    }

    // Validate token
    const tokenData = resetTokens.get(token);
    if (!tokenData) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid or expired reset token" 
      });
    }

    // Check token expiry
    if (Date.now() > tokenData.expiry) {
      resetTokens.delete(token);
      return res.status(400).json({ 
        success: false,
        message: "Reset token has expired. Please request a new one." 
      });
    }

    // Find user
    const user = await User.findById(tokenData.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    console.log("🔑 Valid reset token accessed for:", tokenData.email);

    res.json({
      success: true,
      message: "Reset token is valid",
      email: tokenData.email,
      token: token
    });

  } catch (error) {
    console.error("❌ Verify reset token error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error.",
      error: error.message 
    });
  }
});

module.exports = router;
