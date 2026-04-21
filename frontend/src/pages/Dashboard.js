import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [sensorData, setSensorData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sensor`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      setSensorData(data.data || []);
      setAlerts(data.alerts || []);
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLatestData = () => {
    if (!sensorData.length) return null;
    return sensorData[0];
  };

  const latestData = getLatestData();

  const chartData = {
    labels: sensorData.slice(0, 10).reverse().map((_, index) => `T-${9 - index}`),
    datasets: [
      {
        label: "Soil Moisture (%)",
        data: sensorData.slice(0, 10).reverse().map(d => d.moisture_zone1),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
      {
        label: "Temperature (°C)",
        data: sensorData.slice(0, 10).reverse().map(d => d.airTemperature),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
      },
      {
        label: "Humidity (%)",
        data: sensorData.slice(0, 10).reverse().map(d => d.airHumidity),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Field Sensor Data Trends",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Smart Agriculture Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name || "Farmer"}!</p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Real-time Metrics */}
        {latestData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Soil Moisture</p>
                  <p className="text-2xl font-bold text-blue-600">{latestData.moisture_zone1}%</p>
                </div>
                <div className="text-3xl"> drops</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Temperature</p>
                  <p className="text-2xl font-bold text-red-600">{latestData.airTemperature}°C</p>
                </div>
                <div className="text-3xl"> temperature</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Humidity</p>
                  <p className="text-2xl font-bold text-green-600">{latestData.airHumidity}%</p>
                </div>
                <div className="text-3xl"> water</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Tank Level</p>
                  <p className="text-2xl font-bold text-purple-600">{latestData.tankLevel}%</p>
                </div>
                <div className="text-3xl"> tank</div>
              </div>
            </div>
          </div>
        )}

        {/* Charts and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Sensor Trends</h2>
            <div className="h-64">
              {sensorData.length > 0 ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No sensor data available
                </div>
              )}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Smart Alerts</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {alerts.length > 0 ? (
                alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      alert.type === "critical"
                        ? "bg-red-50 border-red-500"
                        : alert.type === "warning"
                        ? "bg-yellow-50 border-yellow-500"
                        : "bg-blue-50 border-blue-500"
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-2">
                        {alert.type === "critical" ? " warning" : alert.type === "warning" ? " alert" : " info"}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-800">{alert.title}</p>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No active alerts
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">AI Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2"> lightbulb</span>
                    <h3 className="font-semibold text-gray-800">{rec.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                  {rec.action && (
                    <button className="mt-2 bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded transition-colors">
                      {rec.action}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/disease")}
              className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors text-center"
            >
              <div className="text-2xl mb-1"> leaf</div>
              <p className="text-sm">Disease Detection</p>
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors text-center">
              <div className="text-2xl mb-1"> settings</div>
              <p className="text-sm">Crop Settings</p>
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-colors text-center">
              <div className="text-2xl mb-1"> history</div>
              <p className="text-sm">View History</p>
            </button>
            <button className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-lg transition-colors text-center">
              <div className="text-2xl mb-1"> phone</div>
              <p className="text-sm">Get Support</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Dashboard;
