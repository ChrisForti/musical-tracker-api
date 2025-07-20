import React from "react";
import { useParams } from "react-router-dom";
import PerformancePage from "./PerformancePage";
import PerformanceDetail from "./PerformanceDetail";
import PerformanceForm from "./PerformanceForm";

export default function PerformanceRouter() {
  // Get parameters from the URL
  const { action, id } = useParams<{ action?: string; id?: string }>();

  // Determine which component to render based on URL parameters
  if (action === "new") {
    return <PerformanceForm mode="create" />;
  } else if (action === "edit" && id) {
    return <PerformanceForm mode="edit" performanceId={id} />;
  } else if ((action === "view" || !action) && id) {
    return <PerformanceDetail performanceId={id} />;
  } else {
    // Default to list view
    return <PerformancePage />;
  }
}
