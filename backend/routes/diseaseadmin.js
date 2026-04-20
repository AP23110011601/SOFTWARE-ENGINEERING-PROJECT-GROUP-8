// routes/admin/diseaseAdmin.js

const express = require('express');
const router = express.Router();

// ✅ Correct path (VERY IMPORTANT)
const DiseaseRecord = require('../models/DiseaseRecord');


// ================= STATS =================
router.get('/stats', async (req, res) => {
  try {
    const [total, urgencyBreakdown, topDiseases] = await Promise.all([
      DiseaseRecord.countDocuments(),

      DiseaseRecord.aggregate([
        { $group: { _id: '$result.urgency', count: { $sum: 1 } } }
      ]),

      DiseaseRecord.aggregate([
        { $match: { 'result.disease': { $ne: 'Healthy' } } },
        { $group: { _id: '$result.disease', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      success: true,
      data: { total, urgencyBreakdown, topDiseases }
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ================= ALL RECORDS =================
router.get('/all', async (req, res) => {
  try {
    const { page = 1, limit = 50, urgency, crop } = req.query;

    const filter = {};
    if (urgency) filter['result.urgency'] = urgency;
    if (crop) filter.cropType = new RegExp(crop, 'i');

    const records = await DiseaseRecord.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({ success: true, data: records });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ================= CRITICAL =================
router.get('/critical', async (req, res) => {
  try {
    const records = await DiseaseRecord.find({
      'result.urgency': { $in: ['High', 'Critical'] },
      createdAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: records.length,
      data: records
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;