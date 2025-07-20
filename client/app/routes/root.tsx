// Create this file at: /Users/fortis/repos/musical-tracker-api/client/app/routes/root.tsx

import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/header/Header";
import { Sidebar } from "../components/layout/Sidebar";

export default function RootLayout() {
  // Any state or functions needed for sidebar
  const closeAdmin = () => {
    console.log("Admin panel closed");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header at the top */}
      <Header />

      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar on the left */}
        <Sidebar closeAdmin={closeAdmin} />

        {/* Main content area that will render the current route */}
        <main className="flex-1 overflow-y-auto p-6 ml-16 md:ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
