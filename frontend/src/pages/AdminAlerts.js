import { useState, useEffect, useCallback } from "react";
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle, Trash2, RefreshCw } from "lucide-react";
import { filterFarmerUsers } from "../utils/farmerAccounts";

const MOCK_ALERTS = [
  { _id: "a1", title: "Low Soil Moisture", message: "Zone 2 moisture below 25% for user Ramesh Kumar. Immediate irrigation needed.", priority: "high", category: "moisture", resolved: false, createdAt: new Date(Date.now() - 10 * 60000).toISOString(), user: "Ramesh Kumar" },
  { _id: "a2", title: "Water Tank Critical", message: "Main tank for Anita Sharma dropped below 15%. Refill required immediately.", priority: "high", category: "tank", resolved: false, createdAt: new Date(Date.now() - 30 * 60000).toISOString(), user: "Anita Sharma" },
  { _id: "a3", title: "High Temperature Alert", message: "Temperature exceeded 39°C in Suresh Patel's greenhouse. Check ventilation.", priority: "medium", category: "temperature", resolved: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), user: "Suresh Patel" },
  { _id: "a4", title: "pH Level Warning", message: "Soil pH dropped to 5.1 for Ramesh Kumar. Lime application recommended.", priority: "medium", category: "ph", resolved: false, createdAt: new Date(Date.now() - 4 * 3600000).toISOString(), user: "Ramesh Kumar" },
  { _id: "a5", title: "Weather Update", message: "Rain predicted in next 24 hours. Suggest delaying scheduled irrigation.", priority: "low", category: "weather", resolved: true, createdAt: new Date(Date.now() - 6 * 3600000).toISOString(), user: "System" },
  { _id: "a6", title: "Irrigation Completed", message: "Zone 1 irrigation completed successfully for Anita Sharma.", priority: "low", category: "irrigation", resolved: true, createdAt: new Date(Date.now() - 12 * 3600000).toISOString(), user: "Anita Sharma" },
];

const getPriorityConfig = (priority) => ({
  high:   { color: "bg-red-100 text-red-700 border-red-200", icon: <AlertCircle size={18} />, label: "High", badge: "bg-red-100 text-red-700" },
  medium: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <AlertTriangle size={18} />, label: "Medium", badge: "bg-yellow-100 text-yellow-700" },
  low:    { color: "bg-blue-100 text-blue-700 border-blue-200", icon: <Info size={18} />, label: "Low", badge: "bg-blue-100 text-blue-700" },
}[priority] || { color: "bg-gray-100 text-gray-600 border-gray-200", icon: <Bell size={18} />, label: "Info", badge: "bg-gray-100 text-gray-600" });

