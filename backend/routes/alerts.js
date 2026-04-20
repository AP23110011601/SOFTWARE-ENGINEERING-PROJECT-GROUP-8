const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Sensor = require("../models/Sensor");
const AdminAlert = require("../models/AdminAlert");
const { verifyToken } = require("../middleware/auth");

const pickNumber = (primary, fallback) => {
  if (typeof primary === "number" && !Number.isNaN(primary)) return primary;
  if (typeof fallback === "number" && !Number.isNaN(fallback)) return fallback;
  return 0;
};

const pickBoolean = (primary, fallback) => {
  if (typeof primary === "boolean") return primary;
  if (typeof fallback === "boolean") return fallback;
  return false;
};

// Helper function — generates alerts from latest sensor reading
function generateAlerts(latest) {
  const zone1 = pickNumber(latest.zone1, latest.moisture_zone1);
  const zone2 = pickNumber(latest.zone2, latest.moisture_zone2);
  const zone3 = pickNumber(latest.zone3, latest.moisture_zone3);
  const zone4 = pickNumber(latest.zone4, latest.moisture_zone4);
  const temperature = pickNumber(latest.temperature, latest.airTemperature);
  const humidity = pickNumber(latest.humidity, latest.airHumidity);
  const rain = pickBoolean(latest.rain, latest.isRaining);
  const tankLevel = pickNumber(latest.tankLevel, 0);
  const avgMoisture = Number(((zone1 + zone2 + zone3 + zone4) / 4).toFixed(1));

  const alerts = [];

  if (avgMoisture < 30) {
    alerts.push({
      type: "critical",
      severity: "high",
      title: "Low moisture",
      message: "Average moisture is below 30%.",
      detail: "Irrigation needed urgently.",
    });
  } else if (avgMoisture > 60) {
    alerts.push({
      type: "info",
      severity: "low",
      title: "High moisture",
      message: "Soil moisture is in wet range.",
      detail: "Reduce irrigation to avoid over-watering.",
    });
  }

  if (zone1 < 25) alerts.push({ type: "warning", severity: "medium", title: "Zone 1 dry", message: "Zone 1 moisture is below 25%." });
  if (zone2 < 25) alerts.push({ type: "warning", severity: "medium", title: "Zone 2 dry", message: "Zone 2 moisture is below 25%." });
  if (zone3 < 25) alerts.push({ type: "warning", severity: "medium", title: "Zone 3 dry", message: "Zone 3 moisture is below 25%." });
  if (zone4 < 25) alerts.push({ type: "warning", severity: "medium", title: "Zone 4 dry", message: "Zone 4 moisture is below 25%." });

  if (tankLevel < 20) {
    alerts.push({
      type: "critical",
      severity: "high",
      title: "Tank low",
      message: "Refill tank immediately.",
      detail: "Water tank level is below 20%.",
    });
  }

  if (humidity > 80) {
    alerts.push({
      type: "warning",
      severity: "high",
      title: "Disease risk",
      message: "Humidity above 80% increases disease risk.",
      detail: "Monitor crops for fungal infections.",
    });
  }

  if (temperature > 35) {
    alerts.push({
      type: "warning",
      severity: "high",
      title: "High temperature",
      message: "Temperature crossed 35C.",
      detail: "Provide shade and optimize watering schedule.",
    });
  } else if (temperature < 10) {
    alerts.push({
      type: "warning",
      severity: "medium",
      title: "Low temperature",
      message: "Temperature is very low.",
      detail: "Protect frost-sensitive crops.",
    });
  }

  if (rain) {
    alerts.push({
      type: "info",
      severity: "low",
      title: "Rain detected",
      message: "Natural irrigation available.",
      detail: "Irrigation may be paused.",
    });
  }

  return alerts;
}

const mapAdminAlertForUser = (a) => ({
  adminAlertId: String(a._id),
  type: a.priority === "high" ? "critical" : a.priority === "medium" ? "warning" : "info",
  severity: a.priority,
  title: a.title,
  message: a.message,
  category: a.category,
  source: "admin",
  createdAt: a.createdAt,
  updatedAt: a.updatedAt,
});

const adminDismissedFilter = {
  adminResolved: { $ne: true },
  resolved: { $ne: true },
};

function userResolvedEntry(a, uid) {
  return (a.resolvedByUsers || []).find((r) => r.userId.toString() === uid.toString());
}

