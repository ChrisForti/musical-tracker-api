import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { AppLayout } from "~/components/layout/AppLayout";
import { AdminDashboard } from "../components/pages/admin/AdminDashboard";
import { AnalyticsDashboard } from "../components/pages/analytics/AnalyticsDashboard";
import { SchedulingCalendar } from "../components/pages/scheduling/SchedulingCalendar";
import EmailNotifications from "../components/pages/admin/EmailNotifications";
import ImportExportSystem from "../components/pages/admin/ImportExportSystem";
import PendingApprovalsPage from "../components/pages/admin/PendingApprovalsPage";
import PerformanceManagement from "../components/pages/performances/PerformanceManagement";
import { UserPage } from "./UserPage";
import { useAuth } from "../hooks/useAuth";

export default function AdminRoute() {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAuth();

  // Check if user is admin
  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 mx-auto"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You need admin privileges to access this area.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go Home
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/pending" element={<PendingApprovalsPage />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/scheduling" element={<SchedulingCalendar />} />
        <Route path="/notifications" element={<EmailNotifications />} />
        <Route path="/import-export" element={<ImportExportSystem />} />
        <Route path="/performances" element={<PerformanceManagement />} />
      </Routes>
    </AppLayout>
  );
}
