import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import JobsPage from "./pages/JobsPage.jsx";
import JobDetailPage from "./pages/JobDetailPage.jsx";
import ApplyAllPage from "./pages/ApplyAllPage.jsx";
import ApplicationsPage from "./pages/ApplicationsPage.jsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/jobs" replace />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/apply-all" element={<ApplyAllPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
      </Routes>
    </Layout>
  );
}
