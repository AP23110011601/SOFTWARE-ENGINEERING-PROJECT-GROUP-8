const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const DiseaseRecord = require("../models/DiseaseRecord");
const { verifyToken } = require("../middleware/auth");

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  }
});

const DISEASE_TEMPLATES = {
  "Leaf Blight": {
    scientificName: "Phytophthora infestans",
    severity: "high",
    description: "A serious fungal disease affecting plant leaves rapidly.",
    causes: ["High humidity", "Poor air circulation", "Infected debris"],
    symptoms: ["Dark lesions", "Leaf yellowing", "Rapid wilting"],
    prevention: ["Ensure proper spacing", "Improve air flow", "Use resistant varieties"],
    treatment: ["Apply copper fungicides", "Remove affected leaves", "Reduce irrigation"],
    impact: { yieldLoss: "30-60%", spreadRate: "Rapid (2-3 days)", economicDamage: "High" }
  },
  "Powdery Mildew": {
    scientificName: "Erysiphe necator",
    severity: "medium",
    description: "Fungal disease creating white powdery coating.",
    causes: ["Moderate temps", "High humidity", "Dense foliage"],
    symptoms: ["White powdery spots", "Yellowing of foliage", "Stunted growth"],
    prevention: ["Apply sulfur fungicides", "Maintain spacing", "Monitor humidity"],
    treatment: ["Neem oil sprays", "Prune affected areas", "Potassium bicarbonate"],
    impact: { yieldLoss: "20-40%", spreadRate: "Moderate", economicDamage: "Medium" }
  },
  "Rust": {
    scientificName: "Puccinia spp.",
    severity: "medium",
    description: "Fungal disease causing rust-colored spots on leaves.",
    causes: ["Prolonged leaf wetness", "Mild temperatures", "Airborne spores"],
    symptoms: ["Orange/brown pustules", "Leaf deformation", "Premature leaf drop"],
    prevention: ["Water at soil level", "Remove crop debris", "Crop rotation"],
    treatment: ["Fungicide application", "Remove infected foliage", "Enhance airflow"],
    impact: { yieldLoss: "15-30%", spreadRate: "Moderate", economicDamage: "Medium" }
  },
  "Healthy": {
    scientificName: "N/A",
    severity: "low",
    description: "Plant appears healthy with no visible signs of disease.",
    causes: ["Optimal conditions", "Good farm management"],
    symptoms: ["Normal coloration", "Vigorous growth"],
    prevention: ["Continue standard maintenance", "Regular monitoring"],
    treatment: ["No treatment needed", "Maintain watering schedule"],
    impact: { yieldLoss: "0%", spreadRate: "None", economicDamage: "None" }
  },
  "Unknown": {
    scientificName: "Unknown Pathogen",
    severity: "medium",
    description: "The model detected anomalies but couldn't classify them perfectly.",
    causes: ["Environmental stress", "Deficiency", "Undocumented pathogen"],
    symptoms: ["Atypical spots", "General discoloration"],
    prevention: ["Monitor closely", "Isolate if degrading"],
    treatment: ["Consult local agronomist", "Apply general fungicide"],
    impact: { yieldLoss: "Unknown", spreadRate: "Unknown", economicDamage: "Unknown" }
  }
};

const analyzeWithCustomModel = async (imageBuffer, filename) => {
  try {
    // Forward the image to Flask ML API
    const formData = new FormData();
    formData.append('image', imageBuffer, { filename: filename || 'disease.jpg' });

    console.log("-> Passing image to Flask ML API (Port 5001)...");
    const flaskRes = await axios.post("http://localhost:5001/predict-disease", formData, {
      headers: { ...formData.getHeaders() }
    });

    const mlData = flaskRes.data;
    if (!mlData.success) throw new Error("Flask ML failed: " + mlData.error);

    const detectedClass = mlData.disease || "Unknown";
    const confidence = parseFloat(mlData.confidence) * 100;

    const template = DISEASE_TEMPLATES[detectedClass] || DISEASE_TEMPLATES["Unknown"];
    
    // Construct rich response using ML data mixed with Template UI formatting
    const selectedDisease = {
      name: detectedClass,
      ...template,
      confidence: confidence
    };

    return {
      success: true,
      disease: selectedDisease,
      analysis: {
        timestamp: new Date().toISOString(),
        imageProcessed: true,
        modelVersion: "SmartAgri ML 1.0 (Live)",
        processingTime: "Live Backend",
        confidence: confidence
      }
    };
  } catch (error) {
    console.error("Live ML Integration Error:", error.message);
    return { success: false, error: "Model API Error: " + error.message };
  }
};

router.post("/analyze-custom", verifyToken, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image" });

    const result = await analyzeWithCustomModel(req.file.buffer, req.file.originalname);
    if (!result.success) return res.status(500).json(result);

    const diseaseRecord = new DiseaseRecord({
      userId: req.user.id,
      imageUrl: `/uploads/${req.file.originalname}`,
      diseaseName: result.disease.name,
      confidence: result.disease.confidence,
      severity: result.disease.severity,
      analysis: result,
      createdAt: new Date()
    });
    await diseaseRecord.save();

    res.json({
      success: true,
      result: {
        disease: result.disease,
        analysis: result.analysis,
        recommendations: {
          immediate: result.disease.treatment.slice(0, 3),
          prevention: result.disease.prevention.slice(0, 3),
          monitoring: ["Daily inspection", "Monitor weather", "Document photos"]
        },
        nextSteps: ["Review treatment protocol", "Schedule follow-up"]
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Analysis failed", error: err.message });
  }
});

router.get("/history", verifyToken, async (req, res) => {
  try {
    const history = await DiseaseRecord.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(20);
    res.json({
      success: true,
      history: history.map(r => ({
        id: r._id, date: r.createdAt, disease: r.diseaseName,
        confidence: r.confidence, severity: r.severity, imageUrl: r.imageUrl
      }))
    });
  } catch (err) { res.status(500).json({ success: false }); }
});

router.get("/model-info", (req, res) => {
  res.json({
    model: {
      name: "Smart Agriculture Live ML",
      version: "v1.0 Flask Connected",
      type: "TensorFlow Deep Learning CNN",
      trainingData: "Kaggle Dataset",
      accuracy: "Live Inference",
      supportedCrops: ["Rice", "Wheat", "Cotton", "Maize"],
      supportedDiseases: ["Healthy", "Leaf Blight", "Rust", "Powdery Mildew"],
    },
    capabilities: ["Live Network Inference", "Dynamic Fallbacks"]
  });
});

module.exports = router;
