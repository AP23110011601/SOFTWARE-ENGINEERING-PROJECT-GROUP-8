const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyToken } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const { 
  ValidationError, 
  AuthenticationError, 
  ConflictError, 
  DatabaseError,
  AuthorizationError
} = require("../utils/CustomError");

// REGISTER - Farmer Signup
router.post("/register", asyncHandler(async (req, res, next) => {
  try {
    console.log(" Registration request received:", req.body);

    const {
      name, email, password, phone,
      state, district, cropType,
      soilType, landSize
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !state || !district || !cropType || !soilType || !landSize) {
      throw new ValidationError("All fields are required!");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email format");
    }

    // Validate password strength
    if (password.length < 6) {
      throw new ValidationError("Password must be at least 6 characters long");
    }

    // Check if email already exists (case insensitive)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError("Email already registered!");
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new farmer
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      state,
      district,
      cropType,
      soilType,
      landSize,
      role: "user"
    });

    await newUser.save();
    console.log(" User created successfully:", newUser.email);

    res.status(201).json({ 
      success: true,
      message: " Farmer registered successfully!",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error(" Registration error:", error);
    next(error);
  }
}));

// LOGIN - Farmer + Admin Login
router.post("/login", asyncHandler(async (req, res, next) => {
  try {
    console.log(" Login request received:", req.body.email);

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
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log(" User found:", user ? "Yes" : "No");
    
    if (!user) {
      throw new AuthenticationError("Email not found! Please register first.");
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(" Password match:", isMatch ? "Yes" : "No");
    
    if (!isMatch) {
      throw new AuthenticationError("Wrong password! Please try again.");
    }

    // Check if JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      console.error(" JWT_SECRET is not defined in environment variables!");
      throw new DatabaseError("Server configuration error");
    }

    // Create token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log(" Login successful for:", user.email);

    res.json({
      success: true,
      message: " Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        cropType: user.cropType,
        soilType: user.soilType
      }
    });

  } catch (error) {
    console.error(" Login error:", error);
    next(error);
  }
}));

// TEST ROUTE - Check if user exists (for debugging)
router.post("/check-user", asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new ValidationError("Email is required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      res.json({ 
        success: true,
        exists: true, 
        email: user.email, 
        role: user.role 
      });
    } else {
      res.json({ 
        success: true,
        exists: false 
      });
    }
  } catch (error) {
    console.error(" Check user error:", error);
    next(error);
  }
}));

// GET ALL USERS (Admin only)
router.get("/users", verifyToken, asyncHandler(async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      throw new AuthorizationError("Access denied. Admin only.");
    }

    const users = await User.find({}, "-password"); // Exclude password
    
    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error(" Get users error:", error);
    next(error);
  }
}));

module.exports = router;
