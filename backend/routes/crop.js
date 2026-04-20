const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, async (req, res) => {
  try {
    // Dynamically uses Cloud URL in production, defaults to localhost in dev
    const ML_URL = process.env.ML_API_URL || 'http://localhost:5001';
    
    const response = await fetch(`${ML_URL}/predict-crop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) throw new Error("ML Server responded with an error.");
    
    const data = await response.json();
    res.json({
      success: true,
      crop: data.crop
    });
  } catch (error) {
    console.error("ML Error:", error.message);
    res.status(500).json({ error: "Failed to communicate with ML Model on port 5001." });
  }
});

module.exports = router;
