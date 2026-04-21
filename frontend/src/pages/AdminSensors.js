import { useState, useEffect, useCallback } from "react";
import {
  Cpu, Thermometer, Droplets, Wifi, WifiOff,
  Activity, Database, Clock, AlertTriangle, CheckCircle
} from "lucide-react";

const SensorCard = ({ label, value, unit, icon: Icon, color, status }) => (
  <div className={`bg-white rounded-2xl p-5 border shadow-sm transition-transform hover:-translate-y-0.5
    ${status === 'critical' ? 'border-red-200 shadow-red-50' :
      status === 'warning' ? 'border-yellow-200 shadow-yellow-50' : 'border-gray-100'}`}>
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      <div className={`p-2 rounded-lg ${
        status === 'critical' ? 'bg-red-100 text-red-500' :
        status === 'warning' ? 'bg-yellow-100 text-yellow-500' :
        `${color}`}`}>
        <Icon size={16} />
      </div>
    </div>
    <p className={`text-3xl font-black ${
      status === 'critical' ? 'text-red-600' :
      status === 'warning' ? 'text-yellow-600' : 'text-gray-800'}`}>
      {value}<span className="text-lg font-medium text-gray-400 ml-1">{unit}</span>
    </p>
    {status && (
      <span className={`mt-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full
        ${status === 'critical' ? 'bg-red-100 text-red-700' :
          status === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
        {status === 'critical' ? 'Critical' : status === 'warning' ? 'Warning' : 'Normal'}
      </span>
    )}
  </div>
);

const fmt = (v) => (v == null || Number.isNaN(Number(v)) ? "—" : v);

const AdminSensors = () => {
  const [sensorRows, setSensorRows] = useState([]);
  const [selectedUser, setSelectedUser] = useState(0);
  const [liveUpdate, setLiveUpdate] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const fetchRows = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/sensor-data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const seen = new Set();
      const rows = (data.data || [])
        .map((row) => {
          const uid = row.userId?._id || row.userId;
          const hasReading = row.hasReading !== false && row.createdAt != null;
          return {
            userId: uid,
            userName: row.userId?.name || "Farmer",
            hasReading,
            airTemperature: hasReading ? (row.temperature ?? row.airTemperature ?? 0) : null,
            airHumidity: hasReading ? (row.humidity ?? row.airHumidity ?? 0) : null,
            moisture_zone1: hasReading ? (row.zone1 ?? row.moisture_zone1 ?? 0) : null,
            moisture_zone2: hasReading ? (row.zone2 ?? row.moisture_zone2 ?? 0) : null,
            moisture_zone3: hasReading ? (row.zone3 ?? row.moisture_zone3 ?? 0) : null,
            moisture_zone4: hasReading ? (row.zone4 ?? row.moisture_zone4 ?? 0) : null,
            tankLevel: hasReading ? (row.tankLevel ?? 0) : null,
            ph: hasReading ? (row.ph ?? 0) : null,
            updatedAt: row.createdAt,
          };
        })
        .filter((r) => {
          const k = String(r.userId ?? "");
          if (!k || seen.has(k)) return false;
          seen.add(k);
          return true;
        });
      rows.sort((a, b) => (a.userName || "").localeCompare(b.userName || "", undefined, { sensitivity: "base" }));
      setSensorRows(rows);
      setLastUpdate(new Date());
    } catch {
      setSensorRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  useEffect(() => {
    if (!liveUpdate) return;
    const interval = setInterval(fetchRows, 10000);
    return () => clearInterval(interval);
  }, [liveUpdate, fetchRows]);

  useEffect(() => {
    setSelectedUser((i) => {
      if (!sensorRows.length) return 0;
      return Math.min(Math.max(0, i), sensorRows.length - 1);
    });
  }, [sensorRows.length]);

  const current = sensorRows[selectedUser] || sensorRows[0];

  const getMoistureStatus = (v) => v == null ? null : v < 25 ? 'critical' : v < 40 ? 'warning' : 'normal';
  const getTempStatus = (v) => v == null ? null : v > 38 || v < 15 ? 'critical' : v > 34 ? 'warning' : 'normal';
  const getTankStatus = (v) => v == null ? null : v < 15 ? 'critical' : v < 30 ? 'warning' : 'normal';

  if (loading) {
    return <div className="text-gray-500">Loading sensor monitoring...</div>;
  }

  if (!sensorRows.length) {
    return <div className="text-gray-500">No registered farmers to monitor.</div>;
  }

  if (!current) {
    return <div className="text-gray-500">No sensor data available for users.</div>;
  }

  return (
    <div>
      <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Cpu className="text-green-600" size={26} /> Sensor Monitoring
            </h1>
            <p className="text-gray-500 text-sm mt-1">Real-time IoT sensor data for all registered farmers.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
              <Clock size={14} />
              {lastUpdate.toLocaleTimeString()}
            </div>
            <button
              type="button"
              onClick={() => setLiveUpdate(v => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
                ${liveUpdate ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            >
              {liveUpdate ? <Wifi size={16} /> : <WifiOff size={16} />}
              {liveUpdate ? 'Live' : 'Paused'}
            </button>
          </div>
        </div>

        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {sensorRows.map((row, i) => (
            <button
              key={String(row.userId)}
              type="button"
              onClick={() => setSelectedUser(i)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${selectedUser === i
                  ? 'bg-green-600 text-white shadow-md shadow-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {row.userName}
              {!row.hasReading && <span className="ml-1 opacity-70 text-[10px]">(no data)</span>}
            </button>
          ))}
        </div>
      </div>

      {liveUpdate && (
        <div className="flex items-center gap-2 mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2 w-fit">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live monitoring active — auto-refreshing every 10s
        </div>
      )}

      {!current.hasReading ? (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-8 text-center text-amber-900">
          <p className="font-semibold">No sensor readings yet for {current.userName}.</p>
          <p className="text-sm mt-2 text-amber-800/90">This farmer is registered but has no IoT data in the database.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            <SensorCard label="Temperature" value={fmt(current.airTemperature)} unit="°C"
              icon={Thermometer} color="bg-orange-100 text-orange-500"
              status={getTempStatus(current.airTemperature)} />
            <SensorCard label="Humidity" value={fmt(current.airHumidity)} unit="%"
              icon={Activity} color="bg-blue-100 text-blue-500"
              status={current.airHumidity == null ? null : current.airHumidity < 35 || current.airHumidity > 85 ? 'warning' : 'normal'} />
            <SensorCard label="Tank Level" value={fmt(current.tankLevel)} unit="%"
              icon={Database} color="bg-cyan-100 text-cyan-500"
              status={getTankStatus(current.tankLevel)} />
            <SensorCard label="Soil pH" value={fmt(current.ph)} unit=""
              icon={CheckCircle} color="bg-purple-100 text-purple-500"
              status={current.ph == null ? null : current.ph < 5.5 || current.ph > 7.5 ? 'warning' : 'normal'} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Droplets className="text-blue-500" size={20} /> 4-Zone Soil Moisture
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(zone => {
                const val = current[`moisture_zone${zone}`];
                const status = getMoistureStatus(val);
                const pct = val == null ? 0 : val;
                return (
                  <div key={zone} className={`rounded-xl p-4 border-2 transition-all
                    ${status === 'critical' ? 'border-red-200 bg-red-50' :
                      status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                      status == null ? 'border-gray-200 bg-gray-50' : 'border-green-200 bg-green-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-600">Zone {zone}</span>
                      {status === 'critical'
                        ? <AlertTriangle size={14} className="text-red-500" />
                        : <CheckCircle size={14} className="text-green-500" />}
                    </div>
                    <p className={`text-3xl font-black ${
                      status === 'critical' ? 'text-red-700' :
                      status === 'warning' ? 'text-yellow-700' :
                      status == null ? 'text-gray-500' : 'text-green-700'}`}>
                      {fmt(val)}<span className="text-sm font-medium ml-0.5">%</span>
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          status === 'critical' ? 'bg-red-500' :
                          status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className={`text-xs font-semibold mt-1.5 ${
                      status === 'critical' ? 'text-red-600' :
                      status === 'warning' ? 'text-yellow-600' :
                      status == null ? 'text-gray-500' : 'text-green-600'}`}>
                      {status == null ? 'No data' :
                        status === 'critical' ? 'Dry — Irrigate Now' :
                        status === 'warning' ? 'Low — Monitor' : 'Optimal'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800">All Farmer Sensor Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Farmer", "Temp (°C)", "Humidity (%)", "Avg Moisture (%)", "Tank (%)", "pH", "Status"].map(h => (
                  <th key={h} className="py-2.5 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sensorRows.map((row, i) => {
                const avgMoisture = row.hasReading
                  ? ((row.moisture_zone1 + row.moisture_zone2 + row.moisture_zone3 + row.moisture_zone4) / 4).toFixed(1)
                  : null;
                const hasAlert = row.hasReading && (
                  row.tankLevel < 20 || parseFloat(avgMoisture) < 30 || row.airTemperature > 38
                );
                return (
                  <tr key={String(row.userId)} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedUser(i)}>
                    <td className="py-3 px-4 font-medium text-gray-800">{row.userName}</td>
                    <td className="py-3 px-4 text-gray-600">{fmt(row.airTemperature)}</td>
                    <td className="py-3 px-4 text-gray-600">{fmt(row.airHumidity)}</td>
                    <td className="py-3 px-4 text-gray-600">{avgMoisture == null ? "—" : avgMoisture}</td>
                    <td className="py-3 px-4 text-gray-600">{fmt(row.tankLevel)}</td>
                    <td className="py-3 px-4 text-gray-600">{fmt(row.ph)}</td>
                    <td className="py-3 px-4">
                      {!row.hasReading ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                          No data
                        </span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                          ${hasAlert ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {hasAlert ? 'Alert' : 'Normal'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSensors;
