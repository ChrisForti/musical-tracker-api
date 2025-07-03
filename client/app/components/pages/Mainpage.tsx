import Admin from "./Admin";
import { useState } from "react";

interface MainpageProps {
  showAdmin?: boolean;
  closeAdmin: () => void;
}

export default function Mainpage({
  showAdmin = false,
  closeAdmin,
}: MainpageProps) {
  return (
    <div className="flex-1 ml-16 md:ml-64 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main content container - adjusts based on sidebar width */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {showAdmin ? (
          <Admin closeAdmin={closeAdmin} />
        ) : (
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
            <div className="p-6">
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
                Welcome to Musical Tracker
              </h1>

              <p className="mb-4 text-gray-600 dark:text-gray-300">
                This is your main dashboard area. Select an option from the
                sidebar to get started.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                  <h3 className="font-medium text-lg mb-2 text-gray-800 dark:text-white">
                    Recent Songs
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    View and manage your recently added songs.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                  <h3 className="font-medium text-lg mb-2 text-gray-800 dark:text-white">
                    Artists
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Browse your favorite artists and discover new ones.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                  <h3 className="font-medium text-lg mb-2 text-gray-800 dark:text-white">
                    Analytics
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    See insights about your listening habits.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
