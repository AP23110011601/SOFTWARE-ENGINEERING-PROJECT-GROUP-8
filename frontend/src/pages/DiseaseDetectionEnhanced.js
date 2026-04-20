import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Upload, 
  Camera, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Microscope,
  Brain,
  Activity,
  Shield,
  Droplets,
  FileText,
  RefreshCw
} from "lucide-react";

const DiseaseDetectionEnhanced = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);

    fetchModelInfo();
    fetchHistory();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchModelInfo = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/custom-ml/model-info");
      const data = await response.json();
      setModelInfo(data.model);
    } catch (error) {
      console.error("Error fetching model info:", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/custom-ml/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("File size must be less than 10MB.");
        return;
      }
      setErrorMessage("");
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    setResult(null);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("userId", user?.id || user?._id || "");

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/custom-ml/analyze-custom", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.result);
        setActiveTab("results");
        fetchHistory(); // Refresh history
      } else {
        setErrorMessage(data.message || "Analysis failed");
      }
    } catch (error) {
      console.error("Error analyzing disease:", error);
      setErrorMessage("Error analyzing image. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "low": return "text-green-600 bg-green-50 border-green-200";
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "high": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 85) return "text-green-600";
    if (confidence >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const symptoms = result?.disease?.symptoms || [];
  const causes = result?.disease?.causes || [];
  const immediateRecommendations = result?.recommendations?.immediate || [];
  const preventionRecommendations = result?.recommendations?.prevention || [];
  const nextSteps = result?.recommendations?.nextSteps || [];
  const monitoringTasks = result?.recommendations?.monitoring || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Microscope className="text-green-600 mr-3" size={32} />
                AI Disease Detection
              </h1>
              <p className="text-gray-600 mt-1">Custom ML Model - Advanced Plant Analysis</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Model Accuracy</p>
                <p className="text-2xl font-bold text-green-600">{modelInfo?.accuracy || "94.2%"}</p>
              </div>
              <Brain className="text-green-600" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 border border-green-100">
        <div className="flex space-x-2">
          {["upload", "results", "history", "model"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Tab */}
      {activeTab === "upload" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Upload className="text-green-600 mr-3" size={28} />
              Upload Plant Image
            </h2>
            {errorMessage && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}
            
            <div className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center hover:border-green-500 transition-colors">
              {preview ? (
                <div className="space-y-4">
                  <img src={preview} alt="Preview" className="max-w-full h-64 mx-auto rounded-lg" />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setPreview(null);
                      setResult(null);
                    }}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Camera className="mx-auto text-green-600" size={48} />
                  <div>
                    <label className="cursor-pointer bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 inline-block">
                      Choose Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-gray-500 mt-2">or drag and drop</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Supported: JPG, PNG, WEBP (Max 10MB)
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={analyzeImage}
              disabled={!selectedImage || analyzing}
              className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="animate-spin mr-2" size={20} />
                  Analyzing with Custom ML Model...
                </>
              ) : (
                <>
                  <Brain className="mr-2" size={20} />
                  Analyze Disease
                </>
              )}
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Brain className="text-blue-600 mr-2" size={24} />
                Custom ML Model Features
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 mr-3" size={20} />
                  <span className="text-gray-700">94.2% Accuracy Rate</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 mr-3" size={20} />
                  <span className="text-gray-700">50,000+ Training Images</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 mr-3" size={20} />
                  <span className="text-gray-700">8 Crop Types Supported</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 mr-3" size={20} />
                  <span className="text-gray-700">7 Disease Types Detected</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Shield className="text-purple-600 mr-2" size={24} />
                Supported Crops & Diseases
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {modelInfo?.supportedCrops?.map((crop) => (
                  <div key={crop} className="bg-purple-50 text-purple-700 px-3 py-2 rounded-lg text-center">
                    {crop}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Tab */}
      {activeTab === "results" && result && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Activity className="text-green-600 mr-3" size={28} />
                Analysis Results
              </h2>
              <div className={`px-4 py-2 rounded-lg font-medium ${getSeverityColor(result.disease.severity)}`}>
                {result.disease.severity.toUpperCase()} SEVERITY
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Detected Disease</h3>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <h4 className="text-2xl font-bold text-green-800 mb-2">{result.disease.name}</h4>
                  <p className="text-gray-600 italic mb-4">{result.disease.scientificName}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-700 font-medium">Confidence Level:</span>
                    <span className={`text-2xl font-bold ${getConfidenceColor(result.disease.confidence)}`}>
                      {result.disease.confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${result.disease.confidence}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Description</h4>
                  <p className="text-gray-600">{result.disease.description}</p>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Recommended Remedy</h4>
                  <p className="text-gray-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    {result.recommendations?.immediate?.[0] || "Follow standard disease management practices."}
                  </p>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Impact Assessment</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-red-50 rounded-lg p-3 text-center">
                      <p className="text-red-800 font-bold">{result.disease.impact.yieldLoss}</p>
                      <p className="text-red-600 text-sm">Yield Loss</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3 text-center">
                      <p className="text-orange-800 font-bold">{result.disease.impact.spreadRate}</p>
                      <p className="text-orange-600 text-sm">Spread Rate</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <p className="text-yellow-800 font-bold">{result.disease.impact.economicDamage}</p>
                      <p className="text-yellow-600 text-sm">Economic Damage</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <AlertTriangle className="text-red-600 mr-2" size={20} />
                    Symptoms
                  </h4>
                  <ul className="space-y-2">
                    {symptoms.map((symptom, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-600 mr-2">-</span>
                        <span className="text-gray-600">{symptom}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Causes</h4>
                  <ul className="space-y-2">
                    {causes.map((cause, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-orange-600 mr-2">-</span>
                        <span className="text-gray-600">{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Droplets className="text-blue-600 mr-2" size={24} />
                Treatment Recommendations
              </h3>
              <div className="space-y-4">
                {immediateRecommendations.map((treatment, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-blue-800">{treatment}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Shield className="text-green-600 mr-2" size={24} />
                Prevention Measures
              </h3>
              <div className="space-y-4">
                {preventionRecommendations.map((prevention, index) => (
                  <div key={index} className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-green-800">{prevention}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Clock className="text-purple-600 mr-2" size={24} />
              Next Steps & Monitoring
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Immediate Actions</h4>
                <ul className="space-y-2">
                  {nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-purple-600 mr-2">{'>'}</span>
                      <span className="text-gray-600">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Monitoring Plan</h4>
                <ul className="space-y-2">
                  {monitoringTasks.map((task, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">{'>'}</span>
                      <span className="text-gray-600">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Clock className="text-green-600 mr-3" size={28} />
            Analysis History
          </h2>
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">{item.disease}</h4>
                      <p className="text-sm text-gray-600">{formatDate(item.date)}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(item.severity)}`}>
                        {item.severity}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">{Number(item.confidence || 0).toFixed(1)}% confidence</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No analysis history yet. Upload your first plant image to get started!</p>
            </div>
          )}
        </div>
      )}

      {/* Model Info Tab */}
      {activeTab === "model" && modelInfo && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Brain className="text-green-600 mr-3" size={28} />
              Custom ML Model Information
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Model Details</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-600">Model Name</span>
                      <span className="font-medium text-gray-800">{modelInfo.name}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-600">Version</span>
                      <span className="font-medium text-gray-800">{modelInfo.version}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-600">Type</span>
                      <span className="font-medium text-gray-800">{modelInfo.type}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-600">Training Data</span>
                      <span className="font-medium text-gray-800">{modelInfo.trainingData}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-600">Accuracy</span>
                      <span className="font-medium text-green-600">{modelInfo.accuracy}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Capabilities</h3>
                  <div className="space-y-3">
                    {(modelInfo.capabilities || []).map((capability, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="text-green-500 mr-3" size={20} />
                        <span className="text-gray-700">{capability}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Supported Crops</h3>
              <div className="grid grid-cols-2 gap-3">
                {(modelInfo.supportedCrops || []).map((crop) => (
                  <div key={crop} className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg text-center font-medium">
                    {crop}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Detectable Diseases</h3>
              <div className="grid grid-cols-1 gap-3">
                {(modelInfo.supportedDiseases || []).map((disease) => (
                  <div key={disease} className="bg-purple-50 text-purple-700 px-4 py-3 rounded-lg text-center font-medium">
                    {disease}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseDetectionEnhanced;
