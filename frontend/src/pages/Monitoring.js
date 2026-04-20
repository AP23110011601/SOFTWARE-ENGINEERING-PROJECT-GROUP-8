import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Activity, 
  Server, 
  Database, 
  Cpu, 
  HardDrive, 
  Wifi, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Monitor,
  Settings,
  Download,
  Calendar,
  Users,
  Shield
} from "lucide-react";

const Monitoring = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [systemLogs, setSystemLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    
    if (!token) {
      navigate("/login");
      return;
    }

    fetchSystemHealth();
    fetchPerformanceMetrics();
    fetchSystemLogs();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchSystemHealth();
        fetchPerformanceMetrics();
      }, refreshInterval);
      
      return () => clearInterval(interval);
    };
  }, [navigate, autoRefresh, refreshInterval]);

  const fetchSystemHealth = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/monitoring/health", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setSystemHealth(data.health);
      }
    } catch (error) {
      console.error("Error fetching system health:", error);
    }
  };

  const fetchPerformanceMetrics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/monitoring/metrics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setPerformanceMetrics(data.metrics);
      }
    } catch (error) {
      console.error("Error fetching performance metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSystemLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/monitoring/logs?type=errors&limit=20", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setSystemLogs(data.logs);
      }
    } catch (error) {
      console.error("Error fetching system logs:", error);
    }
  };

  const getHealthStatusColor = (status) => {
    switch (status) {
      case "healthy": return "text-green-600 bg-green-100";
      case "warning": return "text-yellow-600 bg-yellow-100";
      case "critical": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getPerformanceColor = (value, threshold) => {
    if (value < threshold * 0.5) return "text-green-600";
    if (value < threshold) return "text-yellow-600";
    return "text-red-600";
  };

  const formatUptime = (uptime) => {
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const r = bytes % Math.pow(1024, i);
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const refreshData = () => {
    setIsLoading(true);
    fetchSystemHealth();
    fetchPerformanceMetrics();
    fetchSystemLogs();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto text-red-600 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h1>
          <p className="text-red-600">Please login to access system monitoring</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Monitor className="text-blue-600 mr-3" size={32} />
                System Monitoring
              </h1>
              <p className="text-gray-600">Real-time system performance and health metrics</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={20} className="text-blue-600" />
              </button>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-3 rounded-lg transition-colors ${
                  autoRefresh ? 'bg-green-100 hover:bg-green-200' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Clock size={20} className={autoRefresh ? 'text-green-600' : 'text-gray-600'} />
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <TrendingUp size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Health */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <Server className="text-blue-600 mr-3" size={24} />
            System Health
          </h2>
          
          {systemHealth ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Overall Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthStatusColor(systemHealth.status)}`}>
                  {systemHealth.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Uptime</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatUptime(systemHealth.uptime.days * 24 * 60 * 60 * 1000)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {systemHealth.uptime.days} days, {systemHealth.uptime.hours % 24}h
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Database</h3>
                  <div className="flex items-center">
                    <Database className={`mr-2 ${
                      systemHealth.database.status === 'connected' ? 'text-green-600' : 'text-red-600'
                    }`} size={20} />
                    <span className={`font-medium ${
                      systemHealth.database.status === 'connected' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {systemHealth.database.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {systemHealth.database.collections} collections
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Memory Usage</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      {systemHealth.system.memory.percentage}%
                    </span>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {formatBytes(systemHealth.system.memory.used)}
                      </p>
                      <p className="text-xs text-gray-500">
                        of {formatBytes(systemHealth.system.memory.total)}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${systemHealth.system.memory.percentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">CPU Usage</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      {systemHealth.system.cpu.usage}%
                    </span>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {systemHealth.system.cpu.cores} cores
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${systemHealth.system.cpu.usage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Disk Usage</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      {Math.round((systemHealth.system.disk.total - systemHealth.system.disk.free) / systemHealth.system.disk.total * 100)}%
                    </span>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {formatBytes(systemHealth.system.disk.total - systemHealth.system.disk.free)}
                      </p>
                      <p className="text-xs text-gray-500">
                        of {formatBytes(systemHealth.system.disk.total)}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((systemHealth.system.disk.total - systemHealth.system.disk.free) / systemHealth.system.disk.total * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Last Error</h3>
                  <div className="text-sm text-gray-600">
                    {systemHealth.lastError ? 
                      <span className="text-red-600">{systemHealth.lastError}</span> : 
                      <span className="text-green-600">No errors</span>
                    }
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading system health...</p>
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <Activity className="text-green-600 mr-3" size={24} />
            Performance Metrics
          </h2>
          
          {performanceMetrics ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <h3 className="font-semibold text-gray-800 mb-2">Total Requests</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {performanceMetrics.performance.totalRequests.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">All time</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <h3 className="font-semibold text-gray-800 mb-2">Avg Response Time</h3>
                  <p className={`text-2xl font-bold ${getPerformanceColor(performanceMetrics.performance.averageResponseTime, 200)}`}>
                    {performanceMetrics.performance.averageResponseTime}ms
                  </p>
                  <p className="text-sm text-gray-600">Target: &lt;200ms</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <h3 className="font-semibold text-gray-800 mb-2">Error Rate</h3>
                  <p className={`text-2xl font-bold ${getPerformanceColor(performanceMetrics.performance.errorRate, 5)}`}>
                    {performanceMetrics.performance.errorRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">Target: &lt;5%</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-4">Response Time History</h3>
                <div className="space-y-2">
                  {performanceMetrics.performance.responseTimeHistory.slice(-10).map((time, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {performanceMetrics.performance.responseTimeHistory.length - index} requests ago
                      </span>
                      <span className={`font-medium ${getPerformanceColor(time, 200)}`}>
                        {time}ms
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-4">Endpoint Performance</h3>
                <div className="space-y-3">
                  {Object.entries(performanceMetrics.endpoints).map(([endpoint, data]) => (
                    <div key={endpoint} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-3 ${
                          data.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        <span className="font-medium text-gray-800">{endpoint}</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-medium ${
                          data.status === 'active' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {data.avgResponseTime}ms
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading performance metrics...</p>
            </div>
          )}
        </div>
      </div>

      {/* System Logs */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-100 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <AlertTriangle className="text-red-600 mr-3" size={24} />
            System Logs
          </h2>
          <div className="flex items-center space-x-4">
            <select
              value="errors"
              onChange={(e) => {
                // This would typically fetch different log types
                console.log("Log type changed to:", e.target.value);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="errors">Errors</option>
              <option value="performance">Performance</option>
              <option value="all">All Logs</option>
            </select>
            <button
              onClick={() => setRefreshInterval(refreshInterval === 5000 ? 10000 : 5000)}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Settings size={16} className="text-gray-600" />
            </button>
            <button
              onClick={() => {
                const logsText = JSON.stringify(systemLogs, null, 2);
                const blob = new Blob([logsText], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `system-logs-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
              className="px-4 py-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Download size={16} className="text-blue-600" />
            </button>
          </div>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {systemLogs.length > 0 ? systemLogs.map((log, index) => (
            <div key={log.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <XCircle className="text-red-600 mr-3" size={16} />
                  <div>
                    <h4 className="font-semibold text-gray-800">{log.error}</h4>
                    <p className="text-sm text-gray-600 mt-1">{log.endpoint}</p>
                    <p className="text-xs text-gray-500">
                      {log.timestamp} - {log.userId}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
              <p className="text-gray-600">No system errors found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
