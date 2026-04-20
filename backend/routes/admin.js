const express = require("express");
const router = express.Router();
const Sensor = require("../models/Sensor");
const User = require("../models/User");
const AdminAlert = require("../models/AdminAlert");
const Scheme = require("../models/Scheme");
const { verifyToken, adminOnly } = require("../middleware/auth");

/** Farmers only: never list the site owner admin account (even if DB role was wrong once). */
function farmerAccountsFilter() {
  const email =
    (process.env.ADMIN_OWNER_EMAIL && String(process.env.ADMIN_OWNER_EMAIL).trim()) ||
    "admin@smartagri.com";
  const safe = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return {
    role: "user",
    $nor: [{ email: { $regex: new RegExp(`^${safe}$`, "i") } }],
  };
}

// Middleware to check if user is admin
router.use(verifyToken);
router.use(adminOnly);

// GET /api/admin/users - Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find(farmerAccountsFilter()).select("-password").sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users", error });
  }
});

// PUT /api/admin/users/:id/toggle-status
router.put("/users/:id/toggle-status", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.role !== "user") {
      return res.status(400).json({ success: false, message: "Only farmer users can be updated from this panel" });
    }
    user.active = req.body.active !== undefined ? req.body.active : !user.active;
    await user.save();
    res.json({ success: true, message: "User status updated", active: user.active });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating user", error });
  }
});

// POST /api/admin/users/bulk-action
router.post("/users/bulk-action", async (req, res) => {
  try {
    const { action, userIds } = req.body;
    const farmerUsers = await User.find({
      _id: { $in: userIds },
      ...farmerAccountsFilter(),
    }).select("_id");
    const farmerUserIds = farmerUsers.map((u) => u._id);
    if (action === "delete") {
      await User.deleteMany({ _id: { $in: farmerUserIds }, ...farmerAccountsFilter() });
      await Sensor.deleteMany({ userId: { $in: farmerUserIds } });
      return res.json({ success: true, message: `${farmerUserIds.length} users deleted` });
    }
    res.json({ success: false, message: "Unknown action" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error performing bulk action", error });
  }
});

// POST /api/admin/settings - Save system settings
router.post("/settings", async (req, res) => {
  try {
    // In production, persist to DB. For now respond with success.
    res.json({ success: true, message: "Settings saved", settings: req.body });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving settings", error });
  }
});

// DELETE /api/admin/users/:id - Delete a user
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, ...farmerAccountsFilter() });
    if (!user) {
      return res.status(404).json({ message: "Farmer user not found" });
    }
    
    // Also delete user's sensor data
    await Sensor.deleteMany({ userId: req.params.id });
    
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
});

