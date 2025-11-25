import React from "react";
import LoginPage from "../components/pages/admin/LoginPage";

export default function LoginRoute() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sign In
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Access your Musical Tracker account
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <LoginPage />
        </div>

        <div className="mt-6 text-center space-y-2">
          <a
            href="/"
            className="block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
          >
            ← Back to Home
          </a>
          <a
            href="/public/musicals"
            className="block text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 text-sm"
          >
            Browse Musicals Without Signing In
          </a>
        </div>
      </div>
    </div>
  );
}
