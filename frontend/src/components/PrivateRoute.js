import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * PrivateRoute - Protects routes behind authentication.
 * If no token found → redirect to /login.
 * If role is specified → verify user role matches, otherwise redirect to correct home.
 */
const PrivateRoute = ({ requiredRole }) => {
  const location = useLocation();

  const token = localStorage.getItem("token");
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  // Not logged in at all → go to login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check: if a specific role is required and user doesn't have it
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to the correct dashboard for the user's role
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};

export default PrivateRoute;