/** Shared loader for GET /api/alerts and sensor dashboard merge */
async function loadAdminAlertPayloadForUser(uid) {
  const adminScope = {
    $or: [{ targetType: "all" }, { targetType: "user", targetUserId: uid }],
  };

  const [candidateAlerts, userResolvedAlerts] = await Promise.all([
    AdminAlert.find({ ...adminScope, ...adminDismissedFilter })
      .sort({ createdAt: -1 })
      .limit(80)
      .lean(),
    AdminAlert.find({
      ...adminScope,
      ...adminDismissedFilter,
      "resolvedByUsers.userId": uid,
    })
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean(),
  ]);

  const adminActive = candidateAlerts.filter((a) => !userResolvedEntry(a, uid));
  const mappedManualActive = adminActive.map(mapAdminAlertForUser);

  const resolvedAlerts = userResolvedAlerts.map((a) => {
    const ent = userResolvedEntry(a, uid);
    return {
      ...mapAdminAlertForUser(a),
      resolvedAt: ent?.resolvedAt || a.updatedAt,
    };
  });

  return { mappedManualActive, resolvedAlerts };
}

// PUT /api/alerts/resolve/:id — farmer marks an admin broadcast alert resolved (persisted)
router.put("/resolve/:id", verifyToken, async (req, res) => {
  try {
    const rawId = req.params.id && String(req.params.id).trim();
    if (!rawId || !mongoose.Types.ObjectId.isValid(rawId)) {
      return res.status(400).json({ success: false, message: "Invalid alert id" });
    }

    const alert = await AdminAlert.findById(rawId);
    if (!alert) {
      return res.status(404).json({ success: false, message: "Alert not found" });
    }

    const uid = req.user._id;
    const targetId = alert.targetUserId;
    const applies =
      alert.targetType === "all" ||
      (alert.targetType === "user" &&
        targetId &&
        targetId.toString() === uid.toString());

    if (!applies) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }
    if (alert.adminResolved || alert.resolved) {
      return res.status(400).json({ success: false, message: "This alert was closed by the admin" });
    }
    const already = (alert.resolvedByUsers || []).some((r) => r.userId.toString() === uid.toString());
    if (already) {
      return res.json({ success: true, message: "Already resolved" });
    }
    alert.resolvedByUsers.push({ userId: uid, resolvedAt: new Date() });
    await alert.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// GET /api/alerts — admin alerts + sensor-derived alerts for logged-in farmer
router.get("/", verifyToken, async (req, res) => {
  try {
    const uid = req.user._id;
    const { mappedManualActive, resolvedAlerts } = await loadAdminAlertPayloadForUser(uid);

    const latest = await Sensor.findOne({ userId: req.user.id }).sort({ createdAt: -1 });

    if (!latest) {
      return res.json({
        success: true,
        alerts: mappedManualActive,
        resolvedAlerts,
        sensorData: null,
        irrigation: { percent: 0, message: "No sensor data yet — add readings to see irrigation guidance." },
      });
    }

    const rawSensorAlerts = generateAlerts(latest);
    const sensorAlerts = rawSensorAlerts.map((a, idx) => ({
      ...a,
      source: "sensor",
      persistKey: `sensor-${latest._id}-${idx}-${a.title}`,
    }));

    const zone1 = pickNumber(latest.zone1, latest.moisture_zone1);
    const zone2 = pickNumber(latest.zone2, latest.moisture_zone2);
    const zone3 = pickNumber(latest.zone3, latest.moisture_zone3);
    const zone4 = pickNumber(latest.zone4, latest.moisture_zone4);
    const temperature = pickNumber(latest.temperature, latest.airTemperature);
    const humidity = pickNumber(latest.humidity, latest.airHumidity);
    const rain = pickBoolean(latest.rain, latest.isRaining);
    const tankLevel = pickNumber(latest.tankLevel, 0);
    const avgMoisture = Number(((zone1 + zone2 + zone3 + zone4) / 4).toFixed(1));
    const moistureStatus = avgMoisture < 30 ? "Dry" : avgMoisture <= 60 ? "Normal" : "Wet";
    const irrigationPercent = rain ? 0 : avgMoisture < 30 ? 50 : avgMoisture < 50 ? 30 : 10;

    res.json({
      success: true,
      alerts: [...mappedManualActive, ...sensorAlerts],
      resolvedAlerts,
      sensorData: {
        zone1,
        zone2,
        zone3,
        zone4,
        avgMoisture,
        moistureStatus,
        temperature,
        humidity,
        tankLevel,
        rain,
        recordedAt: latest.createdAt,
      },
      irrigation: {
        percent: irrigationPercent,
        message: rain ? "Rain detected - irrigation not needed" : `Irrigation Required: ${irrigationPercent}%`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

module.exports = router;
module.exports.generateAlerts = generateAlerts;
module.exports.loadAdminAlertPayloadForUser = loadAdminAlertPayloadForUser;