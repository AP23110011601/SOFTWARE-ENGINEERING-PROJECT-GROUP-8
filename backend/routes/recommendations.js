const express = require("express");
const router = express.Router();
const Sensor = require("../models/Sensor");
const User = require("../models/User");
const { verifyToken } = require("../middleware/auth");
const { generateAlerts } = require("./alerts");

// Recommendation rules based on crop type + soil + sensor data
function generateRecommendations(sensor, user) {
  const recs = [];
  const crop = (user.cropType || "").toLowerCase();
  const soil = (user.soilType || "").toLowerCase();

  // --- Watering recommendations ---
  if (sensor.moisture < 30) {
    recs.push({
      category: "irrigation",
      priority: "high",
      action: "Water your crops now",
      reason: `Soil moisture is ${sensor.moisture}% — below safe level of 30%`,
    });
  } else if (sensor.moisture >= 30 && sensor.moisture <= 60) {
    recs.push({
      category: "irrigation",
      priority: "low",
      action: "Soil moisture is good",
      reason: `Moisture at ${sensor.moisture}% — no irrigation needed`,
    });
  } else if (sensor.moisture > 60) {
    recs.push({
      category: "irrigation",
      priority: "medium",
      action: "Reduce watering",
      reason: `Soil moisture is ${sensor.moisture}% — risk of root rot`,
    });
  }

  // --- Temperature recommendations ---
  if (sensor.temperature > 35) {
    recs.push({
      category: "temperature",
      priority: "high",
      action: "Provide shade and increase irrigation",
      reason: `Temperature ${sensor.temperature}°C is above safe range — causes crop stress`,
    });
  } else if (sensor.temperature < 10) {
    recs.push({
      category: "temperature",
      priority: "medium",
      action: "Protect crops from cold",
      reason: `Temperature ${sensor.temperature}°C — frost risk for sensitive crops`,
    });
  } else {
    recs.push({
      category: "temperature",
      priority: "low",
      action: "Temperature is optimal",
      reason: `${sensor.temperature}°C is within safe growing range`,
    });
  }

  // --- Humidity / Disease recommendations ---
  if (sensor.humidity > 80) {
    recs.push({
      category: "disease",
      priority: "high",
      action: "Monitor for fungal disease",
      reason: `Humidity at ${sensor.humidity}% — high risk of blight and mold`,
    });
  }

  // --- Crop-specific recommendations ---
  if (crop.includes("rice") || crop.includes("paddy")) {
    if (sensor.moisture < 50) {
      recs.push({
        category: "crop_specific",
        priority: "high",
        action: "Rice needs more water",
        reason: "Rice requires high soil moisture (50–80%) for proper growth",
      });
    }
  }

  if (crop.includes("wheat")) {
    if (sensor.temperature > 30) {
      recs.push({
        category: "crop_specific",
        priority: "medium",
        action: "Wheat heat stress — irrigate in evening",
        reason: "Wheat grows best below 30°C — irrigate during cooler hours",
      });
    }
  }

  if (crop.includes("tomato")) {
    if (sensor.humidity > 75) {
      recs.push({
        category: "crop_specific",
        priority: "high",
        action: "Check tomatoes for early blight",
        reason: "Tomatoes are very prone to fungal disease in high humidity",
      });
    }
  }

  // --- Soil-specific recommendations ---
  if (soil.includes("sandy") && sensor.moisture < 40) {
    recs.push({
      category: "soil",
      priority: "medium",
      action: "Sandy soil drains fast — irrigate more frequently",
      reason: "Sandy soil loses moisture quickly — needs frequent watering",
    });
  }

  if (soil.includes("clay") && sensor.moisture > 70) {
    recs.push({
      category: "soil",
      priority: "medium",
      action: "Clay soil is waterlogged — stop irrigation",
      reason: "Clay retains water — over-irrigation causes root suffocation",
    });
  }

  return recs;
}

// GET /api/recommendations
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const latest = await Sensor.findOne({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    if (!latest) {
      return res.json({
        recommendations: [],
        message: "No sensor data yet",
      });
    }

    const recommendations = generateRecommendations(latest, user);
    const alerts = generateAlerts(latest);

    res.json({
      recommendations,
      alerts,
      cropType: user.cropType,
      soilType: user.soilType,
      sensorData: {
        moisture: latest.moisture,
        temperature: latest.temperature,
        humidity: latest.humidity,
        recordedAt: latest.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;