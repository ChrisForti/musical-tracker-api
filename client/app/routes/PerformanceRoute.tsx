import React from "react";
import { Routes, Route, useParams } from "react-router-dom";
import PerformancePage from "../components/pages/performances/PerformancePage";
import PerformanceForm from "../components/pages/performances/PerformanceForm";
import PerformanceDetail from "../components/pages/performances/PerformanceDetail";

// Wrapper component for PerformanceDetail
function PerformanceDetailWrapper() {
  const { id } = useParams<{ id: string }>();
  return <PerformanceDetail performanceId={id || ""} />;
}

// Wrapper component for PerformanceForm (edit mode)
function PerformanceFormEditWrapper() {
  const { id } = useParams<{ id: string }>();
  return <PerformanceForm mode="edit" performanceId={id || ""} />;
}

export default function PerformanceRoute() {
  return (
    <Routes>
      <Route index element={<PerformancePage />} />
      <Route path="new" element={<PerformanceForm mode="create" />} />
      <Route path="edit/:id" element={<PerformanceFormEditWrapper />} />
      <Route path="view/:id" element={<PerformanceDetailWrapper />} />
      <Route path="*" element={<PerformancePage />} />
    </Routes>
  );
}
