
import { useEffect, useState } from "react";
import { BarChart3, Users, Cpu, Bell, Landmark, Thermometer, Droplets, FlaskConical } from "lucide-react";

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
      const res = await  fetch(`${process.env.REACT_APP_API_URL}/api/admin/analytics`, {
  headers: { Authorization: `Bearer ${token}` },
});
        const data = await res.json();
        setAnalytics(data.analytics || null);
      } catch {
        setAnalytics(null);
      }
    };
    load();
  }, []);

  const card = (label, value, icon) => (
    <div className="bg-white border border-green-100 rounded-xl p-5">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-gray-500">{label}</p>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );

  return (
    <div className="p-6">
      <div className="bg-white border border-green-100 rounded-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="text-green-600" /> Analytics
        </h1>
        <p className="text-gray-600 mt-1">Real usage and sensor metrics across users.</p>
      </div>

      {!analytics ? (
        <div className="bg-white border border-green-100 rounded-2xl p-6 text-gray-500">Loading analytics...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {card("Total Users", analytics.totalUsers, <Users size={18} className="text-green-600" />)}
          {card("Sensor Records", analytics.totalSensors, <Cpu size={18} className="text-green-600" />)}
          {card("Open Manual Alerts", analytics.unresolvedManualAlerts, <Bell size={18} className="text-green-600" />)}
          {card("Active Schemes", analytics.totalSchemes, <Landmark size={18} className="text-green-600" />)}
          {card("Avg Temperature", `${analytics.avgTemp}°C`, <Thermometer size={18} className="text-green-600" />)}
          {card("Avg Humidity", `${analytics.avgHumidity}%`, <Droplets size={18} className="text-green-600" />)}
          {card("Avg Tank Level", `${analytics.avgTankLevel}%`, <Droplets size={18} className="text-green-600" />)}
          {card("Avg Soil pH", analytics.avgPh, <FlaskConical size={18} className="text-green-600" />)}
        </div>
      )}
    </div>
  );
}
