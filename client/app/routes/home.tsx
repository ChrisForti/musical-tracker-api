import React from "react";
import { AppLayout } from "~/components/layout/AppLayout";
import MainDashboard from "~/components/pages/MainDashboard";

export default function Home() {
  return (
    <AppLayout>
      <MainDashboard />
    </AppLayout>
  );
}
