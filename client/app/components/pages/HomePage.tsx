import React from "react";
import { useAuth } from "~/hooks/useAuth";
import { AdminDashboard } from "~/components/pages/admin/AdminDashboard";

interface HomePageProps {
  showAdmin?: boolean;
  closeAdmin: () => void;
}

export default function HomePage({
  showAdmin = false,
  closeAdmin,
}: HomePageProps) {
  const { user, isLoading, isAdmin } = useAuth();

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

  return (
    <div className="flex-1 ml-16 md:ml-64 min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Show admin dashboard if user is an admin, otherwise show welcome */}
      {isAdmin ? (
        <AdminDashboard />
      ) : (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Welcome content for regular users */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to Musical Tracker
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Your comprehensive database for musical theater productions
            </p>

            {user ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Hello, {user.firstName}! 👋
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Explore our database of musicals, actors, performances, and
                  theaters.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4">
                    <div className="text-3xl mb-2">🎭</div>
                    <div className="text-sm font-medium">Browse Musicals</div>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-3xl mb-2">👤</div>
                    <div className="text-sm font-medium">Find Actors</div>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-3xl mb-2">🎪</div>
                    <div className="text-sm font-medium">View Performances</div>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-3xl mb-2">🏛️</div>
                    <div className="text-sm font-medium">Explore Theaters</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 max-w-2xl mx-auto">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Get Started
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Sign in to access all features and contribute to our musical
                    theater database, or explore what's available to everyone.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="/login"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      🔐 Sign In
                    </a>
                    <a
                      href="/public/musicals"
                      className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      🎭 Browse Musicals
                    </a>
                  </div>
                </div>

                {/* Public Features Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <a
                    href="/public/musicals"
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      📚 Musical Directory
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Explore our collection of musicals with search and
                      filtering capabilities.
                    </p>
                  </a>

                  <a
                    href="/public/calendar"
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      📅 Performance Calendar
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      View upcoming performances and theater schedules.
                    </p>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
