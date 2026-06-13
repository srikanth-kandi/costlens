import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/auth/ProtectedRoute";
import AppLayout from "@/layouts/AppLayout";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Meetings = lazy(() => import("@/pages/Meetings"));
const Attribution = lazy(() => import("@/pages/Attribution"));
const Projects = lazy(() => import("@/pages/Projects"));
const Anomalies = lazy(() => import("@/pages/Anomalies"));
const HRAdmin = lazy(() => import("@/pages/HRAdmin"));
const Login = lazy(() => import("@/pages/Login"));

function RouteLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="meetings" element={<Meetings />} />
              <Route path="attribution" element={<Attribution />} />
              <Route path="projects" element={<Projects />} />
              <Route path="anomalies" element={<Anomalies />} />
              <Route path="admin/hr" element={<HRAdmin />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
