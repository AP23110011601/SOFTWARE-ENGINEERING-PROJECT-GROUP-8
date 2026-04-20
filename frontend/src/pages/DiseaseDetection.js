import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DiseaseDetection = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);
  }, [navigate]);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setResult(null); // Reset previous results
    }
  };

  const analyzeDisease = async () => {
    if (!selectedImage) {
      alert("Please select an image first");
      return;
    }

    setAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("userId", user?.id);

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/disease/analyze", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        alert(data.message || "Analysis failed");
      }
    } catch (error) {
      console.error("Error analyzing disease:", error);
      alert("Error analyzing image. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "low": return "text-green-600 bg-green-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "high": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Disease Detection</h1>
              <p className="text-gray-600 mt-1">AI-powered plant disease analysis</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Upload Plant Image</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
              {preview ? (
                <div className="space-y-4">
                  <img
                    src={preview}
                    alt="Selected plant"
                    className="max-w-full h-64 mx-auto object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setPreview(null);
                      setResult(null);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-6xl"> camera_alt</div>
                  <div>
                    <p className="text-gray-600 mb-2">Click to upload plant leaf image</p>
                    <p className="text-sm text-gray-500">Supports: JPG, PNG, WebP (Max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors inline-block"
                  >
                    Choose Image
                  </label>
                </div>
              )}
            </div>

            {selectedImage && (
              <button
                onClick={analyzeDisease}
                disabled={analyzing}
                className={`w-full mt-4 py-3 rounded-lg font-semibold transition-colors ${
                  analyzing
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {analyzing ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </span>
                ) : (
                  "Analyze Disease"
                )}
              </button>
            )}

            {/* Tips */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Tips for Best Results:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li> Capture clear, well-lit images</li>
                <li> Focus on the affected area of the leaf</li>
                <li> Include both healthy and diseased parts if possible</li>
                <li> Avoid blurry or dark images</li>
              </ul>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Analysis Results</h2>
            
            {result ? (
              <div className="space-y-4">
                {/* Disease Info */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-gray-800 text-lg">Detected Disease</h3>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{result.diseaseName}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(result.severity)}`}>
                      {result.severity.toUpperCase()} SEVERITY
                    </span>
                    <span className={`font-medium ${getConfidenceColor(result.confidence)}`}>
                      {result.confidence}% Confidence
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                  <p className="text-gray-600">{result.description}</p>
                </div>

                {/* Causes */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Causes</h4>
                  <ul className="text-yellow-700 space-y-1">
                    {result.causes?.map((cause, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2"> arrow_right</span>
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Prevention */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Prevention Measures</h4>
                  <ul className="text-green-700 space-y-1">
                    {result.prevention?.map((prevention, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2"> check_circle</span>
                        {prevention}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Treatment */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Treatment Recommendations</h4>
                  <ul className="text-blue-700 space-y-1">
                    {result.treatment?.map((treatment, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2"> medication</span>
                        {treatment}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors">
                    Save Report
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">
                    Consult Expert
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4"> analytics</div>
                <p>Upload and analyze a plant image to see results</p>
              </div>
            )}
          </div>
        </div>

        {/* History Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Analyses</h2>
          <div className="text-center py-8 text-gray-500">
            <p>No previous analyses found</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;
