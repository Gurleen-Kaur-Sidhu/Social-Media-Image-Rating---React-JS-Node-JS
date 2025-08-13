import React from "react";
import { Navigate, useLocation } from "react-router-dom";

// Authentication service: Check if user is authenticated
const checkAuth = () => {
  // Example check for a token in localStorage (you can adjust it to your needs)
  return Boolean(localStorage.getItem("authToken"));
};

// PrivateRoute component: Handles private route access based on authentication
const PrivateRoute = ({ element }) => {
  const isAuthenticated = checkAuth();
  const location = useLocation();

  // console.log("Checking auth:", isAuthenticated);
  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return element;
};

export default PrivateRoute;
