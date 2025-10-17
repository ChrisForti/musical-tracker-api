import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageTemplate } from "~/components/common/PageTemplate";
import { useGlobalSearch } from "~/components/layout/ui/GlobalSearchProvider";
import { StatusBadge } from "~/components/common/StatusBadge";
import { useAuth } from "~/hooks/useAuth";
import { useToast } from "~/components/common/ToastProvider";

interface Actor {
  id: string;
  name: string;
  approved: boolean;
  bio?: string;
}

export default function ActorPage() {
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { addToast } = useToast();

  // Global search
  const { searchQuery } = useGlobalSearch();

  // Local filters
  const [filters, setFilters] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchActors = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("http://localhost:3000/v2/actor", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setActors(data);
        } else {
          console.error("Failed to fetch actors:", response.statusText);
        }
      } catch (err) {
        console.error("Error fetching actors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActors();
  }, []);

  // Filter and search actors
  const filteredActors = useMemo(() => {
    return actors.filter((actor) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        actor.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Approval filter
      const matchesApproval =
        !filters.approved || actor.approved === filters.approved;

      return matchesSearch && matchesApproval;
    });
  }, [actors, searchQuery, filters]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this actor?")) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`http://localhost:3000/v2/actor/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          // Update local state
          setActors(actors.filter((actor) => actor.id !== id));
          addToast({
            type: "success",
            title: "Success",
            message: "Actor deleted successfully!",
          });
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete actor");
        }
      } catch (error) {
        console.error("Failed to delete actor:", error);
        addToast({
          type: "error",
          title: "Error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to delete actor. Please try again.",
        });
      }
    }
  };

  return (
    <PageTemplate
      title="Actors"
      actionButton={{
        label: "Add Actor",
        onClick: () => navigate("/actors/new"),
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
      {loading ? (
        <div className="p-4 text-center">Loading actors...</div>
      ) : (
        <>
          {/* Filter Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
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
                    Show only verified actors
                  </span>
                </label>
              </div>

              {filters.approved && (
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
                    Name
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
                {filteredActors.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                    >
                      {searchQuery || Object.keys(filters).length > 0
                        ? "No actors match your search criteria."
                        : "No actors available."}
                    </td>
                  </tr>
                ) : (
                  filteredActors.map((actor) => (
                    <tr key={actor.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {actor.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge verified={actor.approved} size="sm" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => navigate(`/actors/view/${actor.id}`)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/actors/edit/${actor.id}`)}
                          className="text-amber-600 hover:text-amber-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(actor.id)}
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
