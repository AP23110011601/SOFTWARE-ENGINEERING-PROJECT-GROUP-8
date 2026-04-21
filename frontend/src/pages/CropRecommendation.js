import React, { useCallback, useEffect, useState } from 'react';
import { Leaf, Sprout, Droplets, Thermometer, Cloud, TestTube, CloudRain, RefreshCw } from 'lucide-react';

const CropRecommendation = () => {
  const [formData, setFormData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: ''
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [predictedCrop, setPredictedCrop] = useState(null);
  const [sensorLoaded, setSensorLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchLiveSensors = useCallback(async (generateFresh = false) => {
    setIsSyncing(true);
    setErrorMessage("");
    try {
      const token = localStorage.getItem('token');
      if (generateFresh) {
        await  fetch(`${process.env.REACT_APP_API_URL}/api/sensor/generate`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` }
        });
      }
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/sensor/latest`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.latest) {
        setFormData({
          nitrogen: data.latest.nitrogen.toString(),
          phosphorus: data.latest.phosphorus.toString(),
          potassium: data.latest.potassium.toString(),
          temperature: (data.latest.temperature ?? data.latest.airTemperature).toString(),
          humidity: (data.latest.humidity ?? data.latest.airHumidity).toString(),
          ph: data.latest.ph.toString(),
          rainfall: data.latest.rainfallQuantity.toString()
        });
        setSensorLoaded(true);
      }
    } catch (err) {
      setErrorMessage("Unable to fetch sensor values from database.");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveSensors();
  }, [fetchLiveSensors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPredictedCrop(null);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/crop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          N: parseFloat(formData.nitrogen),
          P: parseFloat(formData.phosphorus),
          K: parseFloat(formData.potassium),
          temperature: parseFloat(formData.temperature),
          humidity: parseFloat(formData.humidity),
          ph: parseFloat(formData.ph),
          rainfall: parseFloat(formData.rainfall),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.crop) {
        setPredictedCrop(data.crop);
        return;
      }
      throw new Error(data.error || "ML API error");
    } catch (err) {
      setErrorMessage("Crop model is not reachable right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <Sprout className="text-green-600 mr-3" size={32} />
          AI Crop Recommendation
        </h1>
        <p className="text-gray-600 mt-2 text-lg">Enter your soil and weather parameters to get the best crop prediction using our ML model.</p>
        <p className="text-sm mt-2 text-emerald-700 font-medium">
          {sensorLoaded ? "Sensor values are loaded from database." : "Loading latest sensor values from database..."}
        </p>
        {errorMessage && <p className="text-sm mt-2 text-red-600 font-medium">{errorMessage}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 object-cover">
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-700">Input Parameters</h2>
            <button 
              type="button"
              onClick={() => fetchLiveSensors(true)}
              disabled={isSyncing}
              className="flex items-center text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-all"
            >
              <RefreshCw className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} size={16} />
              {isSyncing ? 'Syncing...' : 'Reload Sensor Values'}
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Leaf className="text-green-500 mr-2" size={16} /> Nitrogen (N)
                </label>
                <input required type="number" name="nitrogen" value={formData.nitrogen} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-3 bg-gray-50 bg-opacity-50 border transition-all" placeholder="e.g. 90" />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Leaf className="text-green-600 mr-2" size={16} /> Phosphorus (P)
                </label>
                <input required type="number" name="phosphorus" value={formData.phosphorus} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-3 bg-gray-50 bg-opacity-50 border transition-all" placeholder="e.g. 42" />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Leaf className="text-green-700 mr-2" size={16} /> Potassium (K)
                </label>
                <input required type="number" name="potassium" value={formData.potassium} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-3 bg-gray-50 bg-opacity-50 border transition-all" placeholder="e.g. 43" />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Thermometer className="text-red-500 mr-2" size={16} /> Temperature (°C)
                </label>
                <input required type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-3 bg-gray-50 bg-opacity-50 border transition-all" placeholder="e.g. 25.6" />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Droplets className="text-blue-500 mr-2" size={16} /> Humidity (%)
                </label>
                <input required type="number" step="0.1" name="humidity" value={formData.humidity} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-3 bg-gray-50 bg-opacity-50 border transition-all" placeholder="e.g. 82.0" />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <TestTube className="text-purple-500 mr-2" size={16} /> pH Level
                </label>
                <input required type="number" step="0.1" name="ph" value={formData.ph} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-3 bg-gray-50 bg-opacity-50 border transition-all" placeholder="e.g. 6.5" />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <CloudRain className="text-blue-600 mr-2" size={16} /> Rainfall (mm)
                </label>
                <input required type="number" step="0.1" name="rainfall" value={formData.rainfall} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-3 bg-gray-50 bg-opacity-50 border transition-all" placeholder="e.g. 202.9" />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:scale-[1.02]"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Data...
                </span>
              ) : (
                'Crop Recommend'
              )}
            </button>
          </form>
        </div>

        <div className="flex flex-col">
          {predictedCrop ? (
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-lg border border-green-200 p-8 flex-grow flex flex-col items-center justify-center text-center transition-all animate-fade-in">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-inner mb-6">
                <Sprout className="text-green-500 w-16 h-16" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Recommended Crop</h2>
              <h1 className="text-5xl font-extrabold text-green-700 mb-6 drop-shadow-sm">{predictedCrop}</h1>
              <p className="text-gray-600 mb-8 max-w-sm">
                Based on your soil nutrients and environmental conditions, <strong>{predictedCrop}</strong> is highly recommended for optimal yield.
              </p>
              <button 
                onClick={() => setPredictedCrop(null)}
                className="text-green-600 font-medium hover:text-green-800 underline"
              >
                Start New Analysis
              </button>
            </div>
          ) : (
             <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 flex-grow flex flex-col items-center justify-center text-center opacity-70">
                <Cloud className="text-gray-300 w-24 h-24 mb-4" />
                <h3 className="text-xl font-medium text-gray-500 mb-2">Awaiting Parameters</h3>
                <p className="text-gray-400 max-w-sm">Enter all parameters and click the button to get ML-powered crop recommendations.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropRecommendation;
