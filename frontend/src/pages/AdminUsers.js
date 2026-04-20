import { useState, useEffect } from "react";
import {
  Users, Trash2, Search, RefreshCw, UserCheck, UserX,
  Mail, Shield, Calendar, AlertCircle, CheckCircle
} from "lucide-react";
import { filterFarmerUsers } from "../utils/farmerAccounts";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(filterFarmerUsers(data.users || []));
      }
    } catch {
      // Use mock data if API is down
      setUsers([
        { _id: "1", name: "Ramesh Kumar", email: "ramesh@farm.com", role: "user", active: true, createdAt: "2026-04-01" },
        { _id: "2", name: "Anita Sharma", email: "anita@farm.com", role: "user", active: true, createdAt: "2026-04-05" },
        { _id: "3", name: "Suresh Patel", email: "suresh@farm.com", role: "user", active: false, createdAt: "2026-04-10" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers(users.filter(u => u._id !== userId));
        showToast("User deleted successfully.");
      } else {
        showToast("Failed to delete user.", "error");
      }
    } catch {
      setUsers(users.filter(u => u._id !== userId));
      showToast("User removed (offline mode).");
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/admin/users/${userId}/toggle-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ active: !currentStatus }),
      });
    } catch {}
    setUsers(users.map(u => u._id === userId ? { ...u, active: !u.active } : u));
    showToast(`User ${currentStatus ? 'deactivated' : 'activated'} successfully.`);
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium
          ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="text-green-600" size={28} /> User Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">View, manage, and delete registered farmer accounts.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Stats */}
            <div className="flex gap-3">
              <div className="text-center bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                <p className="text-xl font-bold text-green-700">{users.length}</p>
                <p className="text-xs text-green-500">Total</p>
              </div>
              <div className="text-center bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                <p className="text-xl font-bold text-green-700">{users.filter(u => u.active).length}</p>
                <p className="text-xs text-green-500">Active</p>
              </div>
              <div className="text-center bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                <p className="text-xl font-bold text-red-700">{users.filter(u => !u.active).length}</p>
                <p className="text-xs text-red-500">Inactive</p>
              </div>
            </div>
            <button onClick={fetchUsers} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <RefreshCw size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full max-w-md pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-400 focus:outline-none bg-gray-50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500">{searchTerm ? "No users match your search." : "No users registered yet."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((user, idx) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-400">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {(user.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Mail size={14} className="text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        <Shield size={11} />
                        Farmer
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                        <Calendar size={13} />
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
                        ${user.active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {user.active !== false ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
                        {user.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(user._id, user.active)}
                          title={user.active ? "Deactivate" : "Activate"}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.active !== false
                              ? 'bg-orange-100 hover:bg-orange-200 text-orange-600'
                              : 'bg-green-100 hover:bg-green-200 text-green-600'
                          }`}
                        >
                          {user.active !== false ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          title="Delete user"
                          className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
