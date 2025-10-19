import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageTemplate } from "~/components/common/PageTemplate";
import { ImageDisplay } from "~/components/common/ImageDisplay";
import { useGlobalSearch } from "~/components/layout/ui/GlobalSearchProvider";
import { StatusBadge } from "~/components/common/StatusBadge";
import { useAuth } from "~/hooks/useAuth";
import { BackToDashboardButton } from "~/components/common/BackToDashboardButton";

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
  const { isAdmin } = useAuth();

  // Add these new state variables
  const [selectedMusicalId, setSelectedMusicalId] = useState<string | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");

  // Global search
  const { searchQuery } = useGlobalSearch();

  // Local filters (still needed for approval status, etc.)
  const [filters, setFilters] = useState<Record<string, any>>({});

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
          console.log("🎼 Musical API Response:", data); // Debug log
          // Map API data to component structure
          const mappedMusicals = data.map((musical: any) => {
            console.log(
              "🎼 Processing musical:",
              musical.name,
              "posterUrl:",
              musical.posterUrl
            ); // Debug log
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
          console.log("🎼 Mapped musicals:", mappedMusicals); // Debug log
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

  // Filter and search musicals
  const filteredMusicals = useMemo(() => {
    return musicals.filter((musical) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        musical.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        musical.composer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        musical.lyricist.toLowerCase().includes(searchQuery.toLowerCase());

      // Approval filter
      const matchesApproval =
        !filters.approved || musical.approved === filters.approved;

      // Composer filter
      const matchesComposer =
        !filters.composer || musical.composer === filters.composer;

      return matchesSearch && matchesApproval && matchesComposer;
    });
  }, [musicals, searchQuery, filters]);

  // Get unique composers for filter dropdown
  const uniqueComposers = useMemo(() => {
    const composers = [...new Set(musicals.map((m) => m.composer))];
    return composers.map((composer) => ({ value: composer, label: composer }));
  }, [musicals]);

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
              <StatusBadge verified={selectedMusical.approved} />
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
        <>
          {/* Back to Dashboard Button */}
          <div className="mb-4">
            <BackToDashboardButton />
          </div>

          {/* Filter Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Composer
                </label>
                <select
                  value={filters.composer || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      composer: e.target.value,
                    }))
                  }
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">All Composers</option>
                  {uniqueComposers.map((composer) => (
                    <option key={composer.value} value={composer.value}>
                      {composer.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.approved || false}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        approved: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 dark:border-gray-600 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Show only verified
                  </span>
                </label>
              </div>

              {(filters.composer || filters.approved) && (
                <button
                  onClick={() => setFilters({})}
                  className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {searchQuery && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200">
                  Search: {searchQuery}
                </span>
              </div>
            )}
          </div>

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
                {filteredMusicals.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                    >
                      {searchQuery || Object.keys(filters).length > 0
                        ? "No musicals match your search criteria."
                        : "No musicals available."}
                    </td>
                  </tr>
                ) : (
                  filteredMusicals.map((musical) => (
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
                        <StatusBadge verified={musical.approved} size="sm" />
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
                          onClick={() =>
                            navigate(`/musicals/edit/${musical.id}`)
                          }
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </PageTemplate>
  );
}
