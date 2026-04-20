const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const rateLimit = require("express-rate-limit");
const { 
  ValidationError, 
  AuthenticationError, 
  ConflictError, 
  DatabaseError 
} = require("../utils/CustomError");

// Rate limiting for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Too many login attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper function for password validation
const validatePasswordStrength = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return "Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character (@$!%*?&)";
  }
  return null;
};

// Helper function for phone validation
const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    return "Phone number must be exactly 10 digits";
  }
  return null;
};

// ✅ REGISTER - Farmer Signup (Fixed)
router.post("/register", asyncHandler(async (req, res) => {
  console.log("📝 Registration request received:", { 
    ...req.body, 
    password: "[HIDDEN]" 
  });

  const {
    name, email, password, phone,
    state, district, cropType,
    soilType, landSize
  } = req.body;

  // Validate required fields
  const requiredFields = { name, email, password, phone, state, district, cropType, soilType, landSize };
  const missingFields = Object.entries(requiredFields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    throw new ValidationError(`Missing required fields: ${missingFields.join(", ")}`);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format");
  }

  // Validate phone number
  const phoneError = validatePhoneNumber(phone);
  if (phoneError) {
    throw new ValidationError(phoneError);
  }

  // Validate password strength
  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    throw new ValidationError(passwordError);
  }

  // Validate landSize is positive number
  if (isNaN(landSize) || landSize <= 0) {
    throw new ValidationError("Land size must be a positive number");
  }

  // Check if email already exists (case insensitive)
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ConflictError("Email already registered! Please use a different email or login.");
  }

  // Check if phone already exists
  const existingPhone = await User.findOne({ phone });
  if (existingPhone) {
    throw new ConflictError("Phone number already registered!");
  }

  // Encrypt password
  const salt = await bcrypt.genSalt(12); // Increased from 10 to 12 for better security
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new farmer
  const newUser = new User({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    phone: phone.trim(),
    state: state.trim(),
    district: district.trim(),
    cropType: cropType.trim(),
    soilType: soilType.trim(),
    landSize: parseFloat(landSize),
    role: "user",
    createdAt: new Date(),
    isActive: true
  });

  await newUser.save();
  console.log("✅ User created successfully:", newUser.email);

  // Generate token for auto-login after registration
  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET is not defined!");
    throw new DatabaseError("Server configuration error");
  }

  const token = jwt.sign(
    { 
      id: newUser._id, 
      role: newUser.role,
      email: newUser.email 
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(201).json({ 
    success: true,
    message: "✅ Farmer registered successfully!",
    token, // Optional: auto-login after registration
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      cropType: newUser.cropType,
      soilType: newUser.soilType
    }
  });
}));

// ✅ LOGIN - Farmer + Admin Login (Fixed with rate limiting)
router.post("/login", loginLimiter, asyncHandler(async (req, res) => {
  console.log("🔐 Login request received for:", req.body.email);

  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new ValidationError("Email and password are required!");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format");
  }

  // Find user (case insensitive email)
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  console.log("🔍 User found:", user ? "Yes" : "No");
  
  if (!user) {
    throw new AuthenticationError("Email not found! Please register first.");
  }

  // Check if account is active
  if (user.isActive === false) {
    throw new AuthenticationError("Account is deactivated. Please contact support.");
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  console.log("🔑 Password match:", isMatch ? "Yes" : "No");
  
  if (!isMatch) {
    // Increment failed login attempts (optional feature)
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (user.failedLoginAttempts >= 5) {
      user.isActive = false;
      await user.save();
      throw new AuthenticationError("Account locked due to multiple failed attempts. Contact support.");
    }
    await user.save();
    throw new AuthenticationError("Wrong password! Please try again.");
  }

  // Reset failed login attempts on successful login
  user.failedLoginAttempts = 0;
  user.lastLoginAt = new Date();
  await user.save();

  // Check if JWT_SECRET is defined
  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET is not defined in environment variables!");
    throw new DatabaseError("Server configuration error. Please contact administrator.");
  }

  // Create token with more secure options
  const token = jwt.sign(
    { 
      id: user._id, 
      role: user.role,
      email: user.email,
      name: user.name
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: "7d",
      issuer: "farmers-market",
      audience: "farmers-app"
    }
  );

  console.log("✅ Login successful for:", user.email);

  // Return user data (excluding sensitive info)
  res.json({
    success: true,
    message: "✅ Login successful!",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      cropType: user.cropType,
      soilType: user.soilType,
      landSize: user.landSize,
      state: user.state,
      district: user.district
    }
  });
}));

