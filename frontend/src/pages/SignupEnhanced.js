import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Leaf, User, MapPin, Phone, Mail, Lock, Wheat, Droplet } from "lucide-react";

const SignupEnhanced = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    state: "",
    district: "",
    cropType: "",
    soilType: "",
    landSize: ""
  });

  const steps = [
    { id: 1, title: "Personal Info", icon: User },
    { id: 2, title: "Location", icon: MapPin },
    { id: 3, title: "Farm Details", icon: Wheat },
    { id: 4, title: "Account Setup", icon: Lock }
  ];

  const cropTypes = [
    { value: "Rice", label: "🌾 Rice", description: "Ideal for clay soil" },
    { value: "Wheat", label: "🌾 Wheat", description: "Best for loamy soil" },
    { value: "Cotton", label: "☁️ Cotton", description: "Prefers sandy soil" },
    { value: "Maize", label: "🌽 Maize", description: "Versatile crop choice" }
  ];

  const soilTypes = [
    { value: "Clay", label: "🟫 Clay", description: "High water retention" },
    { value: "Sandy", label: "🟨 Sandy", description: "Good drainage" },
    { value: "Loamy", label: "🟤 Loamy", description: "Balanced nutrients" }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.email && formData.phone;
      case 2:
        return formData.state && formData.district;
      case 3:
        return formData.cropType && formData.soilType && formData.landSize;
      case 4:
        return formData.password;
      default:
        return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert("Registration successful! Please login to continue.");
        navigate("/login");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Personal Information</h3>
            
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="John Doe"
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <User size={20} />
                  </div>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="farmer@farm.com"
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Mail size={20} />
                  </div>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="+91 98765 43210"
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Phone size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Farm Location</h3>
            
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="e.g., Punjab"
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <MapPin size={20} />
                  </div>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="e.g., Ludhiana"
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <MapPin size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Farm Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crop Type
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {cropTypes.map((crop) => (
                    <label
                      key={crop.value}
                      className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:border-green-500 hover:bg-green-50"
                      style={{
                        borderColor: formData.cropType === crop.value ? "#10b981" : "#d1d5db",
                        backgroundColor: formData.cropType === crop.value ? "#f0fdf4" : "transparent"
                      }}
                    >
                      <input
                        type="radio"
                        name="cropType"
                        value={crop.value}
                        onChange={handleChange}
                        className="sr-only"
                        required
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">{crop.label}</div>
                        <div className="text-sm text-gray-500">{crop.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Soil Type
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {soilTypes.map((soil) => (
                    <label
                      key={soil.value}
                      className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:border-green-500 hover:bg-green-50"
                      style={{
                        borderColor: formData.soilType === soil.value ? "#10b981" : "#d1d5db",
                        backgroundColor: formData.soilType === soil.value ? "#f0fdf4" : "transparent"
                      }}
                    >
                      <input
                        type="radio"
                        name="soilType"
                        value={soil.value}
                        onChange={handleChange}
                        className="sr-only"
                        required
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">{soil.label}</div>
                        <div className="text-sm text-gray-500">{soil.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Land Size (Acres)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="landSize"
                    value={formData.landSize}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="e.g., 5"
                    min="1"
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Wheat size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Account Setup</h3>
            
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Create a strong password"
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Lock size={20} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">Your Farm Summary:</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>Name:</strong> {formData.name}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Location:</strong> {formData.district}, {formData.state}</p>
                  <p><strong>Crop:</strong> {cropTypes.find(c => c.value === formData.cropType)?.label}</p>
                  <p><strong>Soil:</strong> {soilTypes.find(s => s.value === formData.soilType)?.label}</p>
                  <p><strong>Land:</strong> {formData.landSize} acres</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-emerald-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-green-100 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-28 h-28 bg-emerald-100 rounded-full opacity-15 animate-bounce"></div>
      </div>

      {/* Main Signup Card */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-100 p-8 transform transition-all duration-300">
          
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg">
              <Leaf className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              Create Your Farm Account
            </h1>
            <p className="text-gray-600 text-sm">Join thousands of smart farmers today</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentStep >= step.id
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  <step.icon size={20} />
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-full h-1 mx-4 transition-all duration-300 ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-shake">
              {error}
            </div>
          )}

          {/* Step Content */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep()}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading || !validateStep()}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-green-600 hover:text-green-700 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default SignupEnhanced;
