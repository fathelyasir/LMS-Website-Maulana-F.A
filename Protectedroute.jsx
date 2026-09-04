// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./Authcontext.jsx";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/masuk" replace />;
  if (allowedRoles && !allowedRoles.includes(user.peran)) {
    const home = user.peran === "guru" ? "/guru" : user.peran === "admin" ? "/admin" : "/siswa";
    return <Navigate to={`${home}/ringkasan`} replace />;
  }
  return children;
}