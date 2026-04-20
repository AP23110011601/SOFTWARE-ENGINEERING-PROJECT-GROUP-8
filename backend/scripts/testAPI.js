const mongoose = require("mongoose");
require("dotenv").config();

async function testAPI() {
  try {
    console.log("=== SMART AGRICULTURE API TEST ===\n");
    
    // Test 1: User Registration
    console.log("1. Testing User Registration...");
    const registerResponse = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test Farmer",
        email: "test@farm.com",
        password: "test123",
        phone: "1234567890",
        state: "Test State",
        district: "Test District",
        cropType: "Rice",
        soilType: "Clay",
        landSize: "2 acres"
      })
    });
    
    if (registerResponse.ok) {
      console.log("   Registration: SUCCESS");
    } else {
      const error = await registerResponse.json();
      console.log("   Registration: FAILED -", error.message);
    }
    
    // Test 2: User Login
    console.log("\n2. Testing User Login...");
    const loginResponse = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@farm.com",
        password: "test123"
      })
    });
    
    let token = null;
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      token = loginData.token;
      console.log("   Login: SUCCESS");
      console.log("   User Role:", loginData.user.role);
    } else {
      const error = await loginResponse.json();
      console.log("   Login: FAILED -", error.message);
    }
    
    // Test 3: Admin Login
    console.log("\n3. Testing Admin Login...");
    const adminLoginResponse = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@smartagri.com",
        password: "admin123"
      })
    });
    
    let adminToken = null;
    if (adminLoginResponse.ok) {
      const adminData = await adminLoginResponse.json();
      adminToken = adminData.token;
      console.log("   Admin Login: SUCCESS");
      console.log("   Admin Role:", adminData.user.role);
    } else {
      const error = await adminLoginResponse.json();
      console.log("   Admin Login: FAILED -", error.message);
    }
    
    // Test 4: Sensor Data API (requires user token)
    if (token) {
      console.log("\n4. Testing Sensor Data API...");
      const sensorResponse = await fetch("http://localhost:5000/api/sensor", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (sensorResponse.ok) {
        const sensorData = await sensorResponse.json();
        console.log("   Sensor API: SUCCESS");
        console.log("   Data Points:", sensorData.data.length);
        console.log("   Alerts:", sensorData.alerts.length);
        console.log("   Recommendations:", sensorData.recommendations.length);
      } else {
        const error = await sensorResponse.json();
        console.log("   Sensor API: FAILED -", error.message);
      }
    }
    
    // Test 5: Admin Users API (requires admin token)
    if (adminToken) {
      console.log("\n5. Testing Admin Users API...");
      const adminUsersResponse = await fetch("http://localhost:5000/api/admin/users", {
        headers: {
          "Authorization": `Bearer ${adminToken}`
        }
      });
      
      if (adminUsersResponse.ok) {
        const adminData = await adminUsersResponse.json();
        console.log("   Admin Users API: SUCCESS");
        console.log("   Total Users:", adminData.users.length);
      } else {
        const error = await adminUsersResponse.json();
        console.log("   Admin Users API: FAILED -", error.message);
      }
    }
    
    console.log("\n=== API TEST COMPLETE ===");
    console.log("\nAccess the application at:");
    console.log("Frontend: http://localhost:3002 (or check running port)");
    console.log("Backend: http://localhost:5000");
    
    console.log("\nTest Credentials:");
    console.log("Admin: admin@smartagri.com / admin123");
    console.log("Farmer: ramesh@farm.com / farmer123");
    console.log("New Test: test@farm.com / test123");
    
  } catch (error) {
    console.error("API Test Error:", error.message);
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;
