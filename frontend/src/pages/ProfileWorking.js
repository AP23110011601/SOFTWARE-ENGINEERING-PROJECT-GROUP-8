import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, RefreshCw, Activity } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("info");
  const [sensorSummary, setSensorSummary] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    state: "",
    district: "",
    cropType: "",
    soilType: "",
    landSize: ""
  });

  const cropTypes = ["Rice", "Wheat", "Cotton", "Maize", "Sugarcane", "Tomato", "Onion"];
  const soilTypes = ["Clay", "Sandy", "Loamy", "Black Soil", "Red Soil"];

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/profile/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success && data.user) {
        setUser(data.user);
        setFormData({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          state: data.user.state || "",
          district: data.user.district || "",
          cropType: data.user.cropType || "",
          soilType: data.user.soilType || "",
          landSize: data.user.landSize || ""
        });
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch (error) {
      setStatusType("error");
      setStatusMessage("Unable to load profile.");
    }
  };

  const fetchSensorSummary = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sensor/latest`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setSensorSummary(data.latest || null);
    } catch (error) {
      setSensorSummary(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProfile();
    fetchSensorSummary();
  }, [navigate]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/profile/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        setIsEditing(false);
        setStatusType("success");
        setStatusMessage("Profile updated.");
      } else {
        setStatusType("error");
        setStatusMessage(data.message || "Failed to update profile.");
      }
    } catch (error) {
      setStatusType("error");
      setStatusMessage("Error updating profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-900 flex items-center">
              <User className="text-emerald-600 mr-3" size={32} />
              {user?.name || "User Profile"}
            </h1>
            <p className="text-green-700 mt-2">Manage your profile and farm preferences.</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors text-red-600 flex items-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${statusType === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {statusMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 border border-green-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Profile Information</h2>
            <button
              onClick={() => setIsEditing((prev) => !prev)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={!isEditing} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 disabled:bg-gray-100" />
              <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={!isEditing} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 disabled:bg-gray-100" />
              <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} disabled={!isEditing} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 disabled:bg-gray-100" />
              <input type="text" placeholder="State" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} disabled={!isEditing} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 disabled:bg-gray-100" />
              <input type="text" placeholder="District" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} disabled={!isEditing} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 disabled:bg-gray-100" />
              <input type="number" placeholder="Land Size (Acres)" value={formData.landSize} onChange={(e) => setFormData({ ...formData, landSize: e.target.value })} disabled={!isEditing} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 disabled:bg-gray-100" />
              <select value={formData.cropType} onChange={(e) => setFormData({ ...formData, cropType: e.target.value })} disabled={!isEditing} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 disabled:bg-gray-100">
                <option value="">Select Crop Type</option>
                {cropTypes.map((crop) => <option key={crop} value={crop}>{crop}</option>)}
              </select>
              <select value={formData.soilType} onChange={(e) => setFormData({ ...formData, soilType: e.target.value })} disabled={!isEditing} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 disabled:bg-gray-100">
                <option value="">Select Soil Type</option>
                {soilTypes.map((soil) => <option key={soil} value={soil}>{soil}</option>)}
              </select>
            </div>
            {isEditing && (
              <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50">
                {isLoading ? "Saving..." : "Save Profile"}
              </button>
            )}
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Latest Farm Snapshot</h3>
              <button onClick={fetchSensorSummary} className="text-emerald-600 hover:text-emerald-700">
                <RefreshCw size={18} />
              </button>
            </div>
            {sensorSummary ? (
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-semibold">Avg Moisture:</span> {sensorSummary.avgMoisture}%</p>
                <p><span className="font-semibold">Temperature:</span> {sensorSummary.temperature ?? sensorSummary.airTemperature}C</p>
                <p><span className="font-semibold">Humidity:</span> {sensorSummary.humidity ?? sensorSummary.airHumidity}%</p>
                <p><span className="font-semibold">Tank Level:</span> {sensorSummary.tankLevel}%</p>
                <p><span className="font-semibold">Rain:</span> {sensorSummary.rain || sensorSummary.isRaining ? "Detected" : "No"}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No sensor snapshot available.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Activity size={18} className="text-emerald-600" />
              Account Status
            </h3>
            <p className="text-sm text-gray-700">Profile and preferences are active and linked with recommendations.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
