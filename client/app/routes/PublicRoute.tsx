import React from "react";
import { Routes, Route } from "react-router-dom";
import { PublicMusicalDirectory } from "../components/pages/public/PublicMusicalDirectory";
import { PublicMusicalDetail } from "../components/pages/public/PublicMusicalDetail";
import { PerformanceCalendar } from "../components/pages/public/PerformanceCalendar";

export default function PublicRoute() {
  return (
    <Routes>
      <Route path="/musicals" element={<PublicMusicalDirectory />} />
      <Route path="/musical/:id" element={<PublicMusicalDetail />} />
      <Route path="/calendar" element={<PerformanceCalendar />} />
    </Routes>
  );
}
