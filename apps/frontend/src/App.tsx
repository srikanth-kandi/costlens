import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Meetings from "@/pages/Meetings";
import Attribution from "@/pages/Attribution";
import Projects from "@/pages/Projects";
import Anomalies from "@/pages/Anomalies";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="meetings" element={<Meetings />} />
          <Route path="attribution" element={<Attribution />} />
          <Route path="projects" element={<Projects />} />
          <Route path="anomalies" element={<Anomalies />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
