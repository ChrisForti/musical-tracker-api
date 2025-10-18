import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageTemplate } from "~/components/common/PageTemplate";
import { useGlobalSearch } from "~/components/layout/ui/GlobalSearchProvider";
import { StatusBadge } from "~/components/common/StatusBadge";
import { useAuth } from "~/hooks/useAuth";
import { useToast } from "~/components/common/ToastProvider";
import {
  Pagination,
  usePagination,
  type PaginationInfo,
} from "~/components/common/Pagination";
import { SortableHeader, useSort } from "~/components/common/SortableHeader";

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

  // Pagination
  const { currentPage, itemsPerPage, setCurrentPage, resetToFirstPage } =
    usePagination(1, 10);

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

  // Sorting
  const {
    sortedData: sortedActors,
    sortConfig,
    handleSort,
  } = useSort(filteredActors, {
    key: "name",
    direction: "asc",
  });

  // Paginated actors
  const paginatedActors = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedActors.slice(startIndex, endIndex);
  }, [sortedActors, currentPage, itemsPerPage]);

  // Pagination info
  const paginationInfo: PaginationInfo = useMemo(() => {
    const totalItems = sortedActors.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };
  }, [sortedActors.length, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    resetToFirstPage();
  }, [searchQuery, filters, resetToFirstPage]);

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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <SortableHeader
                      sortKey="name"
                      currentSort={sortConfig}
                      onSort={handleSort}
                      className="hidden sm:table-cell"
                    >
                      Name
                    </SortableHeader>
                    <SortableHeader
                      sortKey="approved"
                      currentSort={sortConfig}
                      onSort={handleSort}
                      className="hidden md:table-cell"
                    >
                      Status
                    </SortableHeader>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedActors.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                      >
                        {searchQuery || Object.keys(filters).length > 0
                          ? "No actors match your search criteria."
                          : "No actors available."}
                      </td>
                    </tr>
                  ) : (
                    paginatedActors.map((actor) => (
                      <tr
                        key={actor.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {/* Mobile Layout */}
                        <td className="px-3 py-4 sm:hidden">
                          <div className="flex flex-col space-y-2">
                            <div className="flex justify-between items-start">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {actor.name}
                              </div>
                              <StatusBadge
                                verified={actor.approved}
                                size="sm"
                              />
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  navigate(`/actors/view/${actor.id}`)
                                }
                                className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900"
                              >
                                View
                              </button>
                              <button
                                onClick={() =>
                                  navigate(`/actors/edit/${actor.id}`)
                                }
                                className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded hover:bg-amber-200 dark:hover:bg-amber-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(actor.id)}
                                className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Desktop Layout */}
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {actor.name}
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                          <StatusBadge verified={actor.approved} size="sm" />
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                navigate(`/actors/view/${actor.id}`)
                              }
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              View
                            </button>
                            <button
                              onClick={() =>
                                navigate(`/actors/edit/${actor.id}`)
                              }
                              className="text-amber-600 hover:text-amber-900 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(actor.id)}
                              className="text-red-600 hover:text-red-900 font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {sortedActors.length > 0 && (
            <div className="mt-6">
              <Pagination
                pagination={paginationInfo}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </PageTemplate>
  );
}
