const express = require("express");
const router = express.Router();
const Sensor = require("../models/Sensor");
const { verifyToken } = require("../middleware/auth");
const { loadAdminAlertPayloadForUser } = require("./alerts");

function mergeAdminAlertsIntoSensorAlerts(mappedManualActive, sensorAlertList) {
  const adminAsDashboard = mappedManualActive.map((a) => ({
    type: a.type,
    title: a.title,
    message: a.message,
    source: "admin",
    adminAlertId: a.adminAlertId,
  }));
  return [...adminAsDashboard, ...sensorAlertList];
}

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, precision = 1) =>
  Number((Math.random() * (max - min) + min).toFixed(precision));
const preferMeaningfulNumber = (primary, fallback) => {
  if (typeof primary === "number" && primary > 0) return primary;
  if (typeof fallback === "number") return fallback;
  return 0;
};
const preferBoolean = (primary, fallback) => {
  if (typeof primary === "boolean") return primary;
  if (typeof fallback === "boolean") return fallback;
  return false;
};

const buildRandomSensorData = (userId) => {
  const zone1 = randomInt(10, 80);
  const zone2 = randomInt(10, 80);
  const zone3 = randomInt(10, 80);
  const zone4 = randomInt(10, 80);
  const rain = Math.random() > 0.5;
  const temperature = randomFloat(20, 40, 1);
  const humidity = randomFloat(40, 90, 1);

  return {
    userId,
    zone1,
    zone2,
    zone3,
    zone4,
    moisture_zone1: zone1,
    moisture_zone2: zone2,
    moisture_zone3: zone3,
    moisture_zone4: zone4,
    temperature,
    airTemperature: temperature,
    humidity,
    airHumidity: humidity,
    tankLevel: randomInt(10, 100),
    rain,
    isRaining: rain,
    ph: randomFloat(5.5, 8.5, 1),
    rainfallQuantity: rain ? randomFloat(20, 220, 1) : randomFloat(0, 20, 1),
    nitrogen: randomInt(20, 130),
    phosphorus: randomInt(10, 90),
    potassium: randomInt(10, 90),
    soilTemperature: randomFloat(18, 35, 1)
  };
};

const toLatestPayload = (sensorDoc) => {
  const latest = sensorDoc.toObject ? sensorDoc.toObject() : sensorDoc;
  const z1 = preferMeaningfulNumber(latest.zone1, latest.moisture_zone1);
  const z2 = preferMeaningfulNumber(latest.zone2, latest.moisture_zone2);
  const z3 = preferMeaningfulNumber(latest.zone3, latest.moisture_zone3);
  const z4 = preferMeaningfulNumber(latest.zone4, latest.moisture_zone4);
  const temperature = preferMeaningfulNumber(latest.temperature, latest.airTemperature);
  const humidity = preferMeaningfulNumber(latest.humidity, latest.airHumidity);
  const rain = preferBoolean(latest.rain, latest.isRaining);
  const avgMoisture = (z1 + z2 + z3 + z4) / 4;

  const moistureStatus = avgMoisture < 30 ? "Dry" : avgMoisture <= 60 ? "Normal" : "Wet";
  const irrigationPercent = rain
    ? 0
    : avgMoisture < 30
      ? 50
      : avgMoisture < 50
        ? 30
        : 10;

  const phCategory = latest.ph < 6 ? "acidic" : latest.ph <= 7.5 ? "optimal" : "alkaline";
  const phRecommendation = latest.ph < 6
    ? "Soil is acidic. Consider adding lime to balance pH."
    : latest.ph <= 7.5
      ? "Soil pH is optimal for most crops."
      : "Soil is alkaline. Consider adding sulfur or organic matter.";

  const alerts = [];
  if (avgMoisture < 30) alerts.push({ type: "critical", title: "Low moisture", message: "Average moisture is below 30%." });
  if (z1 < 25) alerts.push({ type: "warning", title: "Zone 1 dry", message: "Zone 1 moisture is below 25%." });
  if (z2 < 25) alerts.push({ type: "warning", title: "Zone 2 dry", message: "Zone 2 moisture is below 25%." });
  if (z3 < 25) alerts.push({ type: "warning", title: "Zone 3 dry", message: "Zone 3 moisture is below 25%." });
  if (z4 < 25) alerts.push({ type: "warning", title: "Zone 4 dry", message: "Zone 4 moisture is below 25%." });
  if (latest.tankLevel < 20) alerts.push({ type: "critical", title: "Tank low", message: "Refill tank immediately." });
  if (temperature > 35) alerts.push({ type: "warning", title: "High temperature", message: "Temperature crossed 35C." });
  if (humidity > 80) alerts.push({ type: "warning", title: "Disease risk", message: "Humidity above 80% increases disease risk." });
  if (rain) alerts.push({ type: "info", title: "Rain detected", message: "Natural irrigation available." });

  return {
    ...latest,
    zone1: z1,
    zone2: z2,
    zone3: z3,
    zone4: z4,
    moisture_zone1: z1,
    moisture_zone2: z2,
    moisture_zone3: z3,
    moisture_zone4: z4,
    temperature,
    humidity,
    rain,
    isRaining: rain,
    avgMoisture: Number(avgMoisture.toFixed(1)),
    moistureStatus,
    irrigation: {
      percent: irrigationPercent,
      message: rain
        ? "Rain detected - irrigation not needed"
        : `Irrigation Required: ${irrigationPercent}%`
    },
    phAnalysis: {
      category: phCategory,
      recommendation: phRecommendation
    },
    alerts
  };
};

