import { useState } from "react";
import { useNavigate } from "react-router-dom";

const STATS = [
  { icon: "👨‍🌾", label: "Total Farmers", value: "12,486", change: "+124 this week", up: true },
  { icon: "🌾", label: "Active Farms", value: "9,302", change: "+87 this week", up: true },
  { icon: "🚨", label: "Disease Alerts", value: "43", change: "-12 vs last week", up: false },
  { icon: "💧", label: "Irrigation Alerts", value: "218", change: "+5 today", up: true },
];

const RECENT_FARMERS = [
  { name: "Ravi Kumar", state: "Telangana", crop: "Rice / Paddy", land: "5–10 Acres", joined: "Today", status: "Active" },
  { name: "Priya Sharma", state: "Punjab", crop: "Wheat", land: "10–25 Acres", joined: "Yesterday", status: "Active" },
  { name: "Mohan Das", state: "Karnataka", crop: "Vegetables", land: "1–5 Acres", joined: "2 days ago", status: "Pending" },
  { name: "Sunita Patel", state: "Gujarat", crop: "Cotton", land: "25–50 Acres", joined: "3 days ago", status: "Active" },
  { name: "Arjun Reddy", state: "Andhra Pradesh", crop: "Sugarcane", land: "5–10 Acres", joined: "4 days ago", status: "Inactive" },
];

const ALERTS = [
  { type: "🦠", title: "Blast Disease detected", location: "Nalgonda, Telangana", time: "2 hrs ago", severity: "high" },
  { type: "💧", title: "Irrigation overdue", location: "Ludhiana, Punjab", time: "4 hrs ago", severity: "medium" },
  { type: "🌡️", title: "Heat stress warning", location: "Nagpur, Maharashtra", time: "6 hrs ago", severity: "medium" },
  { type: "🐛", title: "Pest infestation alert", location: "Mysuru, Karnataka", time: "8 hrs ago", severity: "high" },
];

