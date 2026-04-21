import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Line, Bar, Doughnut, PolarArea } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from "chart.js";
import {
  Droplets,
  Thermometer,
  Wind,
  Cloud,
  AlertTriangle,
  TrendingUp,
  Activity,
  Zap,
  Settings,
  Bell,
  Leaf,
  Sun,
  CloudRain,
  Power,
  PowerOff,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
);

const DashboardEnhanced = () => {
  const navigate = useNavigate();
  const [sensorData, setSensorData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [irrigationStatus, setIrrigationStatus] = useState({
    automatic: true,
    isRunning: false,
    lastRun: null,
    nextRun: null
  });
  const [realTimeData, setRealTimeData] = useState({
    moisture: 45,
    temperature: 28,
    humidity: 65,
    tankLevel: 75,
    ph: 6.8,
    isRaining: false
  });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // Update every 10 seconds
    const realTimeInterval = setInterval(simulateRealTimeData, 2000); // Update every 2 seconds

    return () => {
      clearInterval(interval);
      clearInterval(realTimeInterval);
    };
  }, [navigate]);

  const simulateRealTimeData = () => {
    setRealTimeData(prev => ({
      moisture: Math.max(20, Math.min(80, prev.moisture + (Math.random() - 0.5) * 5)),
      temperature: Math.max(15, Math.min(45, prev.temperature + (Math.random() - 0.5) * 2)),
      humidity: Math.max(30, Math.min(95, prev.humidity + (Math.random() - 0.5) * 3)),
      tankLevel: Math.max(10, Math.min(100, prev.tankLevel + (Math.random() - 0.5) * 2)),
      ph: Math.max(5.5, Math.min(8.5, prev.ph + (Math.random() - 0.5) * 0.2)),
      isRaining: Math.random() > 0.9
    }));
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sensor`, {
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

  const toggleIrrigation = async () => {
    try {
      const newStatus = !irrigationStatus.isRunning;
      setIrrigationStatus(prev => ({ ...prev, isRunning: newStatus }));
      
      // Simulate API call
      setTimeout(() => {
        setIrrigationStatus(prev => ({
          ...prev,
          isRunning: newStatus,
          lastRun: newStatus ? new Date() : prev.lastRun,
          nextRun: newStatus ? null : new Date(Date.now() + 2 * 60 * 60 * 1000)
        }));
        
        addNotification({
          type: newStatus ? 'success' : 'info',
          title: newStatus ? 'Irrigation Started' : 'Irrigation Stopped',
          message: newStatus ? 'Water pump activated successfully' : 'Water pump deactivated'
        });
      }, 500);
    } catch (error) {
      console.error("Error toggling irrigation:", error);
    }
  };

  const toggleMode = () => {
    setIrrigationStatus(prev => ({ ...prev, automatic: !prev.automatic }));
    addNotification({
      type: 'info',
      title: 'Mode Changed',
      message: `Switched to ${!irrigationStatus.automatic ? 'Automatic' : 'Manual'} mode`
    });
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 5));
  };

  const getLatestData = () => {
    return sensorData[0] || {};
  };

  const getAlertColor = (type) => {
    switch (type) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "warning": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "info": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case "irrigation": return <Droplets size={20} />;
      case "temperature": return <Thermometer size={20} />;
      case "humidity": return <Wind size={20} />;
      default: return <Activity size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your farm dashboard...</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: sensorData.slice(0, 10).reverse().map((_, index) => `${index + 1}h ago`),
    datasets: [
      {
        label: 'Moisture %',
        data: sensorData.slice(0, 10).reverse().map(d => d.moisture_zone1),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Temperature °C',
        data: sensorData.slice(0, 10).reverse().map(d => d.airTemperature),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4
      },
      {
        label: 'Humidity %',
        data: sensorData.slice(0, 10).reverse().map(d => d.airHumidity),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4
      }
    ]
  };

  const polarData = {
    labels: ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4'],
    datasets: [{
      label: 'Soil Moisture',
      data: [
        realTimeData.moisture,
        realTimeData.moisture + 5,
        realTimeData.moisture - 8,
        realTimeData.moisture + 2
      ],
      backgroundColor: [
        'rgba(34, 197, 94, 0.5)',
        'rgba(59, 130, 246, 0.5)',
        'rgba(168, 85, 247, 0.5)',
        'rgba(251, 146, 60, 0.5)'
      ],
      borderWidth: 2,
      borderColor: [
        'rgb(34, 197, 94)',
        'rgb(59, 130, 246)',
        'rgb(168, 85, 247)',
        'rgb(251, 146, 60)'
      ]
    }]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Leaf className="text-green-600 mr-3" size={32} />
                Smart Farm Dashboard
              </h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-3 bg-green-100 rounded-lg hover:bg-green-200 transition-colors">
                <Bell size={20} className="text-green-600" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>
              <button className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Settings size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Droplets className="text-blue-600 mr-2" size={24} />
              <h3 className="font-semibold text-gray-700">Soil Moisture</h3>
            </div>
            <span className="text-2xl font-bold text-blue-600">{realTimeData.moisture.toFixed(1)}%</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <TrendingUp className="mr-1" size={16} />
            <span>+2.3% from yesterday</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100 transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Thermometer className="text-orange-600 mr-2" size={24} />
              <h3 className="font-semibold text-gray-700">Temperature</h3>
            </div>
            <span className="text-2xl font-bold text-orange-600">{realTimeData.temperature.toFixed(1)}°C</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Sun className="mr-1" size={16} />
            <span>Optimal range</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100 transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Wind className="text-green-600 mr-2" size={24} />
              <h3 className="font-semibold text-gray-700">Humidity</h3>
            </div>
            <span className="text-2xl font-bold text-green-600">{realTimeData.humidity.toFixed(1)}%</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Cloud className="mr-1" size={16} />
            <span>{realTimeData.isRaining ? 'Raining' : 'Clear'}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Activity className="text-purple-600 mr-2" size={24} />
              <h3 className="font-semibold text-gray-700">pH Level</h3>
            </div>
            <span className="text-2xl font-bold text-purple-600">{realTimeData.ph.toFixed(1)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Zap className="mr-1" size={16} />
            <span>Neutral soil</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-cyan-100 transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Droplets className="text-cyan-600 mr-2" size={24} />
              <h3 className="font-semibold text-gray-700">Tank Level</h3>
            </div>
            <span className="text-2xl font-bold text-cyan-600">{realTimeData.tankLevel.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${realTimeData.tankLevel}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <Activity className="mr-2 text-green-600" size={24} />
            Real-time Trends
          </h3>
          <Line data={chartData} options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                mode: 'index',
                intersect: false,
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100
              }
            }
          }} />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <Droplets className="mr-2 text-blue-600" size={24} />
            Zone Moisture
          </h3>
          <PolarArea data={polarData} options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
              }
            },
            scales: {
              r: {
                beginAtZero: true,
                max: 100
              }
            }
          }} />
        </div>
      </div>

      {/* Irrigation Control */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <Power className="mr-2 text-blue-600" size={24} />
          Irrigation Control
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h4 className="font-medium text-gray-700">Mode</h4>
                <p className="text-sm text-gray-500">
                  {irrigationStatus.automatic ? 'Automatic' : 'Manual'}
                </p>
              </div>
              <button
                onClick={toggleMode}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Switch
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h4 className="font-medium text-gray-700">Status</h4>
                <p className="text-sm text-gray-500">
                  {irrigationStatus.isRunning ? 'Running' : 'Stopped'}
                </p>
              </div>
              <button
                onClick={toggleIrrigation}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                  irrigationStatus.isRunning 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {irrigationStatus.isRunning ? (
                  <>
                    <PowerOff size={16} className="mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Power size={16} className="mr-2" />
                    Start
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <h4 className="font-medium text-blue-800 mb-2">Last Run</h4>
              <p className="text-sm text-blue-600">
                {irrigationStatus.lastRun 
                  ? new Date(irrigationStatus.lastRun).toLocaleString()
                  : 'No recent activity'
                }
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-xl">
              <h4 className="font-medium text-green-800 mb-2">Next Scheduled</h4>
              <p className="text-sm text-green-600">
                {irrigationStatus.nextRun 
                  ? new Date(irrigationStatus.nextRun).toLocaleString()
                  : 'Manual mode'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <AlertTriangle className="mr-2 text-red-600" size={24} />
            Smart Alerts
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {alerts.length > 0 ? alerts.map((alert, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getAlertColor(alert.type)} animate-pulse`}>
                <div className="flex items-start">
                  <AlertTriangle className="mr-3 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm mt-1">{alert.message}</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-500 py-8">
                <CloudRain size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No active alerts</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <TrendingUp className="mr-2 text-green-600" size={24} />
            AI Recommendations
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recommendations.length > 0 ? recommendations.map((rec, index) => (
              <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                <div className="flex items-start">
                  <div className="mr-3 mt-1 text-green-600">
                    {getRecommendationIcon(rec.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{rec.message}</p>
                    {rec.action && (
                      <button className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium">
                        Take Action →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-500 py-8">
                <Activity size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No recommendations at this time</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardEnhanced;
