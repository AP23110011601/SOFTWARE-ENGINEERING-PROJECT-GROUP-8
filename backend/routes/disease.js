const express = require("express");
const router = express.Router();
const multer = require("multer");
const DiseaseRecord = require("../models/DiseaseRecord");
const { verifyToken } = require("../middleware/auth");

// Simple image upload (no storage needed)
const upload = multer({ storage: multer.memoryStorage() });

/*
 POST /api/disease/analyze
 Analyze plant disease with mock AI detection
*/
router.post("/analyze", verifyToken, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    const { userId } = req.body;

    //  MOCK AI RESULT (SAFE FOR DEMO) - Enhanced with structured data
    const mockDiseases = [
      {
        diseaseName: "Leaf Spot Disease",
        confidence: 87,
        severity: "medium",
        description: "Leaf spot is a fungal disease that causes brown to black spots on leaves, potentially leading to defoliation and reduced crop yield.",
        causes: [
          "Fungal infection (Cercospora species)",
          "High humidity and warm temperatures",
          "Poor air circulation around plants",
          "Overhead irrigation practices"
        ],
        prevention: [
          "Ensure proper plant spacing for good air circulation",
          "Avoid overhead watering, water at the base instead",
          "Remove and destroy infected plant debris",
          "Apply preventive fungicides during high-risk periods",
          "Maintain balanced soil fertility"
        ],
        treatment: [
          "Apply copper-based fungicides every 7-10 days",
          "Remove severely infected leaves to prevent spread",
          "Improve drainage and reduce humidity around plants",
          "Use neem oil spray as organic treatment option",
          "Apply sulfur-based fungicides for severe cases"
        ]
      },
      {
        diseaseName: "Powdery Mildew",
        confidence: 92,
        severity: "low",
        description: "Powdery mildew appears as white, powdery growth on leaf surfaces, typically affecting plant photosynthesis and growth.",
        causes: [
          "Fungal infection (Erysiphales order)",
          "Moderate temperatures with high humidity",
          "Poor air circulation",
          "Excessive nitrogen fertilization"
        ],
        prevention: [
          "Choose resistant plant varieties when available",
          "Maintain proper spacing between plants",
          "Avoid overhead irrigation methods",
          "Ensure good sunlight exposure",
          "Apply preventive sulfur sprays"
        ],
        treatment: [
          "Apply horticultural oils to smother fungal growth",
          "Use baking soda solution spray (1 tsp per quart water)",
          "Apply potassium bicarbonate fungicides",
          "Increase air circulation around affected plants",
          "Remove and destroy severely infected parts"
        ]
      },
      {
        diseaseName: "Bacterial Blight",
        confidence: 78,
        severity: "high",
        description: "Bacterial blight causes water-soaked lesions that turn brown and necrotic, potentially leading to plant death if untreated.",
        causes: [
          "Bacterial infection (Xanthomonas species)",
          "Warm and humid weather conditions",
          "Contaminated seeds or plant material",
          "Mechanical injury to plants"
        ],
        prevention: [
          "Use disease-free certified seeds",
          "Practice crop rotation with non-host plants",
          "Avoid working with plants when wet",
          "Disinfect tools between plants",
          "Maintain proper field sanitation"
        ],
        treatment: [
          "Apply copper-based bactericides",
          "Remove and destroy infected plants immediately",
          "Avoid overhead irrigation during treatment",
          "Use streptomycin sulfate for severe infections",
          "Implement strict quarantine measures"
        ]
      }
    ];

    // Select a random disease for demo purposes
    const result = mockDiseases[Math.floor(Math.random() * mockDiseases.length)];

    // Save to DB with user association
    const record = new DiseaseRecord({
      userId: userId || req.user.id,
      diseaseName: result.diseaseName,
      confidence: result.confidence,
      severity: result.severity,
      description: result.description,
      causes: result.causes,
      prevention: result.prevention,
      treatment: result.treatment,
      imageUrl: "uploaded_image_" + Date.now() // Mock image reference
    });

    await record.save();

    res.json({
      success: true,
      ...result
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Disease analysis failed" });
  }
});

/*
 GET /api/disease/history
*/
router.get("/history", async (req, res) => {
  try {
    const data = await DiseaseRecord.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error fetching history" });
  }
});

/*
 GET /api/disease/common/:crop
*/
router.get("/common/:crop", (req, res) => {
  const crop = req.params.crop.toLowerCase();

  const diseases = {
    rice: ["Rice Blast", "Brown Spot"],
    wheat: ["Rust", "Powdery Mildew"],
    cotton: ["Leaf Spot", "Wilt"]
  };

  res.json({
    crop,
    diseases: diseases[crop] || ["Leaf Spot", "Root Rot"]
  });
});

module.exports = router;