// POST - Save sensor data
router.post("/", verifyToken, async (req, res) => {
  try {
    const sensorData = new Sensor({
      userId: req.user.id,
      ...req.body
    });
    await sensorData.save();
    res.status(201).json({ message: "✅ Sensor data saved!" });
  } catch (error) {
    res.status(500).json({ message: "❌ Server error", error });
  }
});

// POST - Generate random dummy sensor data
router.post("/generate", verifyToken, async (req, res) => {
  try {
    const sensorData = new Sensor(buildRandomSensorData(req.user.id));
    await sensorData.save();
    res.status(201).json({
      success: true,
      message: "Dummy sensor data generated successfully",
      latest: toLatestPayload(sensorData)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while generating sensor data", error: error.message });
  }
});

// GET - Latest sensor record
router.get("/latest", verifyToken, async (req, res) => {
  try {
    let latest = await Sensor.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    if (!latest) {
      latest = await new Sensor(buildRandomSensorData(req.user.id)).save();
    }
    const payload = toLatestPayload(latest);
    const { mappedManualActive } = await loadAdminAlertPayloadForUser(req.user._id);
    payload.alerts = mergeAdminAlertsIntoSensorAlerts(mappedManualActive, payload.alerts || []);
    res.json({ success: true, latest: payload });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while fetching latest sensor data", error: error.message });
  }
});

// GET - Sensor dashboard payload
router.get("/", verifyToken, async (req, res) => {
  try {
    let records = await Sensor.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(10);
    if (!records.length) {
      const generated = await new Sensor(buildRandomSensorData(req.user.id)).save();
      records = [generated];
    }

    const latest = toLatestPayload(records[0]);
    const { mappedManualActive } = await loadAdminAlertPayloadForUser(req.user._id);
    const alerts = mergeAdminAlertsIntoSensorAlerts(mappedManualActive, latest.alerts || []);
    latest.alerts = alerts;

    const recommendations = [
      {
        title: "Irrigation Recommendation",
        description: latest.irrigation.message,
        action: latest.irrigation.percent === 0 ? "Pause irrigation" : `Apply ${latest.irrigation.percent}% irrigation`
      },
      {
        title: "Soil pH Analysis",
        description: latest.phAnalysis.recommendation,
        action: latest.phAnalysis.category === "optimal" ? "Maintain current practice" : "Adjust soil chemistry"
      }
    ];

    res.json({
      success: true,
      data: records.map(toLatestPayload),
      latest,
      avgMoisture: latest.avgMoisture,
      alerts,
      recommendations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while fetching sensor dashboard", error: error.message });
  }
});

module.exports = router;