const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const os = require("os");

// System performance metrics storage
let systemMetrics = {
  startTime: Date.now(),
  totalRequests: 0,
  activeConnections: 0,
  errors: [],
  performance: {
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    responseTime: []
  },
  database: {
    connectionStatus: "connected",
    queryTime: 0,
    activeConnections: 0
  }
};

// Middleware to track requests
router.use((req, res, next) => {
  const startTime = Date.now();
  systemMetrics.totalRequests++;
  
  // Track response time
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    systemMetrics.performance.responseTime.push(responseTime);
    
    // Keep only last 100 response times
    if (systemMetrics.performance.responseTime.length > 100) {
      systemMetrics.performance.responseTime = systemMetrics.performance.responseTime.slice(-100);
    }
  });
  
  next();
});

// GET /health - System health check
router.get("/health", (req, res) => {
  try {
    const uptime = Date.now() - systemMetrics.startTime;
    const uptimeHours = Math.floor(uptime / (1000 * 60 * 60));
    const uptimeDays = Math.floor(uptimeHours / 24);
    
    // Get system resource usage
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Update metrics
    systemMetrics.performance.memoryUsage = memUsage.heapUsed / memUsage.heapTotal * 100;
    systemMetrics.performance.cpuUsage = cpuUsage.user / cpuUsage.system * 100;
    
    // Check database connection
    const mongoose = require("mongoose");
    const dbStatus = mongoose.connection.readyState;
    const dbStatusText = dbStatus === 1 ? "connected" : 
                         dbStatus === 2 ? "connecting" : 
                         dbStatus === 3 ? "disconnecting" : "disconnected";
    
    systemMetrics.database.connectionStatus = dbStatusText;
    
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: {
        days: uptimeDays,
        hours: uptimeHours % 24,
        minutes: Math.floor((uptime / (1000 * 60)) % 60)
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        memory: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024),
          total: Math.round(memUsage.heapTotal / 1024 / 1024),
          percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
        },
        cpu: {
          usage: Math.round((cpuUsage.user / cpuUsage.system) * 100),
          cores: os.cpus().length
        },
        disk: {
          free: Math.round(os.freemem() / 1024 / 1024),
          total: Math.round(os.totalmem() / 1024 / 1024)
        }
      },
      database: {
        status: dbStatusText,
        collections: mongoose.connection.collections ? mongoose.connection.collections.length : 0,
        host: mongoose.connection.host || "localhost",
        port: mongoose.connection.port || 27017
      },
      performance: {
        totalRequests: systemMetrics.totalRequests,
        averageResponseTime: systemMetrics.performance.responseTime.length > 0 
          ? Math.round(systemMetrics.performance.responseTime.reduce((a, b) => a + b, 0) / systemMetrics.performance.responseTime.length)
          : 0,
        requestsPerSecond: systemMetrics.totalRequests / (uptime / 1000),
        errorRate: systemMetrics.errors.length > 0 
          ? (systemMetrics.errors.length / systemMetrics.totalRequests) * 100 
          : 0
      },
      endpoints: {
        "/api/auth/login": { status: "active", avgResponseTime: 120 },
        "/api/auth/register": { status: "active", avgResponseTime: 150 },
        "/api/sensor": { status: "active", avgResponseTime: 80 },
        "/api/profile": { status: "active", avgResponseTime: 100 },
        "/api/disease": { status: "active", avgResponseTime: 200 }
      }
    };
    
    console.log("🏥 System Health Check:", {
      uptime: `${uptimeDays}d ${uptimeHours % 24}h`,
      memory: `${Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)}%`,
      database: dbStatusText
    });
    
    res.json({
      success: true,
      health: health
    });
    
  } catch (error) {
    console.error("❌ Health check error:", error);
    res.status(500).json({
      success: false,
      message: "Health check failed",
      error: error.message
    });
  }
});

// GET /metrics - Detailed performance metrics
router.get("/metrics", verifyToken, (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: Date.now() - systemMetrics.startTime,
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: os.platform(),
        nodeVersion: process.version
      },
      database: {
        status: systemMetrics.database.connectionStatus,
        collections: require("mongoose").connection.collections?.length || 0
      },
      performance: {
        totalRequests: systemMetrics.totalRequests,
        averageResponseTime: systemMetrics.performance.responseTime.length > 0 
          ? Math.round(systemMetrics.performance.responseTime.reduce((a, b) => a + b, 0) / systemMetrics.performance.responseTime.length)
          : 0,
        responseTimeHistory: systemMetrics.performance.responseTime.slice(-20),
        errorRate: systemMetrics.errors.length > 0 
          ? (systemMetrics.errors.length / systemMetrics.totalRequests) * 100 
          : 0
      },
      recentErrors: systemMetrics.errors.slice(-10)
    };
    
    console.log("📊 Performance metrics accessed by:", req.user.email);
    
    res.json({
      success: true,
      metrics: metrics
    });
    
  } catch (error) {
    console.error("❌ Metrics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch metrics",
      error: error.message
    });
  }
});

// POST /log-error - Log system errors
router.post("/log-error", (req, res) => {
  try {
    const { error, endpoint, userId, timestamp } = req.body;
    
    const errorLog = {
      id: Date.now(),
      timestamp: timestamp || new Date().toISOString(),
      error: error,
      endpoint: endpoint,
      userId: userId || "anonymous",
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    };
    
    systemMetrics.errors.push(errorLog);
    
    // Keep only last 100 errors
    if (systemMetrics.errors.length > 100) {
      systemMetrics.errors = systemMetrics.errors.slice(-100);
    }
    
    console.error("❌ System Error Logged:", errorLog);
    
    res.json({
      success: true,
      message: "Error logged successfully"
    });
    
  } catch (error) {
    console.error("❌ Error logging failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to log error",
      error: error.message
    });
  }
});

// GET /logs - Get system logs
router.get("/logs", verifyToken, (req, res) => {
  try {
    const { type = 'all', limit = 50 } = req.query;
    
    let logs = [];
    
    switch (type) {
      case 'errors':
        logs = systemMetrics.errors.slice(-limit);
        break;
      case 'performance':
        logs = systemMetrics.performance.responseTime.slice(-limit).map((time, index) => ({
          timestamp: Date.now() - (limit - index) * 1000,
          responseTime: time,
          type: 'response_time'
        }));
        break;
      default:
        logs = {
          systemErrors: systemMetrics.errors.slice(-20),
          performanceMetrics: systemMetrics.performance.responseTime.slice(-20),
          totalRequests: systemMetrics.totalRequests,
          uptime: Date.now() - systemMetrics.startTime
        };
    }
    
    console.log("📜 System logs accessed by:", req.user.email);
    
    res.json({
      success: true,
      logs: logs,
      total: logs.length
    });
    
  } catch (error) {
    console.error("❌ Logs fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch logs",
      error: error.message
    });
  }
});

// GET /status - Quick system status
router.get("/status", (req, res) => {
  try {
    const status = {
      api: "operational",
      database: systemMetrics.database.connectionStatus,
      uptime: Math.floor((Date.now() - systemMetrics.startTime) / 1000),
      memory: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
      lastError: systemMetrics.errors.length > 0 ? systemMetrics.errors[systemMetrics.errors.length - 1] : null
    };
    
    res.json({
      success: true,
      status: status
    });
    
  } catch (error) {
    console.error("❌ Status check error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get status",
      error: error.message
    });
  }
});

module.exports = router;
