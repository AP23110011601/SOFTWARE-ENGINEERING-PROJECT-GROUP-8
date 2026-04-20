const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/../.env" });
const Sensor = require("../models/Sensor");
const User = require("../models/User");

const seedSensors = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for Seeding.");

    // Find any user
    let user = await User.findOne({ role: "user" });
    if (!user) {
      console.log("No user found! Creating a dummy user.");
      user = await User.create({
        name: "Dummy Farmer",
        email: "farmer@example.com",
        password: "password123",
        role: "user"
      });
    }

    console.log(`Using User ID: ${user._id}`);

    const dummyData = [];
    let baseTime = new Date();
    baseTime.setHours(baseTime.getHours() - 100); // Start 100 hours ago

    for (let i = 0; i < 100; i++) {
      dummyData.push({
        userId: user._id,
        moisture_zone1: Math.floor(Math.random() * (80 - 30 + 1) + 30),
        moisture_zone2: Math.floor(Math.random() * (80 - 30 + 1) + 30),
        moisture_zone3: Math.floor(Math.random() * (80 - 30 + 1) + 30),
        moisture_zone4: Math.floor(Math.random() * (80 - 30 + 1) + 30),
        ph: (Math.random() * (8.5 - 5.5) + 5.5).toFixed(1),
        isRaining: Math.random() > 0.8, // 20% chance of rain
        tankLevel: Math.floor(Math.random() * (100 - 10 + 1) + 10),
        airTemperature: Math.floor(Math.random() * (40 - 15 + 1) + 15),
        airHumidity: Math.floor(Math.random() * (90 - 40 + 1) + 40),
        soilTemperature: Math.floor(Math.random() * (35 - 12 + 1) + 12),
        createdAt: new Date(baseTime.getTime() + i * 3600000), // Increments of 1 hour
      });
    }

    await Sensor.insertMany(dummyData);
    console.log("100 Dummy Sensor Records inserted successfully!");

    process.exit();
  } catch (err) {
    console.error("Error seeding DB:", err);
    process.exit(1);
  }
};

seedSensors();
