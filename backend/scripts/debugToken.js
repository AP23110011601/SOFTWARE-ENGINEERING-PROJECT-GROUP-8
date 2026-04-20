const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

async function debugToken() {
  try {
    console.log("=== TOKEN DEBUG ===\n");
    
    // Check JWT_SECRET
    console.log("JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "NOT SET");
    
    // Connect to DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    
    // Find test user
    const user = await User.findOne({ email: "test@farm.com" });
    if (!user) {
      console.log("Test user not found");
      return;
    }
    
    console.log("Found user:", user.email);
    console.log("User ID:", user._id);
    
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
    
    console.log("Generated Token:", token.substring(0, 50) + "...");
    
    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token Verification: SUCCESS");
      console.log("Decoded ID:", decoded.id);
      console.log("Decoded Role:", decoded.role);
    } catch (error) {
      console.log("Token Verification: FAILED -", error.message);
    }
    
    // Test API call with token
    console.log("\nTesting API call...");
    const response = await fetch("http://localhost:5000/api/sensor", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    console.log("API Response Status:", response.status);
    const responseText = await response.text();
    console.log("API Response:", responseText.substring(0, 200));
    
  } catch (error) {
    console.error("Debug Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

debugToken();
