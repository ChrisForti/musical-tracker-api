import React from "react";
import { Routes, Route } from "react-router-dom";
import { PublicMusicalDetail } from "../components/pages/public/PublicMusicalDetail";
import { PublicActorDirectory } from "../components/pages/public/PublicActorDirectory";
import { PublicActorDetail } from "../components/pages/public/PublicActorDetail";
import { PublicSearch } from "../components/pages/public/PublicSearch";
import { PublicAPIDocumentation } from "../components/pages/public/PublicAPIDocumentation";
import { PerformanceCalendar } from "../components/pages/public/PerformanceCalendar";

export default function PublicRoute() {
  return (
    <Routes>
      <Route path="/search" element={<PublicSearch />} />
      <Route path="/musical/:id" element={<PublicMusicalDetail />} />
      <Route path="/actors" element={<PublicActorDirectory />} />
      <Route path="/actor/:id" element={<PublicActorDetail />} />
      <Route path="/api-docs" element={<PublicAPIDocumentation />} />
      <Route path="/calendar" element={<PerformanceCalendar />} />
    </Routes>
  );
}
