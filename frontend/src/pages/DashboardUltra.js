import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../components/NotificationSystemFixed";
import DarkModeToggle from "../components/DarkModeToggle";
import DataExport from "../components/DataExport";
import {
  Droplets,
  Thermometer,
  Wind,
  Sun,
  Cloud,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  Users,
  Settings,
  LogOut,
  Bell,
  Download,
  RefreshCw,
  Zap,
  Wifi,
  WifiOff
} from "lucide-react";

const DashboardUltra = () => {
  const navigate = useNavigate();
  const { notificationTypes } = useNotifications();
  const [sensorData, setSensorData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    // Check online status
    const handleOnline = () => {
      setIsOnline(true);
      notificationTypes.system("Connection restored", "online");
    };

    const handleOffline = () => {
      setIsOnline(false);
      notificationTypes.system("Connection lost", "offline");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    fetchDashboardData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      fetchDashboardData();
      setLastUpdate(new Date());
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await  fetch(`${process.env.REACT_APP_API_URL}/api/sensor`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSensorData(data.data || []);
        setAlerts(data.alerts || []);
        setRecommendations(data.recommendations || []);

        // Check for critical alerts
        if (data.alerts && data.alerts.length > 0) {
          const criticalAlerts = data.alerts.filter(alert => alert.severity === 'critical');
          criticalAlerts.forEach(alert => {
            notificationTypes.sensor(alert.message, alert.type, alert.value);
          });
        }

        // Show success notification for data update
        if (sensorData.length > 0) {
          notificationTypes.success("Dashboard data updated successfully");
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      notificationTypes.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    notificationTypes.info("Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getMoistureColor = (value) => {
    if (value < 30) return "text-red-600";
    if (value < 50) return "text-yellow-600";
    return "text-green-600";
  };

  const getTemperatureColor = (value) => {
    if (value < 15 || value > 35) return "text-red-600";
    if (value < 18 || value > 32) return "text-yellow-600";
    return "text-green-600";
  };

  const getHumidityColor = (value) => {
    if (value < 40 || value > 80) return "text-red-600";
    if (value < 50 || value > 70) return "text-yellow-600";
    return "text-green-600";
  };

  const mockSensorData = {
    temperature: 28.5,
    humidity: 65,
    soilMoisture: 45,
    ph: 6.8,
    rainfall: 2.5,
    zone1: { moisture: 42, temperature: 27, humidity: 68 },
    zone2: { moisture: 48, temperature: 29, humidity: 62 },
    zone3: { moisture: 38, temperature: 30, humidity: 70 }
  };

  const currentData = sensorData.length > 0 ? sensorData[0] : mockSensorData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-green-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
                <Activity className="text-green-600 mr-3" size={32} />
                Smart Agriculture Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time monitoring and control system
              </p>
              <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center mr-4">
                  {isOnline ? (
                    <Wifi className="mr-1 text-green-600" size={16} />
                  ) : (
                    <WifiOff className="mr-1 text-red-600" size={16} />
                  )}
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <DarkModeToggle />
              <button
                onClick={() => setShowExportModal(true)}
                className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                <Download size={20} className="text-blue-600 dark:text-blue-400" />
              </button>
              <button
                onClick={fetchDashboardData}
                className="p-3 bg-green-100 dark:bg-green-900 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
              >
                <RefreshCw size={20} className="text-green-600 dark:text-green-400" />
              </button>
              <button
                onClick={() => navigate("/monitoring")}
                className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
              >
                <Activity size={20} className="text-purple-600 dark:text-purple-400" />
              </button>
              <button
                onClick={handleLogout}
                className="p-3 bg-red-100 dark:bg-red-900 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              >
                <LogOut size={20} className="text-red-600 dark:text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sensor Data Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Real-time Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-green-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Temperature</h3>
                <Thermometer className={getTemperatureColor(currentData.temperature)} size={24} />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {currentData.temperature}°C
              </div>
              <div className="flex items-center mt-2">
                {currentData.temperature > 25 ? (
                  <TrendingUp className="text-red-500 mr-1" size={16} />
                ) : (
                  <TrendingDown className="text-blue-500 mr-1" size={16} />
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentData.temperature > 25 ? 'High' : 'Normal'}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-green-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Humidity</h3>
                <Droplets className={getHumidityColor(currentData.humidity)} size={24} />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {currentData.humidity}%
              </div>
              <div className="flex items-center mt-2">
                {currentData.humidity > 60 ? (
                  <TrendingUp className="text-blue-500 mr-1" size={16} />
                ) : (
                  <TrendingDown className="text-orange-500 mr-1" size={16} />
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentData.humidity > 60 ? 'High' : 'Optimal'}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-green-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Soil Moisture</h3>
                <Droplets className={getMoistureColor(currentData.soilMoisture)} size={24} />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {currentData.soilMoisture}%
              </div>
              <div className="flex items-center mt-2">
                {currentData.soilMoisture < 40 ? (
                  <AlertTriangle className="text-red-500 mr-1" size={16} />
                ) : (
                  <CheckCircle className="text-green-500 mr-1" size={16} />
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentData.soilMoisture < 40 ? 'Low' : 'Good'}
                </span>
              </div>
            </div>
          </div>

          {/* Zone-wise Monitoring */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-green-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Zone-wise Monitoring</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(currentData).filter(([key]) => key.startsWith('zone')).map(([zone, data]) => (
                <div key={zone} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    {zone.charAt(0).toUpperCase() + zone.slice(1)}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Moisture:</span>
                      <span className={`text-sm font-medium ${getMoistureColor(data.moisture)}`}>
                        {data.moisture}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Temperature:</span>
                      <span className={`text-sm font-medium ${getTemperatureColor(data.temperature)}`}>
                        {data.temperature}°C
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Humidity:</span>
                      <span className={`text-sm font-medium ${getHumidityColor(data.humidity)}`}>
                        {data.humidity}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts and Recommendations */}
        <div className="space-y-6">
          {/* Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-green-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
              <AlertTriangle className="text-red-600 mr-2" size={24} />
              Alerts
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {alerts.length > 0 ? alerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  alert.severity === 'critical' 
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                }`}>
                  <div className="flex items-start">
                    <AlertTriangle className={`mt-1 mr-2 flex-shrink-0 ${
                      alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
                    }`} size={16} />
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {alert.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto text-green-600 mb-2" size={32} />
                  <p className="text-gray-500 dark:text-gray-400">No active alerts</p>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-green-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
              <Zap className="text-blue-600 mr-2" size={24} />
              Recommendations
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recommendations.length > 0 ? recommendations.map((rec, index) => (
                <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start">
                    <Zap className="mt-1 mr-2 text-blue-600 flex-shrink-0" size={16} />
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {rec.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {rec.message}
                      </p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <Sun className="mx-auto text-yellow-500 mb-2" size={32} />
                  <p className="text-gray-500 dark:text-gray-400">All systems optimal</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Export Dashboard Data</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>
            <DataExport 
              data={[currentData]} 
              title="Dashboard Sensor Data"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardUltra;
