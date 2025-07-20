// Create this file at: /Users/fortis/repos/musical-tracker-api/client/app/routes/404.tsx

import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-gray-800 dark:text-white">404</h1>
      <h2 className="mt-4 text-2xl font-medium text-gray-700 dark:text-gray-300">
        Page Not Found
      </h2>
      <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-md">
        We couldn't find the page you're looking for. It might have been moved
        or deleted.
      </p>
      <div className="mt-8">
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}
