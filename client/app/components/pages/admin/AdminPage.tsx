import { useState } from "react";

import ActorPage from "../actors/ActorPage"; // Import your ActorPage component
import MusicalPage from "../musicals/MusicalPage";

export default function AdminPage({ closeAdmin }: { closeAdmin: () => void }) {
  const [currentSection, setCurrentSection] = useState<string>("dashboard");

  // Function to handle section navigation
  const showSection = (section: string) => {
    setCurrentSection(section);
  };

  // Close current section and return to main admin view
  const closeSection = () => {
    setCurrentSection("dashboard");
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 h-full overflow-y-auto">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-teal-600">Admin Dashboard</h1>
        <div className="flex space-x-3">
          {currentSection !== "dashboard" && (
            <button
              onClick={closeSection}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md flex items-center"
            >
              <svg
                className="w-5 h-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Dashboard
            </button>
          )}

          <button
            onClick={closeAdmin}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md flex items-center"
          >
            <svg
              className="w-5 h-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Close Admin
          </button>
        </div>
      </header>

      <main className="p-6">
        {/* Show different content based on current section */}
        {currentSection === "dashboard" ? (
          <>
            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Actor Management Card */}
              <section>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                    Actors
                  </h2>
                  <div className="space-y-2">
                    <p className="text-gray-700 dark:text-gray-300">
                      Total actors: 8 {/* Replace with actual count */}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      Pending approval: 5
                    </p>
                  </div>
                  <button //imbedded button to manage actors
                    onClick={() => showSection("actors")}
                    className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md"
                  >
                    Manage Actors
                  </button>
                </div>
              </section>
              <section>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                    Musicals
                  </h2>
                  <div className="space-y-2">
                    <p className="text-gray-700 dark:text-gray-300">
                      Total musicals: 4 {/* Replace with actual count */}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      Pending approval: 1
                    </p>
                  </div>
                  <a
                    onClick={() => showSection("musicals")}
                    className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md inline-block"
                  >
                    Manage Musicals
                  </a>
                </div>
              </section>
            </div>
          </>
        ) : currentSection === "actors" ? (
          <ActorPage />
        ) : currentSection === "musicals" ? (
          <MusicalPage />
        ) : null}
      </main>
    </div>
  );
}
