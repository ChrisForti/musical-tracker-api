import React from "react";
import { Routes, Route } from "react-router-dom";
import { CastingPage } from "./CastingPage";
import { CastingForm } from "./CastingForm";
import { CastingDetail } from "./CastingDetail";

export function CastingRoute() {
  return (
    <Routes>
      <Route path="/" element={<CastingPage />} />
      <Route path="/new" element={<CastingForm />} />
      <Route path="/:id" element={<CastingDetail />} />
      <Route path="/:id/edit" element={<CastingForm />} />
    </Routes>
  );
}
