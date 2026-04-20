import React, { useState, useEffect, useCallback } from 'react';
import { Leaf, Droplets, Thermometer, CloudRain, AlertTriangle, CheckCircle, Activity, Wind, CloudLightning, Clock, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const DashboardProduct = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async (generateFresh = false) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      if (generateFresh) {
        await fetch("http://localhost:5000/api/sensor/generate", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` }
        });
      }

      const res = await fetch("http://localhost:5000/api/sensor", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      let json = await res.json();

      // Fallback to latest endpoint if dashboard payload is unavailable
      if (!json?.latest) {
        const latestRes = await fetch("http://localhost:5000/api/sensor/latest", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const latestJson = await latestRes.json();
        json = {
          success: latestJson?.success,
          latest: latestJson?.latest,
          avgMoisture: latestJson?.latest?.avgMoisture ?? 0,
          alerts: latestJson?.latest?.alerts || [],
          recommendations: latestJson?.latest?.irrigation
            ? [{
                title: "Irrigation Recommendation",
                action: latestJson.latest.irrigation.message,
                description: `Suggested water percentage: ${latestJson.latest.irrigation.percent}%`
              }]
            : []
        };
      }

      if (json?.latest && (json.latest.avgMoisture ?? 0) === 0 && !generateFresh) {
        await fetch("http://localhost:5000/api/sensor/generate", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` }
        });
        return fetchDashboardData(true);
      }

      if (json?.latest) {
        setData(json);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    return () => clearInterval(timer);
  }, [fetchDashboardData]);

  // 🧠 Smart Multi-Sensor Fusion & AI Decision Logic (Live DB Sync)
  useEffect(() => {
    if (!data || !data.latest) return;
    const { latest } = data;
    const currentTemp = latest.temperature ?? latest.airTemperature ?? 0;
    const currentHumidity = latest.humidity ?? latest.airHumidity ?? 0;
    const zone1 = latest.zone1 ?? latest.moisture_zone1 ?? 0;
    const zone2 = latest.zone2 ?? latest.moisture_zone2 ?? 0;
    const zone3 = latest.zone3 ?? latest.moisture_zone3 ?? 0;
    const zone4 = latest.zone4 ?? latest.moisture_zone4 ?? 0;
    
    // Predictive Insights Logic (Mathematical Estimation)
    const tempFactor = currentTemp > 30 ? (currentTemp - 30) * 0.5 : 0;
    const humidityFactor = currentHumidity < 40 ? (40 - currentHumidity) * 0.2 : 0;
    const dryingRate = (0.5 + parseFloat(tempFactor || 0) + parseFloat(humidityFactor || 0)).toFixed(1);
    const avgMoistureVal = (zone1 + zone2 + zone3 + zone4) / 4;
    const hoursToDry = Math.max(0, (avgMoistureVal - 30) / dryingRate).toFixed(1);

    setPrediction({
      dryingRate,
      hoursToDry,
      status: hoursToDry < 5 ? "Critical Trend" : "Optimal Trend",
      color: hoursToDry < 5 ? "text-red-600" : "text-emerald-600"
    });
  }, [data]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!data || !data.latest) {
    return <div className="text-center p-6 text-gray-500">No sensor data available. System booting up...</div>;
  }

  const { latest, avgMoisture, alerts = [], recommendations = [] } = data;
  const moistureStatus = latest.moistureStatus || (avgMoisture < 30 ? "Dry" : avgMoisture <= 60 ? "Normal" : "Wet");

  // Extract smart decision from backend recommendations (take the first one as primary)
  const primaryRec = recommendations.length > 0 ? recommendations[0] : { action: "System Stable", description: "No immediate action required.", title: "Stable" };
  const decisionColor = primaryRec.action.includes('Irrigat') || primaryRec.action.includes('Water') 
    ? "bg-orange-100 text-orange-800 border-orange-200"
    : primaryRec.action.includes('Rain') || primaryRec.action.includes('Pause')
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : "bg-emerald-100 text-emerald-800 border-emerald-200";

  // UI Helper for Zone Cards
  const getZoneStatus = (moisture) => {
    if (moisture < 30) return { color: "text-orange-600", bg: "bg-orange-50", icon: <AlertTriangle size={24} /> };
    if (moisture > 60) return { color: "text-blue-600", bg: "bg-blue-50", icon: <Droplets size={24} /> };
    return { color: "text-emerald-600", bg: "bg-emerald-50", icon: <CheckCircle size={24} /> };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* HEADER SECTION */}
      <div className="mb-8 bg-gradient-to-r from-emerald-100 via-green-50 to-lime-100 border border-emerald-200 rounded-2xl p-5">
        <h1 className="text-3xl font-bold text-green-900 mb-2">Smart Farm Overview</h1>
        <p className="text-green-700">Decision overview with real-time insights, recommendations, and alerts.</p>
        <p className="text-xs text-emerald-700 mt-2 font-medium">
          Last updated: {lastUpdated || "Syncing..."} (auto-refresh every 30s)
        </p>
      </div>

      {/* COMPONENT 1: 4-ZONE SOIL MOISTURE GRID */}
      <div>
        <h2 className="text-sm font-bold text-green-600 tracking-wider uppercase mb-4 flex items-center">
          <Leaf size={16} className="mr-2" /> Live Soil Layout Data
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((zone) => {
            const moisture = latest[`zone${zone}`] ?? latest[`moisture_zone${zone}`];
            const status = getZoneStatus(moisture);
            return (
              <div key={zone} className={`p-5 rounded-2xl border transition-all hover:shadow-md ${status.bg} border-white shadow-sm`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700">Zone {zone}</span>
                  <span className={status.color}>{status.icon}</span>
                </div>
                <div className="flex items-baseline">
                  <span className={`text-4xl font-bold ${status.color}`}>{moisture}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 font-medium">Volumetric Water Content</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* SUB-HEADER: AVERAGE MOISTURE */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-4 flex items-center justify-between border border-green-100 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white rounded-full text-emerald-600 shadow-sm">
            <Activity size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-emerald-900">{avgMoisture}%</h3>
            <span className="text-sm text-emerald-700 font-medium">Average Moisture - {moistureStatus}</span>
          </div>
        </div>
        <button onClick={() => fetchDashboardData(true)} className="text-sm border border-emerald-300 px-3 py-1 rounded bg-white text-emerald-700 font-medium hover:bg-emerald-100 transition">
          Refresh Sensors
        </button>
        <Link to="/user/soil" className="text-sm font-semibold text-emerald-600 hover:text-emerald-800 hover:underline">
          View Detailed Analytics &rarr;
        </Link>
      </div>

      {/* COMPONENT 2: ENVIRONMENT & WEATHER */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Temperature */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 font-medium text-sm">Temperature</span>
            <Thermometer size={20} className="text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{latest.temperature ?? latest.airTemperature}°C</p>
        </div>

        {/* Humidity */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 font-medium text-sm">Humidity</span>
            <Wind size={20} className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{latest.humidity ?? latest.airHumidity}%</p>
        </div>

        {/* Tank Level */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 font-medium text-sm">Tank Level</span>
            <Droplets size={20} className={latest.tankLevel < 30 ? "text-red-500" : "text-blue-500"} />
          </div>
          <p className="text-3xl font-bold text-gray-800">{latest.tankLevel}%</p>
        </div>

        {/* Rain Status */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 font-medium text-sm">Precipitation</span>
            <CloudRain size={20} className={latest.rain || latest.isRaining ? "text-blue-600" : "text-gray-400"} />
          </div>
          <p className="text-xl font-bold text-gray-800">
            {latest.rain || latest.isRaining ? "Rain detected" : "No rain"}
          </p>
        </div>
      </div>

      {/* COMPONENT 3: SMART IRRIGATION RECOMMENDATION & PREDICTIVE INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 p-6 rounded-2xl border shadow-sm ${decisionColor}`}>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2 flex items-center text-current opacity-80">
            <CloudLightning size={18} className="mr-2" /> AI Decision Intelligence: {primaryRec.title}
          </h2>
          <h3 className="text-2xl font-bold mb-2">{primaryRec.action}</h3>
          <p className="font-medium opacity-90">{primaryRec.description}</p>
        </div>

        {prediction && (
          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center text-emerald-700">
              <TrendingUp size={18} className="mr-2" /> Predictive Insights
            </h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 font-medium">Est. Drying Rate: <span className="text-gray-900">{prediction.dryingRate}% / hr</span></p>
              <div className="flex items-center space-x-2">
                <Clock size={16} className={prediction.color} />
                <p className="text-lg font-bold">
                  Dry in <span className={prediction.color}>{prediction.hoursToDry} hours</span>
                </p>
              </div>
              <p className="text-xs text-gray-500 italic">Based on current Heat Index and Moisture trends.</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Soil Health Analysis</h2>
        <p className="text-gray-700">
          pH: <span className="font-semibold">{latest.ph}</span> -{" "}
          <span className="font-semibold capitalize">{latest.phAnalysis?.category || "optimal"}</span>
        </p>
        <p className="text-sm text-gray-600 mt-1">{latest.phAnalysis?.recommendation}</p>
      </div>

      {/* COMPONENT 4: ACTIVE ALERTS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <AlertTriangle size={20} className="text-orange-500 mr-2" /> Active Alerts
          </h2>
          <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
            {alerts.length} Issues
          </span>
        </div>
        
        {alerts.length === 0 ? (
          <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-center font-medium">
            <CheckCircle size={18} className="mr-2" /> System is running perfectly. No Active Alerts.
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, idx) => (
              <div key={alert.adminAlertId || `sensor-${idx}-${alert.title}`} className={`p-4 rounded-xl border flex items-start ${
                alert.type === 'critical' ? 'bg-red-50 border-red-200 text-red-800' :
                alert.type === 'warning' ? 'bg-orange-50 border-orange-200 text-orange-800' :
                'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                <div className="mt-0.5 mr-3">
                  {alert.type === 'critical' ? <AlertTriangle size={18} /> : 
                   alert.type === 'warning' ? <Activity size={18} /> : <CloudRain size={18} />}
                </div>
                <div>
                  <div className="font-semibold text-sm">{alert.title}</div>
                  <div className="opacity-90">{alert.message}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default DashboardProduct;
