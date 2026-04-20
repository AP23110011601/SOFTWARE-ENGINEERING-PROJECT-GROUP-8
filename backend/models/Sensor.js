const mongoose = require("mongoose");

const sensorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  moisture_zone1: { type: Number, default: 0 },
  moisture_zone2: { type: Number, default: 0 },
  moisture_zone3: { type: Number, default: 0 },
  moisture_zone4: { type: Number, default: 0 },
  zone1: { type: Number, default: 0 },
  zone2: { type: Number, default: 0 },
  zone3: { type: Number, default: 0 },
  zone4: { type: Number, default: 0 },
  ph: { type: Number, default: 7 },
  nitrogen: { type: Number, default: 50 },
  phosphorus: { type: Number, default: 40 },
  potassium: { type: Number, default: 35 },
  rainfallQuantity: { type: Number, default: 0 },
  isRaining: { type: Boolean, default: false },
  rain: { type: Boolean, default: false },
  tankLevel: { type: Number, default: 0 },
  airTemperature: { type: Number, default: 0 },
  temperature: { type: Number, default: 0 },
  airHumidity: { type: Number, default: 0 },
  humidity: { type: Number, default: 0 },
  soilTemperature: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Sensor", sensorSchema);