// ✅ GET CURRENT USER (Protected route - Fixed)
router.get("/me", verifyToken, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    throw new AuthenticationError("User not found");
  }
  
  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      cropType: user.cropType,
      soilType: user.soilType,
      landSize: user.landSize,
      state: user.state,
      district: user.district
    }
  });
}));

// ✅ GET ALL USERS (Admin only - Fixed with proper middleware)
router.get("/users", verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  const users = await User.find({}, "-password -__v");
  res.json({
    success: true,
    count: users.length,
    users
  });
}));

// ✅ GET USER BY ID (Admin only - New route)
router.get("/users/:id", verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password -__v");
  if (!user) {
    throw new ValidationError("User not found");
  }
  res.json({
    success: true,
    user
  });
}));

// ✅ UPDATE USER (Protected route - Fixed)
router.put("/update", verifyToken, asyncHandler(async (req, res) => {
  const updates = req.body;
  const allowedUpdates = ["name", "phone", "cropType", "soilType", "landSize", "state", "district"];
  
  const filteredUpdates = {};
  for (const key of allowedUpdates) {
    if (updates[key] !== undefined) {
      filteredUpdates[key] = updates[key];
    }
  }
  
  // Validate phone if being updated
  if (filteredUpdates.phone) {
    const phoneError = validatePhoneNumber(filteredUpdates.phone);
    if (phoneError) {
      throw new ValidationError(phoneError);
    }
    
    // Check if phone is taken by another user
    const existingPhone = await User.findOne({ 
      phone: filteredUpdates.phone,
      _id: { $ne: req.user.id }
    });
    if (existingPhone) {
      throw new ConflictError("Phone number already in use by another account");
    }
  }
  
  const user = await User.findByIdAndUpdate(
    req.user.id,
    filteredUpdates,
    { new: true, runValidators: true }
  ).select("-password");
  
  if (!user) {
    throw new AuthenticationError("User not found");
  }
  
  res.json({
    success: true,
    message: "Profile updated successfully",
    user
  });
}));

// ✅ CHANGE PASSWORD (Protected route - New)
router.post("/change-password", verifyToken, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    throw new ValidationError("Current password and new password are required");
  }
  
  // Validate new password strength
  const passwordError = validatePasswordStrength(newPassword);
  if (passwordError) {
    throw new ValidationError(passwordError);
  }
  
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AuthenticationError("User not found");
  }
  
  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new AuthenticationError("Current password is incorrect");
  }
  
  // Hash new password
  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();
  
  res.json({
    success: true,
    message: "Password changed successfully"
  });
}));

// ✅ TEST ROUTE - Check if user exists (for debugging) - Fixed
router.post("/check-user", asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    throw new ValidationError("Email is required");
  }
  
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  
  if (user) {
    res.json({ 
      exists: true, 
      email: user.email, 
      role: user.role,
      isActive: user.isActive
    });
  } else {
    res.json({ exists: false });
  }
}));

// ✅ LOGOUT (Clear token on client side - New)
router.post("/logout", verifyToken, asyncHandler(async (req, res) => {
  // Client should discard the token
  // Optionally add token to blacklist if implementing token blacklisting
  res.json({
    success: true,
    message: "Logged out successfully"
  });
}));

module.exports = router;