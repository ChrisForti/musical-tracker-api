import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageTemplate } from "~/components/common/PageTemplate";
import { SearchFilter } from "~/components/layout/ui/SearchFilter";
import { useAuth } from "~/hooks/useAuth";

// Interface to match API response
interface Performance {
  id: string;
  posterUrl: string;
  date: string;
  theaterName: string;
  theaterId: string;
  musicalName: string;
}

export default function PerformancePage() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerformanceId, setSelectedPerformanceId] = useState<
    string | null
  >(null);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchPerformances = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("http://localhost:3000/v2/performance", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("🎭 Performance API Response:", data); // Debug log
          if (data.length > 0) {
            console.log("🎭 First performance object:", data[0]); // Debug log
          }
          setPerformances(data);
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } catch (err) {
        console.error("Error fetching performances:", err);
        setError("Failed to load performances. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPerformances();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this performance?")) {
      try {
        // Make API call to delete
        // const response = await fetch(`http://localhost:3000/v1/performances/${id}`, {
        //   method: 'DELETE'
        // });

        // if (!response.ok) {
        //   throw new Error(`Error ${response.status}: ${response.statusText}`);
        // }

        // Remove from local state
        setPerformances(
          performances.filter((performance) => performance.id !== id)
        );

        // If we're viewing the deleted performance, go back to list
        if (selectedPerformanceId === id) {
          setViewMode("list");
          setSelectedPerformanceId(null);
        }

        console.log("Performance deleted:", id);
      } catch (error) {
        console.error("Failed to delete performance:", error);
        alert("Failed to delete performance. Please try again.");
      }
    }
  };

  // Function to find the selected performance
  const selectedPerformance = selectedPerformanceId
    ? performances.find((p) => p.id === selectedPerformanceId)
    : null;

  // Handle going back to list view
  const handleBackToList = () => {
    setViewMode("list");
    setSelectedPerformanceId(null);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render detail view
  if (viewMode === "detail" && selectedPerformance) {
    return (
      <PageTemplate
        title={`${selectedPerformance.musicalName} - ${formatDate(selectedPerformance.date)}`}
        backButton={{
          label: "Back to Performances",
          onClick: handleBackToList,
        }}
      >
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {selectedPerformance.musicalName}
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                  Performance Details
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                  <div>
                    <span className="font-medium">Date:</span>{" "}
                    {formatDate(selectedPerformance.date)}
                  </div>
                  <div>
                    <span className="font-medium">Theater:</span>{" "}
                    {selectedPerformance.theaterName}
                  </div>
                  <div>
                    <span className="font-medium">Musical:</span>{" "}
                    {selectedPerformance.musicalName}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                  Additional Information
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  This is a performance of {selectedPerformance.musicalName} at{" "}
                  {selectedPerformance.theaterName}.
                </p>

                {/* You could add links to related entities */}
                <div className="mt-4">
                  <div>
                    <a
                      href={`/theaters/view/${selectedPerformance.theaterId}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Theater Details
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md"
                onClick={() =>
                  navigate(`/performances/edit/${selectedPerformance.id}`)
                }
              >
                Edit Performance
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                onClick={() => handleDelete(selectedPerformance.id)}
              >
                Delete Performance
              </button>
            </div>
          </div>
        </div>
      </PageTemplate>
    );
  }

  // List view (default)
  return (
    <PageTemplate
      title="Performances"
      actionButton={{
        label: "Add Performance",
        onClick: () => navigate("/performances/new"),
      }}
      backButton={
        isAdmin
          ? {
              label: "Back to Dashboard",
              onClick: () => navigate("/admin"),
            }
          : undefined
      }
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-4 text-center">Loading performances...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Musical
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Theater
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {performances.map((performance) => (
                <tr key={performance.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {performance.musicalName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {performance.theaterName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatDate(performance.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {performance.theaterName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => {
                        setSelectedPerformanceId(performance.id);
                        setViewMode("detail");
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/performances/edit/${performance.id}`)
                      }
                      className="text-amber-600 hover:text-amber-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(performance.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageTemplate>
  );
}
