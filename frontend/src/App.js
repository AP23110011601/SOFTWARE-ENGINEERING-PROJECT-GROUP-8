import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Public Pages
import Home from "./pages/Home";
import SignupEnhanced from "./pages/SignupEnhanced";
import LoginEnhanced from "./pages/LoginEnhanced";
import ForgotPassword from "./pages/ForgotPassword";

// Layout & Auth Guard
import DashboardLayout from "./layouts/DashboardLayout";
import PrivateRoute from "./components/PrivateRoute";
import NotificationProvider, { NotificationContainer } from "./components/NotificationSystemFixed";

// User Pages
import DashboardProduct from "./pages/DashboardProduct";
import SoilEnvironment from "./pages/SoilEnvironment";
import CropRecommendation from "./pages/CropRecommendation";
import DiseaseDetectionEnhanced from "./pages/DiseaseDetectionEnhanced";
import AlertsPage from "./pages/AlertsPage";
import ProfileWorking from "./pages/ProfileWorking";
import GovernmentSchemes from "./pages/GovernmentSchemes";

// Admin Pages
import AdminComplete from "./pages/AdminComplete";
import AdminUsers from "./pages/AdminUsers";
import AdminSensors from "./pages/AdminSensors";
import AdminAlerts from "./pages/AdminAlerts";
import AdminSettings from "./pages/AdminSettings";
import AdminSchemes from "./pages/AdminSchemes";
import AdminAnalytics from "./pages/AdminAnalytics";

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* ────────── PUBLIC ROUTES ────────── */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginEnhanced />} />
          <Route path="/signup" element={<SignupEnhanced />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ────────── USER PROTECTED ROUTES ────────── */}
          <Route element={<PrivateRoute requiredRole="user" />}>
            <Route element={<DashboardLayout role="user" />}>
              <Route path="/dashboard" element={<DashboardProduct />} />
              <Route path="/user/soil" element={<SoilEnvironment />} />
              <Route path="/user/crop-recommendation" element={<CropRecommendation />} />
              <Route path="/disease" element={<DiseaseDetectionEnhanced />} />
              <Route path="/user/alerts" element={<AlertsPage />} />
              <Route path="/user/schemes" element={<GovernmentSchemes />} />
              <Route path="/profile" element={<ProfileWorking />} />
              {/* Catch-all for any /user/* sub-routes */}
              <Route path="/user/*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>

          {/* ────────── ADMIN PROTECTED ROUTES ────────── */}
          <Route element={<PrivateRoute requiredRole="admin" />}>
            <Route element={<DashboardLayout role="admin" />}>
              <Route path="/admin/dashboard" element={<AdminComplete />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/sensors" element={<AdminSensors />} />
              <Route path="/admin/alerts" element={<AdminAlerts />} />
              <Route path="/admin/schemes" element={<AdminSchemes />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              {/* Catch-all for any /admin/* sub-routes */}
              <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Route>

          {/* ────────── FALLBACK ────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <NotificationContainer />
      </Router>
    </NotificationProvider>
  );
}

export default App;