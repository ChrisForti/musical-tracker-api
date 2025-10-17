import React from "react";
import RegistrationPage from "../components/pages/admin/RegistrationPage";

export default function RegisterRoute() {
  return (
    <div className="flex-1 ml-16 md:ml-64 min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-md mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Account
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Join the Musical Tracker community
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <RegistrationPage />
        </div>

        <div className="mt-6 text-center space-y-2">
          <a
            href="/login"
            className="block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
          >
            Already have an account? Sign In
          </a>
          <a
            href="/"
            className="block text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 text-sm"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
