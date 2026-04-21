import React, { useEffect, useState } from "react";
import { Leaf, Activity, Droplets, Thermometer, CloudRain, RefreshCw } from "lucide-react";

const SoilEnvironment = () => {
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [irrigationAdvice, setIrrigationAdvice] = useState(null);
  const [soilType, setSoilType] = useState("");

  const fetchSensorData = async (generateFresh = false) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLatest(null);
        return;
      }

      if (generateFresh) {
        setRefreshing(true);
        await fetch(`${process.env.REACT_APP_API_URL}/api/sensor/generate`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      let response = await fetch(`${process.env.REACT_APP_API_URL}/api/sensor/latest`, {
        
        headers: { Authorization: `Bearer ${token}` }
      });
      let data = await response.json();
      if (data?.latest && (data.latest.avgMoisture ?? 0) === 0) {
        await fetch("http://localhost:5000/api/sensor/generate", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
        response = await fetch(`${process.env.REACT_APP_API_URL}/api/sensor/latest`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        data = await response.json();
      }
      setLatest(data?.latest || null);
    } catch (error) {
      setLatest(null);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem("user") || "{}");
    setSoilType(localUser.soilType || "");
    fetchSensorData();
  }, []);

  const zones = latest ? [
    { name: "Zone 1", value: latest.zone1 ?? latest.moisture_zone1 ?? 0 },
    { name: "Zone 2", value: latest.zone2 ?? latest.moisture_zone2 ?? 0 },
    { name: "Zone 3", value: latest.zone3 ?? latest.moisture_zone3 ?? 0 },
    { name: "Zone 4", value: latest.zone4 ?? latest.moisture_zone4 ?? 0 }
  ] : [];

  const avgMoisture = latest?.avgMoisture ?? 0;
  const phCategory = latest?.phAnalysis?.category || "optimal";
  const phRecommendation = latest?.phAnalysis?.recommendation || "No pH recommendation available.";
  const irrigationMessage = latest?.irrigation?.message || "No irrigation recommendation available.";

  const handleIrrigationRecommendation = () => {
    if (!latest) return;
    const base = latest.irrigation?.percent ?? 0;
    let adjusted = base;
    let soilNote = "Standard irrigation recommendation applied.";

    if (soilType === "Sandy") {
      adjusted = Math.min(100, base + 10);
      soilNote = "Sandy soil drains quickly, so water requirement is increased by 10%.";
    } else if (soilType === "Clay") {
      adjusted = Math.max(0, base - 10);
      soilNote = "Clay soil retains water, so water requirement is reduced by 10%.";
    } else if (soilType === "Loamy") {
      soilNote = "Loamy soil supports balanced irrigation with no adjustment.";
    }

    setIrrigationAdvice({
      percent: adjusted,
      message: irrigationMessage,
      soilNote
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="mb-8 flex items-center justify-between bg-gradient-to-r from-slate-50 to-cyan-50 border border-cyan-100 rounded-2xl p-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Soil and Environment Analysis</h1>
          <p className="text-slate-600">Live diagnostics view of soil chemistry and environmental sensor signals.</p>
        </div>
        <button
          onClick={() => fetchSensorData(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-cyan-200 text-cyan-700 hover:bg-cyan-50 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {loading && <div className="text-gray-500">Loading sensor data...</div>}
      {!loading && !latest && <div className="text-gray-500">No sensor data available.</div>}

      {latest && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-cyan-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 font-medium">Average Moisture</span>
                <Droplets size={20} className="text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{avgMoisture}%</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 font-medium">Temperature</span>
                <Thermometer size={20} className="text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{latest.temperature ?? latest.airTemperature}C</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 font-medium">Humidity</span>
                <Activity size={20} className="text-cyan-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{latest.humidity ?? latest.airHumidity}%</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 font-medium">Rain Status</span>
                <CloudRain size={20} className="text-indigo-500" />
              </div>
              <p className="text-lg font-bold text-gray-800">{latest.rain || latest.isRaining ? "Rain detected" : "No rain"}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-cyan-100 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center text-cyan-700">
              <Droplets size={18} className="mr-2" /> Zone-wise Soil Moisture
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {zones.map((zone) => (
                <div key={zone.name} className="rounded-xl border border-cyan-100 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-gray-700">{zone.name}</p>
                  <p className={`text-2xl font-bold mt-2 ${zone.value < 25 ? "text-red-600" : "text-emerald-600"}`}>
                    {zone.value}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{zone.value < 25 ? "Dry zone" : "Healthy range"}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Leaf size={20} className="text-purple-600 mr-2" /> Soil Health and pH Analysis
            </h2>
            <p className="text-gray-700 mb-2">
              Current pH: <span className="font-semibold">{latest.ph}</span> -{" "}
              <span className="font-semibold capitalize">{phCategory}</span>
            </p>
            <p className="text-sm text-gray-600">{phRecommendation}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Droplets size={20} className="text-emerald-600 mr-2" /> Smart Irrigation Suggestion
            </h2>
            <button
              onClick={handleIrrigationRecommendation}
              className="mb-4 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Get Smart Irrigation Recommendation
            </button>
            {irrigationAdvice ? (
              <>
                <p className="text-gray-700 mb-2">
                  Required water percentage: <span className="font-semibold text-emerald-700">{irrigationAdvice.percent}%</span>
                </p>
                <p className="text-sm text-gray-600">{irrigationAdvice.message}</p>
                <p className="text-sm text-gray-600 mt-1">{irrigationAdvice.soilNote}</p>
              </>
            ) : (
              <p className="text-sm text-gray-600">
                Click the button to get irrigation percentage using live sensor values and soil type.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SoilEnvironment;