// GET /api/admin/sensor-data — exactly one latest row per registered farmer (no duplicates)
router.get("/sensor-data", async (req, res) => {
  try {
    const farmers = await User.find(farmerAccountsFilter())
      .select("_id name")
      .sort({ name: 1 })
      .lean();
    const farmerIds = farmers.map((f) => f._id);
    if (!farmerIds.length) {
      return res.json({ success: true, data: [] });
    }

    const latestByUser = await Sensor.aggregate([
      { $match: { userId: { $in: farmerIds } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: { $toString: "$userId" },
          doc: { $first: "$$ROOT" },
        },
      },
    ]);

    const byFarmerId = new Map(latestByUser.map((g) => [g._id, g.doc]));

    const data = farmers.map((f) => {
      const doc = byFarmerId.get(String(f._id));
      if (!doc) {
        return {
          userId: { _id: f._id, name: f.name },
          hasReading: false,
          createdAt: null,
        };
      }
      return {
        ...doc,
        userId: { _id: f._id, name: f.name },
        hasReading: true,
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching sensor data", error });
  }
});

// GET /api/admin/alerts - Get all system alerts
router.get("/alerts", async (req, res) => {
  try {
    const alerts = [];
    const farmerIds = await User.find(farmerAccountsFilter()).distinct("_id");
    const allSensorData = await Sensor.find({ userId: { $in: farmerIds } })
      .populate("userId", "name role")
      .sort({ createdAt: -1 })
      .limit(50);

    for (const data of allSensorData) {
      if (!data.userId || data.userId.role !== "user") continue;
      const avgMoisture = (
        data.moisture_zone1 + data.moisture_zone2 +
        data.moisture_zone3 + data.moisture_zone4
      ) / 4;

      // Generate alerts for each sensor reading
      if (avgMoisture < 30) {
        alerts.push({
          _id: `${data._id}-low-moisture`,
          type: "critical",
          priority: "high",
          category: "moisture",
          title: "Low Soil Moisture",
          message: `${data.userId?.name || "Farmer"} moisture is low. Irrigation needed immediately.`,
          user: data.userId?.name || "Farmer",
          resolved: false,
          createdAt: data.createdAt,
        });
      }
      if (data.tankLevel < 20) {
        alerts.push({
          _id: `${data._id}-tank`,
          type: "critical",
          priority: "high",
          category: "tank",
          title: "Tank Critical",
          message: `${data.userId?.name || "Farmer"} tank level critically low (${data.tankLevel}%).`,
          user: data.userId?.name || "Farmer",
          resolved: false,
          createdAt: data.createdAt,
        });
      }
      if (data.airTemperature > 38) {
        alerts.push({
          _id: `${data._id}-heat`,
          type: "critical",
          priority: "high",
          category: "temperature",
          title: "Heat Stress",
          message: `${data.userId?.name || "Farmer"} temperature is high - crop stress risk.`,
          user: data.userId?.name || "Farmer",
          resolved: false,
          createdAt: data.createdAt,
        });
      }
      if (data.airHumidity > 80) {
        alerts.push({
          _id: `${data._id}-humidity`,
          type: "warning",
          priority: "medium",
          category: "humidity",
          title: "Disease Risk",
          message: `${data.userId?.name || "Farmer"} has high humidity - fungal disease risk.`,
          user: data.userId?.name || "Farmer",
          resolved: false,
          createdAt: data.createdAt,
        });
      }
    }

    const manualAlerts = await AdminAlert.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("targetUserId", "name");

    const mappedManualAlerts = manualAlerts.map((a) => {
      const adminDone = Boolean(a.adminResolved || a.resolved);
      return {
        _id: a._id,
        type: a.priority === "high" ? "critical" : a.priority === "medium" ? "warning" : "info",
        priority: a.priority,
        category: a.category,
        title: a.title,
        message: a.message,
        user: a.targetType === "all" ? "All Users" : a.targetUserId?.name || "Selected User",
        resolved: adminDone,
        adminResolved: adminDone,
        userResolvedCount: (a.resolvedByUsers || []).length,
        createdAt: a.createdAt,
        adminResolvedAt: a.adminResolvedAt || null,
        source: "manual",
        targetType: a.targetType,
        targetUserId: a.targetUserId?._id || null,
      };
    });

    res.json({ success: true, alerts: [...mappedManualAlerts, ...alerts] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching alerts", error });
  }
});

// POST /api/admin/alerts - create manual alert for users
router.post("/alerts", async (req, res) => {
  try {
    const { title, message, priority = "medium", category = "general", targetType = "all", targetUserId = null } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: "Title and message are required" });
    }
    if (targetType === "user" && !targetUserId) {
      return res.status(400).json({ success: false, message: "targetUserId is required for user target alerts" });
    }

    const alert = await AdminAlert.create({
      title,
      message,
      priority,
      category,
      targetType,
      targetUserId: targetType === "user" ? targetUserId : null,
      createdBy: req.user._id,
      resolved: false,
      adminResolved: false,
      resolvedByUsers: [],
    });
    res.status(201).json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating alert", error: error.message });
  }
});

// PUT /api/admin/alerts/:id/resolve — admin marks alert resolved (all users; shows under admin Resolved tab)
router.put("/alerts/:id/resolve", async (req, res) => {
  try {
    const now = new Date();
    const updated = await AdminAlert.findByIdAndUpdate(
      req.params.id,
      { adminResolved: true, adminResolvedAt: now, resolved: true },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Alert not found" });
    res.json({ success: true, alert: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error resolving alert", error: error.message });
  }
});

// DELETE /api/admin/alerts/:id - delete manual alert
router.delete("/alerts/:id", async (req, res) => {
  try {
    const deleted = await AdminAlert.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Alert not found" });
    res.json({ success: true, message: "Alert deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting alert", error: error.message });
  }
});

// GET /api/admin/schemes - all schemes for management
router.get("/schemes", async (req, res) => {
  try {
    const schemes = await Scheme.find().sort({ createdAt: -1 });
    res.json({ success: true, schemes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching schemes", error: error.message });
  }
});

// POST /api/admin/schemes - create new scheme
router.post("/schemes", async (req, res) => {
  try {
    const { title, description, link, category = "Central", active = true } = req.body;
    if (!title || !description || !link) {
      return res.status(400).json({ success: false, message: "title, description and link are required" });
    }
    const scheme = await Scheme.create({
      title,
      description,
      link,
      category,
      active,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, scheme });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating scheme", error: error.message });
  }
});

// PUT /api/admin/schemes/:id - update scheme
router.put("/schemes/:id", async (req, res) => {
  try {
    const updated = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Scheme not found" });
    res.json({ success: true, scheme: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating scheme", error: error.message });
  }
});

// DELETE /api/admin/schemes/:id - delete scheme
router.delete("/schemes/:id", async (req, res) => {
  try {
    const deleted = await Scheme.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Scheme not found" });
    res.json({ success: true, message: "Scheme deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting scheme", error: error.message });
  }
});

// GET /api/admin/stats - Get system statistics
router.get("/stats", async (req, res) => {
  try {
    const farmerIds = await User.find(farmerAccountsFilter()).distinct("_id");
    const totalUsers = await User.countDocuments(farmerAccountsFilter());
    const totalSensorReadings = await Sensor.countDocuments({ userId: { $in: farmerIds } });
    const activeUsers = await User.countDocuments({
      ...farmerAccountsFilter(),
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    
    // Get latest readings from all users
    const latestReadings = await Sensor.aggregate([
      { $sort: { createdAt: -1 } },
      { $group: { 
        _id: "$userId", 
        latest: { $first: "$$ROOT" } 
      }},
      { $replaceRoot: { newRoot: "$latest" } },
      { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $match: { "user.role": "user" } }
    ]);

    // Count critical issues (farmer sensor rows only)
    let criticalIssues = 0;
    for (const reading of latestReadings) {
      const avgMoisture = (
        reading.moisture_zone1 + reading.moisture_zone2 +
        reading.moisture_zone3 + reading.moisture_zone4
      ) / 4;
      
      if (avgMoisture < 30 || reading.tankLevel < 20 || reading.airTemperature > 38) {
        criticalIssues++;
      }
    }

    res.json({
      totalUsers,
      activeUsers,
      totalSensorReadings,
      criticalIssues,
      latestReadings: latestReadings.length
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error });
  }
});

// GET /api/admin/analytics - dashboard analytics for admin
router.get("/analytics", async (req, res) => {
  try {
    const farmerIds = await User.find(farmerAccountsFilter()).distinct("_id");
    const [totalUsers, totalSensors, unresolvedManualAlerts, totalSchemes] = await Promise.all([
      User.countDocuments(farmerAccountsFilter()),
      Sensor.countDocuments({ userId: { $in: farmerIds } }),
      AdminAlert.countDocuments({
        adminResolved: { $ne: true },
        resolved: { $ne: true },
      }),
      Scheme.countDocuments({ active: true }),
    ]);

    const sensorAggregation = await Sensor.aggregate([
      { $match: { userId: { $in: farmerIds } } },
      { $sort: { createdAt: -1 } },
      { $limit: 500 },
      {
        $group: {
          _id: null,
          avgTemp: { $avg: "$temperature" },
          avgHumidity: { $avg: "$humidity" },
          avgTankLevel: { $avg: "$tankLevel" },
          avgPh: { $avg: "$ph" },
        },
      },
    ]);

    const latest = sensorAggregation[0] || {};

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalSensors,
        unresolvedManualAlerts,
        totalSchemes,
        avgTemp: Number((latest.avgTemp || 0).toFixed(1)),
        avgHumidity: Number((latest.avgHumidity || 0).toFixed(1)),
        avgTankLevel: Number((latest.avgTankLevel || 0).toFixed(1)),
        avgPh: Number((latest.avgPh || 0).toFixed(2)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading analytics", error: error.message });
  }
});

module.exports = router;