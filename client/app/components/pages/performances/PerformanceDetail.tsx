import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageTemplate } from "~/components/common/PageTemplate";

interface Performance {
  id: string;
  productionId: string;
  date: string;
  theaterId: string;

  // Joined data
  productionName?: string;
  musicalTitle?: string;
  theaterName?: string;
  approved?: boolean;
}

interface PerformanceDetailProps {
  performanceId: string;
}

export default function PerformanceDetail({
  performanceId,
}: PerformanceDetailProps) {
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    const fetchPerformance = async () => {
      setLoading(true);
      setError(null);

      try {
        // Attempt to fetch from API
        // const response = await fetch(`http://localhost:3000/v1/performances/${performanceId}`);
        // if (!response.ok) {
        //   throw new Error(`Error ${response.status}: ${response.statusText}`);
        // }
        // const data = await response.json();
        // setPerformance(data);

        // Using sample data for now
        const samplePerformances = [
          {
            id: "1",
            productionId: "prod1",
            date: "2025-07-20",
            theaterId: "theater1",
            // Joined data
            productionName: "Broadway Revival",
            musicalTitle: "Hamilton",
            theaterName: "Gershwin Theatre",
            approved: true,
          },
          {
            id: "2",
            productionId: "prod2",
            date: "2025-07-21",
            theaterId: "theater2",
            // Joined data
            productionName: "National Tour",
            musicalTitle: "The Phantom of the Opera",
            theaterName: "Kennedy Center",
            approved: true,
          },
          {
            id: "3",
            productionId: "prod3",
            date: "2025-07-22",
            theaterId: "theater3",
            // Joined data
            productionName: "West End Production",
            musicalTitle: "Les Misérables",
            theaterName: "Queen's Theatre",
            approved: false,
          },
        ];

        const foundPerformance = samplePerformances.find(
          (p) => p.id === performanceId
        );
        if (foundPerformance) {
          setPerformance(foundPerformance);
        } else {
          setError("Performance not found");
        }
      } catch (err) {
        console.error("Error fetching performance:", err);
        setError("Failed to load performance details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [performanceId]);

  const handleDelete = async () => {
    if (!performance) return;

    if (confirm("Are you sure you want to delete this performance?")) {
      try {
        // Make API call to delete the performance
        // const response = await fetch(`http://localhost:3000/v1/performances/${performance.id}`, {
        //   method: "DELETE"
        // });

        // if (!response.ok) {
        //   throw new Error(`Error ${response.status}: ${response.statusText}`);
        // }

        console.log("Performance deleted:", performance.id);

        // Navigate back to the list after successful deletion
        navigate("/performances");
      } catch (error) {
        console.error("Failed to delete performance:", error);
        alert("Failed to delete performance. Please try again.");
      }
    }
  };

  return (
    <PageTemplate
      title={
        performance
          ? `${performance.musicalTitle} - ${formatDate(performance.date)}`
          : "Performance Details"
      }
      backButton={{
        label: "Back to Performances",
        onClick: () => navigate("/performances"),
      }}
    >
      {loading ? (
        <div className="p-4 text-center">Loading performance details...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {error}
        </div>
      ) : !performance ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">
          Performance not found.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {performance.musicalTitle}
              </h1>
              {performance.approved !== undefined && (
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    performance.approved
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {performance.approved ? "Approved" : "Pending Approval"}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                  Performance Details
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                  <div>
                    <span className="font-medium">Date:</span>{" "}
                    {formatDate(performance.date)}
                  </div>
                  <div>
                    <span className="font-medium">Theater:</span>{" "}
                    {performance.theaterName}
                  </div>
                  <div>
                    <span className="font-medium">Production:</span>{" "}
                    {performance.productionName}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                  Related Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <a
                      href={`/productions/view/${performance.productionId}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Production Details
                    </a>
                  </div>
                  <div>
                    <a
                      href={`/theaters/view/${performance.theaterId}`}
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
                onClick={() => navigate(`/performances/edit/${performance.id}`)}
              >
                Edit Performance
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                onClick={handleDelete}
              >
                Delete Performance
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTemplate>
  );
}
