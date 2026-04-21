const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const errorHandler = require("./middleware/errorHandler");
const asyncHandler = require("./middleware/asyncHandler");

// ✅ CREATE APP FIRST
const app = express();

// ✅ MIDDLEWARE
app.use(express.json());
app.use(cors({
  origin: "https://frontend-app-afky.onrender.com"
}));

// ROUTES IMPORTS
const sensorRoutes = require("./routes/sensor");
const adminRoutes = require("./routes/admin");
const alertRoutes = require("./routes/alerts");
const recommendationRoutes = require("./routes/recommendations");
const authRoutes = require("./routes/authFixed");
const passwordResetRoutes = require("./routes/passwordReset");
const profileRoutes = require("./routes/profile");
const monitoringRoutes = require("./routes/monitoring");
const dashboardRoutes = require('./routes/dashboard');
const cropRoutes = require('./routes/crop');
const schemesRoutes = require("./routes/schemes");

// ROUTES USAGE
app.use("/api/auth", authRoutes);
app.use("/api/password-reset", passwordResetRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/monitoring", monitoringRoutes);
app.use("/api/sensor", sensorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/crop", cropRoutes);
app.use("/api/disease", require("./routes/disease"));
app.use("/api/disease", require("./routes/diseaseadmin"));
app.use("/api/custom-ml", require("./routes/customML"));
app.use("/api/schemes", schemesRoutes);

// MONGODB CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(" MongoDB Connected Successfully!"))
  .catch(err => console.log(" MongoDB Error:", err));

// TEST ROUTE
app.get("/", (req, res) => {
  res.send(" Smart Agriculture Backend Running!");
});

// 404 Handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: {
      message: error.message,
      statusCode: 404,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    }
  });
});

// Error Handler Middleware
app.use(errorHandler);

// SERVER START
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
