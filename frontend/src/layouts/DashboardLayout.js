import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Droplets, Activity, Settings, Users, Shield,
  Bell, Leaf, Cpu, Menu, X, LogOut, User, Landmark
} from 'lucide-react';

// ─────────── USER SIDEBAR NAVIGATION ───────────
const userNavItems = [
  { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { name: "Soil & Environment", path: "/user/soil", icon: <Droplets size={18} /> },
  { name: "Crop Recommendation", path: "/user/crop-recommendation", icon: <Leaf size={18} /> },
  { name: "Disease Detection", path: "/disease", icon: <Activity size={18} /> },
  { name: "Alerts", path: "/user/alerts", icon: <Bell size={18} /> },
  { name: "Schemes", path: "/user/schemes", icon: <Landmark size={18} /> },
  { name: "Profile", path: "/profile", icon: <User size={18} /> },
];

// ─────────── ADMIN SIDEBAR NAVIGATION ───────────
const adminNavItems = [
  { name: "Admin Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
  { name: "User Management", path: "/admin/users", icon: <Users size={18} /> },
  { name: "Sensor Monitoring", path: "/admin/sensors", icon: <Cpu size={18} /> },
  { name: "Alerts Management", path: "/admin/alerts", icon: <Bell size={18} /> },
  { name: "Schemes Management", path: "/admin/schemes", icon: <Landmark size={18} /> },
  { name: "Analytics", path: "/admin/analytics", icon: <Activity size={18} /> },
  { name: "System Settings", path: "/admin/settings", icon: <Settings size={18} /> },
];

export default function DashboardLayout({ role = 'user' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = role === 'admin' ? adminNavItems : userNavItems;
  const isAdmin = role === 'admin';

  // Get user info from localStorage
  let user = { name: 'User', email: '' };
  try {
    const stored = localStorage.getItem('user');
    if (stored) user = JSON.parse(stored);
  } catch {}
  const fullName = user.name || 'User';
  const shortName = fullName.split(' ').slice(0, 2).join(' ');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  const isUser = role === "user";

  const sidebarBg = isAdmin
    ? 'bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900'
    : 'bg-gradient-to-b from-green-900 via-emerald-900 to-green-900';

  const activeClass = isAdmin
    ? 'bg-white/20 text-white border-l-4 border-purple-300 font-semibold'
    : 'bg-white/20 text-white border-l-4 border-green-300 font-semibold';

  const inactiveClass = 'text-white/70 hover:bg-white/10 hover:text-white border-l-4 border-transparent transition-all';

  if (isUser) {
    return (
      <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="h-16 grid grid-cols-[auto,1fr,auto] items-center gap-4">
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center shadow">
                  <Leaf size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-gray-900 font-bold text-sm leading-tight">Smart Agri</p>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest">User Portal</p>
                </div>
              </div>
              <nav className="hidden md:flex items-center justify-center gap-1 flex-1 min-w-0 overflow-x-auto">
                {userNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-2.5 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors ${
                      isActive(item.path)
                        ? "bg-green-100 text-green-800"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                <Link to="/user/alerts" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                  <Bell size={20} />
                </Link>
                <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-gray-200 max-w-[220px]">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-bold">
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="leading-tight min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{shortName}</p>
                    <p className="text-xs text-green-600 font-medium">Farmer</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="p-2 rounded-lg text-red-500 hover:bg-red-50">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
            <div className="md:hidden pb-3">
              <div className="flex flex-wrap gap-2">
                {userNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive(item.path)
                        ? "bg-green-100 text-green-800"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="h-16 grid grid-cols-[auto,1fr,auto] items-center gap-4">
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center shadow">
                  <Shield size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-gray-900 font-bold text-sm leading-tight">Smart Agri</p>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest">Admin Portal</p>
                </div>
              </div>

              <nav className="hidden md:flex items-center justify-center gap-1 flex-1 min-w-0 overflow-x-auto">
                {adminNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-2.5 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors ${
                      isActive(item.path)
                        ? "bg-green-100 text-green-800"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-2 shrink-0 ml-auto">
                <Link to="/admin/alerts" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                  <Bell size={20} />
                </Link>
                <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-gray-200 max-w-[220px]">
                  <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-bold">
                    A
                  </div>
                  <div className="leading-tight min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">Site owner</p>
                    <p className="text-xs text-gray-500 font-medium">Administrator</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="p-2 rounded-lg text-red-500 hover:bg-red-50">
                  <LogOut size={18} />
                </button>
              </div>
            </div>

            <div className="md:hidden pb-3">
              <div className="flex flex-wrap gap-2">
                {adminNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive(item.path)
                        ? "bg-green-100 text-green-800"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── MOBILE OVERLAY ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col shadow-2xl
        transform transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${sidebarBg}
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg
              ${isAdmin ? 'bg-purple-500' : 'bg-green-500'}`}>
              {isAdmin ? <Shield size={20} className="text-white" /> : <Leaf size={20} className="text-white" />}
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">
                Smart Agri
              </p>
              <p className="text-white/50 text-[10px] uppercase tracking-widest">
                {isAdmin ? 'Admin Panel' : 'Farm Portal'}
              </p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/70 hover:text-white">
            <X size={22} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-r-lg text-sm transition-all ${
                isActive(item.path) ? activeClass : inactiveClass
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0
              ${isAdmin ? 'bg-purple-500' : 'bg-green-500'}`}>
              {(user.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user.name || 'User'}</p>
              <p className="text-white/50 text-xs truncate">{user.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-300 hover:bg-red-500/20 hover:text-red-200 rounded-lg transition-all"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">

        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <Menu size={22} />
            </button>
            {/* Page title based on active route */}
            <div>
              <h2 className="font-bold text-gray-800 text-base sm:text-lg leading-tight">
                {navItems.find(i => isActive(i.path))?.name || 'Smart Agriculture'}
              </h2>
              <p className="text-xs text-gray-500 hidden sm:block">
                {isAdmin ? 'System Administration' : 'Farmer Dashboard'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Alerts bell - quick link */}
            <Link
              to={isAdmin ? '/admin/alerts' : '/user/alerts'}
              className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </Link>

            {/* Avatar + role badge */}
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                ${isAdmin ? 'bg-purple-600' : 'bg-green-600'}`}>
                {(user.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{user.name || 'User'}</p>
                <p className={`text-xs font-medium ${isAdmin ? 'text-purple-600' : 'text-green-600'}`}>
                  {isAdmin ? 'Admin' : 'Farmer'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