const timeAgo = (isoString) => {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const AdminAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all"); // all | high | medium | low | resolved
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    message: "",
    priority: "medium",
    category: "general",
    targetType: "all",
    targetUserId: "",
  });

  const fetchAlerts = useCallback(async (opts = {}) => {
    const silent = Boolean(opts && opts.silent);
    if (!silent) setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/alerts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAlerts(data.alerts || []);
      } else if (!silent) {
        setAlerts(MOCK_ALERTS);
      }
    } catch {
      if (!silent) setAlerts(MOCK_ALERTS);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(filterFarmerUsers(data.users || []));
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchAlerts();
    fetchUsers();
  }, [fetchAlerts]);

  useEffect(() => {
    const id = setInterval(() => fetchAlerts({ silent: true }), 25000);
    return () => clearInterval(id);
  }, [fetchAlerts]);

  const createAlert = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    await fetch("http://localhost:5000/api/admin/alerts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        targetUserId: form.targetType === "user" ? form.targetUserId : null,
      }),
    });
    setForm({
      title: "",
      message: "",
      priority: "medium",
      category: "general",
      targetType: "all",
      targetUserId: "",
    });
    fetchAlerts();
  };

  const handleAdminResolve = (id) => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/api/admin/alerts/${id}/resolve`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => fetchAlerts());
  };

  const handleDelete = (id) => {
    const current = alerts.find((a) => a._id === id);
    if (!current) return;
    if (current.source === "manual") {
      const token = localStorage.getItem("token");
      fetch(`http://localhost:5000/api/admin/alerts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).then(() => fetchAlerts());
      return;
    }
    setAlerts(prev => prev.filter(a => a._id !== id));
  };

  const filtered = alerts.filter(a => {
    if (filter === "resolved") return a.resolved;
    if (filter === "all") return !a.resolved;
    return !a.resolved && a.priority === filter;
  });

  const counts = {
    all: alerts.filter(a => !a.resolved).length,
    high: alerts.filter(a => !a.resolved && a.priority === "high").length,
    medium: alerts.filter(a => !a.resolved && a.priority === "medium").length,
    low: alerts.filter(a => !a.resolved && a.priority === "low").length,
    resolved: alerts.filter(a => a.resolved).length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Bell className="text-green-600" size={26} /> Alerts Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">Monitor and manage all system-wide alerts by priority.</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Summary badges */}
            <div className="flex gap-2">
              {[
                { label: "High", count: counts.high, color: "bg-red-100 text-red-700 border border-red-200" },
                { label: "Medium", count: counts.medium, color: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
                { label: "Low", count: counts.low, color: "bg-blue-100 text-blue-700 border border-blue-200" },
              ].map(s => (
                <span key={s.label} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${s.color}`}>
                  {s.count} {s.label}
                </span>
              ))}
            </div>
            <button type="button" onClick={() => fetchAlerts()} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg ml-1">
              <RefreshCw size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {[
            { key: "all", label: `All Active (${counts.all})` },
            { key: "high", label: `🔴 High (${counts.high})` },
            { key: "medium", label: `🟡 Medium (${counts.medium})` },
            { key: "low", label: `🔵 Low (${counts.low})` },
            { key: "resolved", label: `✅ Resolved (${counts.resolved})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${filter === tab.key
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={createAlert} className="mb-6 bg-white rounded-2xl shadow-sm border border-green-100 p-5 grid md:grid-cols-2 gap-3">
        <input required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Alert title" className="border rounded-lg px-3 py-2" />
        <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))} className="border rounded-lg px-3 py-2">
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="Category (e.g. irrigation)" className="border rounded-lg px-3 py-2" />
        <select value={form.targetType} onChange={(e) => setForm((p) => ({ ...p, targetType: e.target.value }))} className="border rounded-lg px-3 py-2">
          <option value="all">All Users</option>
          <option value="user">Specific User</option>
        </select>
        {form.targetType === "user" && (
          <select required value={form.targetUserId} onChange={(e) => setForm((p) => ({ ...p, targetUserId: e.target.value }))} className="border rounded-lg px-3 py-2 md:col-span-2">
            <option value="">Select user</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>{u.name} - {u.email}</option>
            ))}
          </select>
        )}
        <textarea required value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} placeholder="Alert message for users" className="border rounded-lg px-3 py-2 md:col-span-2" rows={3} />
        <button className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 text-sm font-semibold">Create User Alert</button>
      </form>

      {/* Alert list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <CheckCircle className="mx-auto text-green-400 mb-3" size={40} />
          <p className="text-gray-500 font-medium">No alerts in this category. All clear! ✓</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => {
            const cfg = getPriorityConfig(alert.priority);
            return (
              <div
                key={alert._id}
                className={`bg-white rounded-2xl border p-5 shadow-sm flex items-start gap-4
                  ${alert.resolved ? 'opacity-70' : ''}
                  transition-all hover:shadow-md`}
              >
                {/* Priority icon */}
                <div className={`flex-shrink-0 p-2.5 rounded-xl border ${cfg.color}`}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className={`font-bold text-gray-800 ${alert.resolved ? 'line-through text-gray-400' : ''}`}>
                      {alert.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.badge}`}>
                      {cfg.label} Priority
                    </span>
                    {alert.resolved && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-700">
                        Resolved
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>👤 {alert.user}</span>
                    <span>•</span>
                    <span>🕐 {timeAgo(alert.createdAt)}</span>
                    {alert.category && <span className="capitalize">• {alert.category}</span>}
                    {alert.source === "manual" && (alert.userResolvedCount ?? 0) > 0 && (
                      <span className="text-emerald-600">• {alert.userResolvedCount} farmer(s) marked done</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {alert.source === "manual" && !alert.resolved && (
                    <button
                      type="button"
                      onClick={() => handleAdminResolve(alert._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold rounded-lg transition-colors border border-green-200"
                    >
                      <CheckCircle size={13} /> Resolve
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(alert._id)}
                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminAlerts;
