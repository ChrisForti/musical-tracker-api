import React from "react";
import Header from "./header/Header";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header />

      {/* Sidebar */}
      <aside>
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-16 md:ml-64 pt-20">
        <div className="min-h-screen">{children}</div>
      </main>
    </div>
  );
}