export default function AdminHome() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogout = () => navigate("/signup");

  return (
    <div style={{ minHeight: "100vh", background: "#f0fdf4", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(34,197,94,0.18) !important; }
        .stat-card { transition: all 0.25s ease; }
        .nav-btn { background: none; border: none; cursor: pointer; padding: 10px 18px; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; color: #6aaa6a; transition: all 0.2s ease; display: flex; align-items: center; gap: 8px; }
        .nav-btn:hover { background: rgba(34,197,94,0.08); color: #14532d; }
        .nav-btn.active { background: rgba(34,197,94,0.12); color: #14532d; font-weight: 600; }
        .table-row:hover { background: rgba(240,253,244,0.8) !important; }
        .table-row { transition: background 0.15s; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 240, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)", borderRight: "1px solid rgba(134,239,172,0.4)", display: "flex", flexDirection: "column", padding: "28px 16px", zIndex: 100 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36, paddingLeft: 8 }}>
          <span style={{ fontSize: 28 }}>🌾</span>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#14532d" }}>AgroSense</div>
            <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase" }}>Admin Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { id: "dashboard", icon: "📊", label: "Dashboard" },
            { id: "farmers", icon: "👨‍🌾", label: "Farmers" },
            { id: "alerts", icon: "🚨", label: "Alerts" },
            { id: "crops", icon: "🌱", label: "Crop Monitor" },
            { id: "reports", icon: "📋", label: "Reports" },
            { id: "settings", icon: "⚙️", label: "Settings" },
          ].map(item => (
            <button key={item.id} className={`nav-btn${activeTab===item.id?" active":""}`} onClick={() => setActiveTab(item.id)}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Admin badge */}
        <div style={{ padding: "14px 12px", background: "linear-gradient(135deg, rgba(240,253,244,0.9), rgba(220,252,231,0.9))", border: "1px solid rgba(134,239,172,0.4)", borderRadius: 14, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#22c55e,#16a34a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🛡️</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#14532d" }}>Administrator</div>
              <div style={{ fontSize: 11, color: "#6aaa6a" }}>admin@agrosense.in</div>
            </div>
          </div>
        </div>

        <button onClick={handleLogout} style={{ background: "rgba(254,242,242,0.8)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 12, padding: "11px 16px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#ef4444", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
          🚪 Logout
        </button>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ marginLeft: 240, padding: "32px 36px" }}>

        {/* Top bar */}
        <div className="fade-up" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#14532d", marginBottom: 4 }}>
              Good morning, Admin! 🌅
            </h1>
            <p style={{ fontSize: 13, color: "#6aaa6a", fontWeight: 300 }}>Here's what's happening across all farms today</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ padding: "8px 16px", background: "white", border: "1px solid rgba(134,239,172,0.5)", borderRadius: 10, fontSize: 13, color: "#14532d", fontWeight: 500 }}>
              📅 {new Date().toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short", year:"numeric" })}
            </div>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#22c55e,#16a34a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, cursor: "pointer", boxShadow: "0 4px 14px rgba(34,197,94,0.3)" }}>🔔</div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
          {STATS.map((s, i) => (
            <div key={i} className="stat-card" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(134,239,172,0.4)", borderRadius: 20, padding: "24px 22px", boxShadow: "0 4px 20px rgba(34,197,94,0.08)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#14532d", fontFamily: "'Playfair Display', serif", marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "#6aaa6a", marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: s.up ? "#22c55e" : "#f97316", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                {s.up ? "↑" : "↓"} {s.change}
              </div>
            </div>
          ))}
        </div>

        {/* Two-column: Farmers table + Alerts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, marginBottom: 32 }}>

          {/* Recent Farmers */}
          <div className="fade-up" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(134,239,172,0.4)", borderRadius: 20, padding: "24px", boxShadow: "0 4px 20px rgba(34,197,94,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#14532d" }}>👨‍🌾 Recent Registrations</h2>
              <button style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(134,239,172,0.4)", borderRadius: 8, padding: "6px 14px", fontSize: 12, color: "#16a34a", cursor: "pointer", fontWeight: 600 }}>View All</button>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(134,239,172,0.3)" }}>
                  {["Farmer", "State", "Crop", "Land", "Joined", "Status"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 11, color: "#6aaa6a", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_FARMERS.map((f, i) => (
                  <tr key={i} className="table-row" style={{ borderBottom: "1px solid rgba(134,239,172,0.15)" }}>
                    <td style={{ padding: "12px 10px", fontSize: 13, fontWeight: 600, color: "#14532d" }}>{f.name}</td>
                    <td style={{ padding: "12px 10px", fontSize: 12, color: "#6aaa6a" }}>{f.state}</td>
                    <td style={{ padding: "12px 10px", fontSize: 12, color: "#6aaa6a" }}>{f.crop}</td>
                    <td style={{ padding: "12px 10px", fontSize: 12, color: "#6aaa6a" }}>{f.land}</td>
                    <td style={{ padding: "12px 10px", fontSize: 12, color: "#6aaa6a" }}>{f.joined}</td>
                    <td style={{ padding: "12px 10px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: f.status==="Active"?"rgba(34,197,94,0.12)":f.status==="Pending"?"rgba(234,179,8,0.12)":"rgba(156,163,175,0.15)", color: f.status==="Active"?"#16a34a":f.status==="Pending"?"#ca8a04":"#9ca3af" }}>
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Live Alerts */}
          <div className="fade-up" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(134,239,172,0.4)", borderRadius: 20, padding: "24px", boxShadow: "0 4px 20px rgba(34,197,94,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#14532d" }}>🚨 Live Alerts</h2>
              <span style={{ background: "#ef4444", color: "white", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{ALERTS.length}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {ALERTS.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "14px", background: a.severity==="high"?"rgba(254,242,242,0.7)":"rgba(255,251,235,0.7)", border: `1px solid ${a.severity==="high"?"rgba(248,113,113,0.3)":"rgba(234,179,8,0.3)"}`, borderRadius: 12 }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{a.type}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#14532d", marginBottom: 2 }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: "#6aaa6a" }}>📍 {a.location}</div>
                    <div style={{ fontSize: 11, color: "#a7c4a7", marginTop: 2 }}>{a.time}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: a.severity==="high"?"#ef4444":"#ca8a04", textTransform: "uppercase", letterSpacing: "0.5px", alignSelf: "flex-start", marginTop: 2 }}>{a.severity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="fade-up" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(240,253,244,0.9))", border: "1px solid rgba(134,239,172,0.4)", borderRadius: 20, padding: "24px 28px", boxShadow: "0 4px 20px rgba(34,197,94,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#14532d", marginBottom: 4 }}>📊 Crop Distribution Overview</div>
            <div style={{ fontSize: 13, color: "#6aaa6a", fontWeight: 300 }}>Top crops by registered farmer count</div>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {[["Rice/Paddy","28%","#22c55e"],["Wheat","21%","#86efac"],["Cotton","15%","#4ade80"],["Vegetables","14%","#16a34a"],["Others","22%","#bbf7d0"]].map(([crop,pct,color])=>(
              <div key={crop} style={{ textAlign:"center" }}>
                <div style={{ width:48,height:48,borderRadius:"50%",background:`conic-gradient(${color} 0% ${pct}, #e5e7eb ${pct} 100%)`,margin:"0 auto 6px",border:"3px solid white",boxShadow:"0 2px 8px rgba(0,0,0,0.08)" }} />
                <div style={{ fontSize:11,fontWeight:600,color:"#14532d" }}>{crop}</div>
                <div style={{ fontSize:12,color:"#22c55e",fontWeight:700 }}>{pct}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}