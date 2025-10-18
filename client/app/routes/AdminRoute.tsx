import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Header from "~/components/layout/header/Header";
import { Sidebar } from "~/components/layout/Sidebar";
import { AdminDashboard } from "../components/pages/admin/AdminDashboard";
import PendingApprovalsPage from "../components/pages/admin/PendingApprovalsPage";
import { useAuth } from "../hooks/useAuth";

export default function AdminRoute() {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAuth();

  // Check if user is admin
  if (isLoading) {
    return (
      <div className="flex-1 ml-16 md:ml-64 min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div>
        <Header />
        <aside>
          <Sidebar />
        </aside>
        <div className="flex-1 ml-16 md:ml-64 min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Access Denied
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You need admin privileges to access this page.
              </p>
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <aside>
        <Sidebar />
      </aside>
      <div className="flex-1 ml-16 md:ml-64 min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/pending" element={<PendingApprovalsPage />} />
        </Routes>
      </div>
    </div>
  );
}
