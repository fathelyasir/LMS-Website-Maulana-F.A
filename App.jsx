import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./Authcontext.jsx";
import DashboardShell from "./Dashboardshell.jsx";
import LoginPage from "./LoginPage.jsx";
import RegisterPage from "./RegisterPage.jsx";
import ProtectedRoute from "./Protectedroute.jsx";
import LearningPage, { WorkspaceNav } from "./LearningPage.jsx";

function RoleHome() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/landing" replace />;
  const base = user.peran === "guru" ? "/guru" : user.peran === "admin" ? "/admin" : "/siswa";
  return <Navigate to={`${base}/ringkasan`} replace />;
}

function WorkspacePage() {
  const { user } = useAuth();
  return <DashboardShell navItems={WorkspaceNav({ role: user?.peran })}><LearningPage /></DashboardShell>;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RoleHome />} />
        <Route path="/landing" element={<LandingRedirect />} />
        <Route path="/masuk" element={<LoginPage />} />
        <Route path="/daftar" element={<RegisterPage />} />

        <Route path="/guru/:section" element={<ProtectedRoute allowedRoles={["guru"]}><WorkspacePage /></ProtectedRoute>} />
        <Route path="/siswa/:section" element={<ProtectedRoute allowedRoles={["siswa"]}><WorkspacePage /></ProtectedRoute>} />
        <Route path="/admin/:section" element={<ProtectedRoute allowedRoles={["admin"]}><WorkspacePage /></ProtectedRoute>} />

        <Route path="/guru" element={<Navigate to="/guru/ringkasan" replace />} />
        <Route path="/siswa" element={<Navigate to="/siswa/ringkasan" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/ringkasan" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

function LandingRedirect() {
  window.location.replace("./landing.html");
  return null;
}