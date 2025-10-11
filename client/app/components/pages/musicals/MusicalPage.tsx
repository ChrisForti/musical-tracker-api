import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageTemplate } from "~/components/common/PageTemplate";
import { ImageDisplay } from "~/components/common/ImageDisplay";

interface Musical {
  id: string;
  title: string;
  composer: string;
  lyricist: string;
  approved: boolean;
  synopsis?: string;
  posterId?: string;
  posterUrl?: string;
}

export default function MusicalPage() {
  const [musicals, setMusicals] = useState<Musical[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Add these new state variables
  const [selectedMusicalId, setSelectedMusicalId] = useState<string | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");

  useEffect(() => {
    const fetchMusicals = async () => {
      try {
        const token = localStorage.getItem("authToken");
        
        const response = await fetch("http://localhost:3000/v2/musical", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Map API data to component structure
          const mappedMusicals = data.map((musical: any) => {
            return {
              id: musical.id,
              title: musical.name, // API returns 'name', component expects 'title'
              composer: musical.composer,
              lyricist: musical.lyricist,
              approved: musical.verified, // API returns 'verified', component expects 'approved'
              posterId: musical.posterId,
              posterUrl: musical.posterUrl,
            };
          });
          setMusicals(mappedMusicals);
        } else {
          console.error("Failed to fetch musicals:", response.statusText);
        }
      } catch (err) {
        console.error("Error fetching musicals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMusicals();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this musical?")) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`http://localhost:3000/v2/musical/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          // Update local state
          setMusicals(musicals.filter((musical) => musical.id !== id));

          // If we're viewing the musical that's being deleted, go back to list view
          if (selectedMusicalId === id) {
            setViewMode("list");
            setSelectedMusicalId(null);
          }
        } else {
          console.error("Failed to delete musical:", response.statusText);
        }
      } catch (error) {
        console.error("Failed to delete musical:", error);
      }
    }
  };

  // Function to find the selected musical
  const selectedMusical = selectedMusicalId
    ? musicals.find((m) => m.id === selectedMusicalId)
    : null;

  // Handle going back to list view
  const handleBackToList = () => {
    setViewMode("list");
    setSelectedMusicalId(null);
  };

  // Render detail view
  if (viewMode === "detail" && selectedMusical) {
    return (
      <PageTemplate
        title={selectedMusical.title}
        backButton={{
          label: "Back to Musicals",
          onClick: handleBackToList,
        }}
      >
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {selectedMusical.title}
              </h1>
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedMusical.approved
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {selectedMusical.approved ? "Approved" : "Pending Approval"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                  Details
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                  <div>
                    <span className="font-medium">Composer:</span>{" "}
                    {selectedMusical.composer}
                  </div>
                  <div>
                    <span className="font-medium">Lyricist:</span>{" "}
                    {selectedMusical.lyricist}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                  Synopsis
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {selectedMusical.synopsis || "No synopsis available."}
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md"
                onClick={() => navigate(`/musicals/edit/${selectedMusical.id}`)}
              >
                Edit Musical
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                onClick={() => handleDelete(selectedMusical.id)}
              >
                Delete Musical
              </button>
            </div>
          </div>
        </div>
      </PageTemplate>
    );
  }

  // Render list view (this is the original return statement)
  return (
    <PageTemplate
      title="Musicals"
      actionButton={{
        label: "Add Musical",
        onClick: () => navigate("/musicals/new"),
      }}
    >
      {loading ? (
        <div className="p-4 text-center">Loading musicals...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Poster {/* Should be visible now */}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Composer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Lyricist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {musicals.map((musical) => (
                <tr key={musical.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ImageDisplay
                      imageUrl={musical.posterUrl}
                      altText={`${musical.title} poster`}
                      size="thumbnail"
                      fallbackIcon="🎭"
                      showFullSizeOnClick={true}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {musical.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {musical.composer}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {musical.lyricist}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {musical.approved ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Approved
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => {
                        // Changed from navigation to setting state
                        setSelectedMusicalId(musical.id);
                        setViewMode("detail");
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/musicals/edit/${musical.id}`)}
                      className="text-amber-600 hover:text-amber-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(musical.id)}
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
