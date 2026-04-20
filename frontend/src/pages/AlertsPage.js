import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Bell, RefreshCw } from 'lucide-react';

const mapActiveFromApi = (raw) =>
  (raw || []).map((alert, index) => ({
    id: alert.adminAlertId || alert.persistKey || `row-${index}`,
    adminAlertId: alert.adminAlertId || null,
    persistKey: alert.persistKey || null,
    source: alert.source || 'sensor',
    type: alert.type,
    title: alert.title,
    message: alert.message,
    timeLabel: alert.createdAt
      ? new Date(alert.createdAt).toLocaleString()
      : 'Just now',
  }));

const mapResolvedFromApi = (raw) =>
  (raw || []).map((alert, index) => ({
    id: `resolved-admin-${alert.adminAlertId || index}`,
    adminAlertId: alert.adminAlertId || null,
    source: 'admin',
    type: alert.type,
    title: alert.title,
    message: alert.message,
    timeLabel: (alert.resolvedAt || alert.updatedAt || alert.createdAt)
      ? new Date(alert.resolvedAt || alert.updatedAt || alert.createdAt).toLocaleString()
      : '',
  }));

const AlertsPage = () => {
  const [rawActiveAlerts, setRawActiveAlerts] = useState([]);
  const [resolvedAdminFromApi, setResolvedAdminFromApi] = useState([]);
  const [resolvedSensorItems, setResolvedSensorItems] = useState([]);
  const [dismissedSensorKeys, setDismissedSensorKeys] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [irrigationMessage, setIrrigationMessage] = useState("");

  const activeAlerts = useMemo(
    () =>
      rawActiveAlerts.filter(
        (a) => a.source !== "sensor" || !dismissedSensorKeys.includes(a.persistKey)
      ),
    [rawActiveAlerts, dismissedSensorKeys]
  );

  const fetchAlerts = useCallback(async (generateFresh = false) => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem("token");
      if (generateFresh) {
        await fetch("http://localhost:5000/api/sensor/generate", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      const response = await fetch("http://localhost:5000/api/alerts", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setRawActiveAlerts(mapActiveFromApi(data.alerts || []));
      setResolvedAdminFromApi(mapResolvedFromApi(data.resolvedAlerts || []));
      setIrrigationMessage(data?.irrigation?.message || "");
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      setRawActiveAlerts([]);
      setResolvedAdminFromApi([]);
      setIrrigationMessage("");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleResolveAlert = async (alert) => {
    const token = localStorage.getItem("token");
    if (alert.source === "admin" && alert.adminAlertId) {
      try {
        const res = await fetch(
          `http://localhost:5000/api/alerts/resolve/${encodeURIComponent(alert.adminAlertId)}`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const body = await res.json().catch(() => ({}));
        if (!res.ok || body.success === false) {
          window.alert(body.message || `Could not resolve alert (${res.status})`);
          return;
        }
      } catch (e) {
        window.alert(e.message || "Network error while resolving alert");
        return;
      }
      await fetchAlerts(false);
      return;
    }
    if (alert.source === "sensor" && alert.persistKey) {
      setDismissedSensorKeys((prev) =>
        prev.includes(alert.persistKey) ? prev : [...prev, alert.persistKey]
      );
      setResolvedSensorItems((prev) => [
        {
          id: `resolved-sensor-${alert.persistKey}`,
          source: "sensor",
          type: alert.type,
          title: alert.title,
          message: alert.message,
          timeLabel: new Date().toLocaleString(),
        },
        ...prev,
      ]);
    }
  };

  const criticalCount = activeAlerts.filter(a => a.type === 'critical').length;
  const resolvedCombined = [...resolvedAdminFromApi, ...resolvedSensorItems];

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-900 flex items-center mb-2">
              <Bell className="text-emerald-600 mr-3" size={32} />
              System Alerts
            </h1>
            <p className="text-green-700">Monitor critical farm events and system notifications.</p>
          </div>
          <button
            onClick={() => fetchAlerts(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh Alerts"}
          </button>
        </div>
      </div>

      {irrigationMessage && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 mb-6">
          <p className="text-sm text-blue-700 font-medium">{irrigationMessage}</p>
        </div>
      )}

      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Alert Center</h2>
        </div>
        <div className="flex items-center space-x-4 bg-red-50 px-6 py-4 rounded-xl border border-red-100">
           <AlertCircle className="text-red-500 w-10 h-10" />
           <div>
             <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
             <div className="text-red-800 text-sm font-medium">Critical Alerts</div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-emerald-100 overflow-hidden mb-8">
        <div className="p-4 border-b border-emerald-50 bg-emerald-50/50 flex justify-between items-center font-bold text-emerald-800">
           <span>Active alerts</span>
           <span className="text-sm text-emerald-600 font-medium">Last updated: {lastUpdated || "Just now"}</span>
        </div>
        <div className="divide-y divide-gray-100">
          {activeAlerts.map(alert => (
            <div key={alert.id} className="p-6 transition-colors hover:bg-gray-50 flex items-start justify-between">
              <div className="flex items-start">
                 <div className={`mt-1 mr-4 flex-shrink-0 p-3 rounded-full ${
                    alert.type === 'critical' ? 'bg-red-100 text-red-600' :
                    alert.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                 }`}>
                   {alert.type === 'critical' ? <AlertCircle size={24}/> :
                    alert.type === 'warning' ? <AlertTriangle size={24}/> :
                    <Bell size={24}/>}
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-gray-800">
                     {alert.title}
                   </h3>
                   <p className="text-gray-600 mt-1">{alert.message}</p>
                   <p className="text-xs text-gray-400 mt-2 flex items-center">
                      {alert.timeLabel}
                   </p>
                 </div>
              </div>
              <div>
                  <button 
                    onClick={() => handleResolveAlert(alert)}
                    className="flex items-center text-sm px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-lg hover:bg-gray-50 hover:text-green-600 transition-colors font-medium text-gray-600"
                  >
                    <CheckCircle className="mr-2" size={16} /> Mark Resolved
                  </button>
              </div>
            </div>
          ))}
          {activeAlerts.length === 0 && (
            <div className="p-8 text-center text-gray-500">No active alerts right now.</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center font-bold text-gray-800">
          <span>Resolved alerts</span>
          <span className="text-sm text-gray-500 font-medium">{resolvedCombined.length} total</span>
        </div>
        <div className="divide-y divide-gray-100">
          {resolvedCombined.map(alert => (
            <div key={alert.id} className="p-6 flex items-start justify-between opacity-90">
              <div className="flex items-start">
                <div className="mt-1 mr-4 flex-shrink-0 p-3 rounded-full bg-green-50 text-green-600">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-500 line-through">
                    {alert.title}
                  </h3>
                  <p className="text-gray-500 mt-1">{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{alert.timeLabel}</p>
                </div>
              </div>
              <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                <CheckCircle className="mr-1" size={14} /> Resolved
              </span>
            </div>
          ))}
          {resolvedCombined.length === 0 && (
            <div className="p-8 text-center text-gray-500">No resolved alerts yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;
