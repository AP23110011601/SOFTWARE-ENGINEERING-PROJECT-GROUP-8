import { useState } from "react";
import { Settings, Droplets, Thermometer, Save, CheckCircle, AlertTriangle, Sliders, RefreshCw } from "lucide-react";

const DEFAULT_SETTINGS = {
  moistureThresholdLow: 25,
  moistureThresholdHigh: 80,
  tankThresholdLow: 15,
  tankThresholdCritical: 10,
  temperatureMax: 38,
  temperatureMin: 10,
  humidity_max: 90,
  phMin: 5.5,
  phMax: 7.5,
  alertCheckInterval: 5,
  irrigationAutoTrigger: true,
  alertEmailEnabled: true,
  sensorPollingRate: 10,
};

const SliderInput = ({ label, name, value, min, max, step = 1, unit, color, onChange }) => (
  <div className="mb-5">
    <div className="flex justify-between items-center mb-1.5">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <span className={`text-sm font-bold px-3 py-0.5 rounded-lg ${color}`}>
        {value}{unit}
      </span>
    </div>
    <input
      type="range"
      name={name}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full h-2 rounded-full appearance-none cursor-pointer accent-green-600"
    />
    <div className="flex justify-between text-xs text-gray-400 mt-1">
      <span>{min}{unit}</span>
      <span>{max}{unit}</span>
    </div>
  </div>
);

const AdminSettings = () => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("agri_system_settings");
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "range" || type === "number" ? parseFloat(value) : value
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.REACT_APP_API_URL}/api/admin/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
    } catch {}
    localStorage.setItem("agri_system_settings", JSON.stringify(settings));
    setTimeout(() => { setSaving(false); setSaved(true); }, 600);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setSaved(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Settings className="text-green-600" size={26} /> System Settings
            </h1>
            <p className="text-gray-500 text-sm mt-1">Configure thresholds, alert rules, and system behavior.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <RefreshCw size={15} /> Reset Defaults
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-xl transition-all shadow-md
                ${saved ? 'bg-green-500 text-white shadow-green-200' :
                  saving ? 'bg-gray-400 text-white' :
                  'bg-green-600 hover:bg-green-700 text-white shadow-green-200'}`}
            >
              {saved ? <CheckCircle size={16} /> : <Save size={16} />}
              {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Moisture Thresholds */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-5">
            <div className="p-2 bg-blue-100 rounded-lg"><Droplets size={18} className="text-blue-600" /></div>
            Moisture Thresholds
          </h2>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5 text-xs text-blue-700">
            <AlertTriangle size={13} className="inline mr-1" />
            Alerts fire when moisture drops below <strong>{settings.moistureThresholdLow}%</strong>.
            Auto-irrigation triggers if enabled.
          </div>
          <SliderInput
            label="Low Moisture Alert Threshold"
            name="moistureThresholdLow"
            value={settings.moistureThresholdLow}
            min={10} max={60} unit="%" onChange={handleChange}
            color="bg-blue-100 text-blue-700"
          />
          <SliderInput
            label="High Moisture Limit (Overwatering)"
            name="moistureThresholdHigh"
            value={settings.moistureThresholdHigh}
            min={50} max={100} unit="%" onChange={handleChange}
            color="bg-indigo-100 text-indigo-700"
          />
        </div>

        {/* Tank Thresholds */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-5">
            <div className="p-2 bg-cyan-100 rounded-lg"><Droplets size={18} className="text-cyan-600" /></div>
            Water Tank Rules
          </h2>
          <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-3 mb-5 text-xs text-cyan-700">
            Critical alert fires at <strong>{settings.tankThresholdCritical}%</strong>.
            Warning alert fires at <strong>{settings.tankThresholdLow}%</strong>.
          </div>
          <SliderInput
            label="Tank Warning Level"
            name="tankThresholdLow"
            value={settings.tankThresholdLow}
            min={10} max={50} unit="%" onChange={handleChange}
            color="bg-yellow-100 text-yellow-700"
          />
          <SliderInput
            label="Tank Critical Level"
            name="tankThresholdCritical"
            value={settings.tankThresholdCritical}
            min={5} max={30} unit="%" onChange={handleChange}
            color="bg-red-100 text-red-700"
          />
        </div>

        {/* Temperature & pH */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-5">
            <div className="p-2 bg-orange-100 rounded-lg"><Thermometer size={18} className="text-orange-600" /></div>
            Temperature & pH
          </h2>
          <SliderInput
            label="Maximum Safe Temperature"
            name="temperatureMax"
            value={settings.temperatureMax}
            min={25} max={50} unit="°C" onChange={handleChange}
            color="bg-orange-100 text-orange-700"
          />
          <SliderInput
            label="Minimum Safe Temperature"
            name="temperatureMin"
            value={settings.temperatureMin}
            min={0} max={20} unit="°C" onChange={handleChange}
            color="bg-blue-100 text-blue-700"
          />
          <SliderInput
            label="Soil pH Minimum"
            name="phMin"
            value={settings.phMin}
            min={4.0} max={6.5} step={0.1} unit="" onChange={handleChange}
            color="bg-purple-100 text-purple-700"
          />
          <SliderInput
            label="Soil pH Maximum"
            name="phMax"
            value={settings.phMax}
            min={6.5} max={9.0} step={0.1} unit="" onChange={handleChange}
            color="bg-purple-100 text-purple-700"
          />
        </div>

        {/* System Rules */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-5">
            <div className="p-2 bg-green-100 rounded-lg"><Sliders size={18} className="text-green-600" /></div>
            System Rules
          </h2>
          <SliderInput
            label="Alert Check Interval"
            name="alertCheckInterval"
            value={settings.alertCheckInterval}
            min={1} max={60} unit=" min" onChange={handleChange}
            color="bg-green-100 text-green-700"
          />
          <SliderInput
            label="Sensor Polling Rate"
            name="sensorPollingRate"
            value={settings.sensorPollingRate}
            min={5} max={120} unit=" sec" onChange={handleChange}
            color="bg-teal-100 text-teal-700"
          />

          {/* Toggle Switches */}
          <div className="space-y-4 mt-2">
            {[
              { name: "irrigationAutoTrigger", label: "Auto-Irrigation Trigger", desc: "Automatically start irrigation when moisture is critical" },
              { name: "alertEmailEnabled", label: "Email Alerts", desc: "Send email notifications for high priority alerts" },
            ].map(toggle => (
              <label key={toggle.name} className="flex items-start gap-4 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    name={toggle.name}
                    checked={settings[toggle.name]}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div
                    onClick={() => handleChange({ target: { name: toggle.name, type: "checkbox", checked: !settings[toggle.name] } })}
                    className={`w-12 h-6 rounded-full transition-colors cursor-pointer
                      ${settings[toggle.name] ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform
                      ${settings[toggle.name] ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">{toggle.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{toggle.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Save button bottom for convenience */}
      <div className="mt-5 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-8 py-3 text-sm font-bold rounded-xl transition-all shadow-md
            ${saved ? 'bg-green-500 text-white' :
              saving ? 'bg-gray-400 text-white' :
              'bg-green-600 hover:bg-green-700 text-white shadow-green-200'}`}
        >
          {saved ? <CheckCircle size={18} /> : <Save size={18} />}
          {saved ? 'All changes saved!' : saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
