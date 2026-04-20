const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

async function debugLogin() {
  try {
    console.log("=== LOGIN DEBUG ===\n");
    
    // Connect to DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    
    // Check all users in database
    const allUsers = await User.find({});
    console.log("Total users in database:", allUsers.length);
    
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    // Test specific email
    const testEmail = "dineshsatyavardhan_vipparthi@srmap.edu.in";
    console.log(`\nTesting email: ${testEmail}`);
    
    // Try different search methods
    const user1 = await User.findOne({ email: testEmail });
    console.log("Direct search:", user1 ? "Found" : "Not found");
    
    const user2 = await User.findOne({ email: testEmail.toLowerCase() });
    console.log("Lowercase search:", user2 ? "Found" : "Not found");
    
    const user3 = await User.findOne({ email: { $regex: new RegExp(`^${testEmail}$`, 'i') } });
    console.log("Regex search:", user3 ? "Found" : "Not found");
    
    // Test login API directly
    console.log("\nTesting login API...");
    const loginResponse = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: testEmail,
        password: "1234"
      })
    });
    
    console.log("Login API Status:", loginResponse.status);
    const loginData = await loginResponse.text();
    console.log("Login API Response:", loginData);
    
  } catch (error) {
    console.error("Debug Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

debugLogin();
