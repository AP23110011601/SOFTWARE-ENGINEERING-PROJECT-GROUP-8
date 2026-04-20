const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { verifyToken } = require("../middleware/auth");

// PUT /update-profile - Update user profile
router.put("/update-profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, state, district, cropType, soilType, landSize } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Update user fields
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (state) updateData.state = state;
    if (district) updateData.district = district;
    if (cropType) updateData.cropType = cropType;
    if (soilType) updateData.soilType = soilType;
    if (landSize) updateData.landSize = landSize;

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      updateData, 
      { new: true }
    );

    console.log("✅ Profile updated for:", updatedUser.email);

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        state: updatedUser.state,
        district: updatedUser.district,
        cropType: updatedUser.cropType,
        soilType: updatedUser.soilType,
        landSize: updatedUser.landSize
      }
    });

  } catch (error) {
    console.error("❌ Profile update error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again.",
      error: error.message 
    });
  }
});

// PUT /change-password - Change user password
router.put("/change-password", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Current password and new password are required" 
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: "Current password is incorrect" 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    await User.findByIdAndUpdate(userId, { 
      password: hashedPassword 
    });

    console.log("✅ Password changed for:", user.email);

    res.json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error("❌ Password change error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again.",
      error: error.message 
    });
  }
});

// GET /profile - Get user profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find user
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    console.log("✅ Profile fetched for:", user.email);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        state: user.state,
        district: user.district,
        cropType: user.cropType,
        soilType: user.soilType,
        landSize: user.landSize,
        role: user.role,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error("❌ Profile fetch error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again.",
      error: error.message 
    });
  }
});

module.exports = router;
