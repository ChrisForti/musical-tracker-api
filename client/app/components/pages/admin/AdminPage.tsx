import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ActorPage from "../actors/ActorPage";
import MusicalPage from "../musicals/MusicalPage";
import PerformancePage from "../performances/PerformancePage";
import TheaterPage from "../theaters/TheaterPage";
import { RolePage } from "../roles/RolePage";
import { CastingPage } from "../castings/CastingPage";

export default function AdminPage() {
  const [currentSection, setCurrentSection] = useState<string>("dashboard");
  const navigate = useNavigate();

  const showSection = (section: string) => {
    setCurrentSection(section);
  };

  // Close current section and return to main admin view
  const closeSection = () => {
    setCurrentSection("dashboard");
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center">
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
            onClick={() => navigate("/")}
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

      <main className="flex-1 overflow-auto p-6">
        {/* Show different content based on current section */}
        {currentSection === "dashboard" ? (
          <>
            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mt-6">
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
              <section>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                    Performances
                  </h2>
                  <div className="space-y-2">
                    <p className="text-gray-700 dark:text-gray-300">
                      Total performances: 12 {/* Replace with actual count */}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      Pending approval: 3
                    </p>
                  </div>
                  <button
                    onClick={() => showSection("performances")}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  >
                    Manage Performances
                  </button>
                </div>
              </section>
              <section>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                    Theaters
                  </h2>
                  <div className="space-y-2">
                    <p className="text-gray-700 dark:text-gray-300">
                      Total theaters: 6 {/* Replace with actual count */}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      Pending approval: 2
                    </p>
                  </div>
                  <button
                    onClick={() => showSection("theaters")}
                    className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                  >
                    Manage Theaters
                  </button>
                </div>
              </section>
              <section>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                    Roles
                  </h2>
                  <div className="space-y-2">
                    <p className="text-gray-700 dark:text-gray-300">
                      Total roles: 15 {/* Replace with actual count */}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      Pending approval: 4
                    </p>
                  </div>
                  <button
                    onClick={() => showSection("roles")}
                    className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                  >
                    Manage Roles
                  </button>
                </div>
              </section>
              <section>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                    Castings
                  </h2>
                  <div className="space-y-2">
                    <p className="text-gray-700 dark:text-gray-300">
                      Total castings: 25 {/* Replace with actual count */}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      Active assignments: 18
                    </p>
                  </div>
                  <button
                    onClick={() => showSection("castings")}
                    className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md"
                  >
                    Manage Castings
                  </button>
                </div>
              </section>
            </div>
          </>
        ) : currentSection === "actors" ? (
          <ActorPage />
        ) : currentSection === "musicals" ? (
          <MusicalPage />
        ) : currentSection === "performances" ? (
          <PerformancePage />
        ) : currentSection === "theaters" ? (
          <TheaterPage />
        ) : currentSection === "roles" ? (
          <RolePage />
        ) : currentSection === "castings" ? (
          <CastingPage />
        ) : null}
      </main>
    </div>
  );
}
