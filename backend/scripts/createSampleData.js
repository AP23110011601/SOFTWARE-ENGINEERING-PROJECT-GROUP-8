const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Sensor = require("../models/Sensor");
require("dotenv").config();

async function createSampleData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = new User({
      name: "System Admin",
      email: "admin@smartagri.com",
      password: adminPassword,
      phone: "9999999999",
      state: "Admin State",
      district: "Admin District",
      cropType: "Mixed",
      soilType: "Loamy",
      landSize: "100 acres",
      role: "admin"
    });
    await admin.save();
    console.log("Admin user created");

    // Create sample farmers
    const farmers = [
      {
        name: "Ramesh Kumar",
        email: "ramesh@farm.com",
        password: await bcrypt.hash("farmer123", 10),
        phone: "9876543210",
        state: "Punjab",
        district: "Ludhiana",
        cropType: "Rice",
        soilType: "Clay",
        landSize: "5 acres",
        role: "user"
      },
      {
        name: "Sita Devi",
        email: "sita@farm.com",
        password: await bcrypt.hash("farmer123", 10),
        phone: "9876543211",
        state: "Uttar Pradesh",
        district: "Varanasi",
        cropType: "Wheat",
        soilType: "Loamy",
        landSize: "3 acres",
        role: "user"
      },
      {
        name: "Mohammed Ali",
        email: "ali@farm.com",
        password: await bcrypt.hash("farmer123", 10),
        phone: "9876543212",
        state: "Gujarat",
        district: "Ahmedabad",
        cropType: "Cotton",
        soilType: "Sandy",
        landSize: "8 acres",
        role: "user"
      }
    ];

    const savedFarmers = await User.insertMany(farmers);
    console.log("Sample farmers created");

    // Create sample sensor data for each farmer
    const sensorDataTemplates = [
      {
        moisture_zone1: 45,
        moisture_zone2: 52,
        moisture_zone3: 38,
        moisture_zone4: 41,
        ph: 6.8,
        isRaining: false,
        tankLevel: 75,
        airTemperature: 32,
        airHumidity: 65,
        soilTemperature: 28
      },
      {
        moisture_zone1: 25,
        moisture_zone2: 22,
        moisture_zone3: 28,
        moisture_zone4: 20,
        ph: 6.2,
        isRaining: false,
        tankLevel: 15,
        airTemperature: 40,
        airHumidity: 85,
        soilTemperature: 38
      },
      {
        moisture_zone1: 65,
        moisture_zone2: 70,
        moisture_zone3: 68,
        moisture_zone4: 72,
        ph: 7.1,
        isRaining: true,
        tankLevel: 90,
        airTemperature: 28,
        airHumidity: 90,
        soilTemperature: 25
      }
    ];

    // Create multiple readings for each farmer
    for (let i = 0; i < savedFarmers.length; i++) {
      const farmer = savedFarmers[i];
      const template = sensorDataTemplates[i];
      
      // Create 5 readings per farmer with slight variations
      for (let j = 0; j < 5; j++) {
        const reading = new Sensor({
          userId: farmer._id,
          moisture_zone1: template.moisture_zone1 + Math.random() * 10 - 5,
          moisture_zone2: template.moisture_zone2 + Math.random() * 10 - 5,
          moisture_zone3: template.moisture_zone3 + Math.random() * 10 - 5,
          moisture_zone4: template.moisture_zone4 + Math.random() * 10 - 5,
          ph: template.ph + Math.random() * 0.4 - 0.2,
          isRaining: Math.random() > 0.7,
          tankLevel: Math.max(5, Math.min(100, template.tankLevel + Math.random() * 20 - 10)),
          airTemperature: Math.max(20, Math.min(45, template.airTemperature + Math.random() * 6 - 3)),
          airHumidity: Math.max(40, Math.min(95, template.airHumidity + Math.random() * 10 - 5)),
          soilTemperature: Math.max(20, Math.min(40, template.soilTemperature + Math.random() * 4 - 2)),
          createdAt: new Date(Date.now() - (j * 2 * 60 * 60 * 1000)) // 2 hours apart
        });
        await reading.save();
      }
    }

    console.log("Sample sensor data created");

    console.log("\n=== SAMPLE DATA CREATED ===");
    console.log("\nLogin Credentials:");
    console.log("Admin: admin@smartagri.com / admin123");
    console.log("Farmer 1: ramesh@farm.com / farmer123");
    console.log("Farmer 2: sita@farm.com / farmer123");
    console.log("Farmer 3: ali@farm.com / farmer123");
    
    console.log("\nTest the system at:");
    console.log("Frontend: http://localhost:3000");
    console.log("Backend: http://localhost:5000");

  } catch (error) {
    console.error("Error creating sample data:", error);
  } finally {
    await mongoose.disconnect();
  }
}

createSampleData();
