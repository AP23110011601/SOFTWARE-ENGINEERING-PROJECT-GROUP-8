const express = require('express');
const router = express.Router();
const Sensor = require('../models/Sensor');
const User = require('../models/User');
const { verifyToken: auth } = require('../middleware/auth');

// Get sensor data for dashboard
router.get('/sensor', auth, async (req, res) => {
  try {
    // Get latest sensor data
    const latestSensorData = await Sensor.findOne().sort({ timestamp: -1 });
    
    // Generate mock data if no real data exists
    const mockData = {
      temperature: 28 + Math.random() * 10,
      humidity: 60 + Math.random() * 20,
      soilMoisture: 40 + Math.random() * 30,
      waterLevel: 70 + Math.random() * 20,
      ph: 6.5 + Math.random() * 1.5,
      timestamp: new Date()
    };

    const data = latestSensorData || mockData;
    
    res.json({
      success: true,
      data: [data],
      message: 'Sensor data retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sensor data'
    });
  }
});

// Get alerts for dashboard
router.get('/alerts', auth, async (req, res) => {
  try {
    // Generate mock alerts based on sensor data
    const mockAlerts = [];
    
    // Generate random alerts
    const alertTypes = [
      {
        title: 'Low Soil Moisture',
        message: 'Soil moisture is below optimal level. Consider irrigation.',
        severity: 'warning',
        type: 'moisture'
      },
      {
        title: 'High Temperature',
        message: 'Temperature is above optimal range for crops.',
        severity: 'critical',
        type: 'temperature'
      },
      {
        title: 'Irrigation Needed',
        message: 'Automatic irrigation recommended based on current conditions.',
        severity: 'info',
        type: 'irrigation'
      }
    ];

    // Randomly select 0-2 alerts
    const numAlerts = Math.floor(Math.random() * 3);
    for (let i = 0; i < numAlerts; i++) {
      const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      mockAlerts.push({
        ...randomAlert,
        id: Date.now() + i,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      alerts: mockAlerts,
      message: 'Alerts retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts'
    });
  }
});

// Control irrigation
router.post('/irrigation', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    // In a real system, this would control physical irrigation hardware
    console.log(`Irrigation ${status ? 'started' : 'stopped'} by user: ${req.user.email}`);
    
    // Log the irrigation action
    const irrigationLog = {
      userId: req.user.id,
      action: status ? 'start' : 'stop',
      timestamp: new Date(),
      status: status
    };

    // Save to database (you might want to create an IrrigationLog model)
    // await IrrigationLog.create(irrigationLog);

    res.json({
      success: true,
      message: `Irrigation ${status ? 'started' : 'stopped'} successfully`,
      data: {
        status: status,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error controlling irrigation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to control irrigation'
    });
  }
});

// Get historical data for charts
router.get('/historical', auth, async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    
    // Generate mock historical data
    const hours = period === '24h' ? 24 : period === '7d' ? 168 : 720; // 24h, 7d, 30d
    const labels = [];
    const moistureData = [];
    const temperatureData = [];
    const humidityData = [];
    
    for (let i = hours; i >= 0; i--) {
      const time = new Date(Date.now() - i * 60 * 60 * 1000);
      labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      
      // Generate realistic data with some variation
      moistureData.push(45 + Math.random() * 20);
      temperatureData.push(25 + Math.random() * 10);
      humidityData.push(60 + Math.random() * 20);
    }
    
    res.json({
      success: true,
      data: {
        labels,
        moisture: moistureData,
        temperature: temperatureData,
        humidity: humidityData
      },
      message: 'Historical data retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch historical data'
    });
  }
});

// Get system statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      activeUsers: await User.countDocuments({ lastLogin: { $exists: true } }),
      totalSensors: await Sensor.countDocuments(),
      systemUptime: process.uptime(),
      lastDataUpdate: new Date()
    };
    
    res.json({
      success: true,
      stats,
      message: 'System statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system statistics'
    });
  }
});

module.exports = router;
