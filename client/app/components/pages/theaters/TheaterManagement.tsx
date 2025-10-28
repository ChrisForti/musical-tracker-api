import React, { useState, useEffect } from "react";
import { useAuth } from "~/hooks/useAuth";
import { useNavigation } from "~/components/layout/NavigationProvider";
import { useToast } from "~/components/common/ToastProvider";
import { useValidation } from "~/hooks/useValidation";
import { FormField } from "~/components/common/FormField";
import { StatusBadge } from "~/components/common/StatusBadge";
import {
  Pagination,
  usePagination,
  type PaginationInfo,
} from "~/components/common/Pagination";
import { SortableHeader, useSort } from "~/components/common/SortableHeader";
import { BackToDashboardButton } from "~/components/common/BackToDashboardButton";

interface Theater {
  id: string;
  name: string;
  city: string;
  verified: boolean;
  createdAt: string;
}

type ViewMode = "list" | "detail" | "form";
type FormMode = "create" | "edit";

const theaterValidationSchema = {
  name: { required: true, minLength: 1 },
  city: { required: true, minLength: 1 },
};

export const TheaterManagement: React.FC = () => {
  // View state management
  const [view, setView] = useState<ViewMode>("list");
  const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null);
  const [formMode, setFormMode] = useState<FormMode>("create");

  // Data state
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{
    verified?: boolean;
  }>({});

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    verified: false,
  });

  // Hooks
  const { isAdmin } = useAuth();
  const { setActiveSection } = useNavigation();
  const { addToast } = useToast();
  const { errors, validate, validateSingle, clearError } = useValidation(
    theaterValidationSchema
  );

  // Pagination
  const { currentPage, itemsPerPage, setCurrentPage, resetToFirstPage } =
    usePagination(10);

  // Sorting
  const { sortConfig, handleSort, sortedData } = useSort(theaters);

  // Fetch theaters data
  useEffect(() => {
    fetchTheaters();
  }, []);

  const fetchTheaters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("http://localhost:3000/v2/theater", {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setTheaters(Array.isArray(data) ? data : []);
      } else {
        if (response.status === 401) {
          addToast({
            type: "error",
            title: "Authentication required. Please log in.",
          });
        } else {
          addToast({ type: "error", title: "Failed to load theaters" });
        }
      }
    } catch (error) {
      console.error("Error fetching theaters:", error);
      addToast({ type: "error", title: "Error loading theaters" });
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
  const showList = () => setView("list");
  const showDetail = (theater: Theater) => {
    setSelectedTheater(theater);
    setView("detail");
  };
  const showForm = (theater?: Theater, mode: FormMode = "create") => {
    setFormMode(mode);
    if (theater) {
      setSelectedTheater(theater);
      setFormData({
        name: theater.name,
        city: theater.city,
        verified: theater.verified,
      });
    } else {
      setSelectedTheater(null);
      setFormData({
        name: "",
        city: "",
        verified: false,
      });
    }
    setView("form");
  };

  // Form handlers
  const handleInputChange = (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "verified" ? value === "true" : value,
    }));

    if (errors[name as keyof typeof formData]) {
      validateSingle(name as string, value as string);
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate(formData)) {
      addToast({
        type: "error",
        title: "Please fix the errors before submitting",
      });
      return;
    }

    try {
      setSubmitting(true);

      const url =
        formMode === "create"
          ? "http://localhost:3000/v2/theater"
          : `http://localhost:3000/v2/theater/${selectedTheater?.id}`;

      const method = formMode === "create" ? "POST" : "PUT";

      const token = localStorage.getItem("authToken");
      if (!token) {
        addToast({
          type: "error",
          title: "Authentication required. Please log in.",
        });
        return;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const message =
          formMode === "create"
            ? "Theater created successfully"
            : "Theater updated successfully";
        addToast({ type: "success", title: message });
        await fetchTheaters(); // Refresh list
        showList(); // Back to list view
      } else {
        addToast({ type: "error", title: "Failed to save theater" });
      }
    } catch (error) {
      console.error("Error saving theater:", error);
      addToast({ type: "error", title: "Error saving theater" });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete theater
  const handleDelete = async (theater: Theater) => {
    if (!confirm(`Are you sure you want to delete ${theater.name}?`)) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        addToast({
          type: "error",
          title: "Authentication required. Please log in.",
        });
        return;
      }

      const response = await fetch(
        `http://localhost:3000/v2/theater/${theater.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        addToast({ type: "success", title: "Theater deleted successfully" });
        await fetchTheaters();
        if (view === "detail" && selectedTheater?.id === theater.id) {
          showList();
        }
      } else {
        addToast({ type: "error", title: "Failed to delete theater" });
      }
    } catch (error) {
      console.error("Error deleting theater:", error);
      addToast({ type: "error", title: "Error deleting theater" });
    }
  };

  // Filter theaters based on search and filters
  const filteredTheaters = theaters.filter((theater) => {
    const matchesSearch =
      !searchTerm ||
      theater.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      theater.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVerified =
      filters.verified === undefined || theater.verified === filters.verified;

    return matchesSearch && matchesVerified;
  });

  // Apply sorting to filtered data
  const sortedTheaters = sortedData || filteredTheaters;

  // Calculate pagination
  const paginationInfo: PaginationInfo = {
    currentPage,
    totalPages: Math.ceil(filteredTheaters.length / itemsPerPage),
    totalItems: filteredTheaters.length,
    itemsPerPage,
    hasNextPage:
      currentPage < Math.ceil(filteredTheaters.length / itemsPerPage),
    hasPreviousPage: currentPage > 1,
  };

  // Paginate sorted theaters
  const paginatedTheaters = sortedTheaters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when search or filters change
  useEffect(() => {
    resetToFirstPage();
  }, [searchTerm, filters, resetToFirstPage]);

  // LIST VIEW
  if (view === "list") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <BackToDashboardButton />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Theaters
            </h1>
          </div>
          <button
            onClick={() => showForm()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Add Theater
          </button>
        </div>

        {loading ? (
          <div className="p-4 text-center">Loading theaters...</div>
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow space-y-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Search theaters..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <select
                  value={
                    filters.verified === undefined
                      ? ""
                      : filters.verified.toString()
                  }
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      verified:
                        e.target.value === ""
                          ? undefined
                          : e.target.value === "true",
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Status</option>
                  <option value="true">Verified</option>
                  <option value="false">Unverified</option>
                </select>
              </div>
            </div>

            {/* Results */}
            {paginatedTheaters.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No theaters found
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <SortableHeader
                        sortKey="name"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      >
                        Name
                      </SortableHeader>
                      <SortableHeader
                        sortKey="city"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      >
                        City
                      </SortableHeader>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <SortableHeader
                        sortKey="createdAt"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      >
                        Created
                      </SortableHeader>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedTheaters.map((theater) => (
                      <tr
                        key={theater.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => showDetail(theater)}
                            className="text-teal-600 hover:text-teal-500 font-medium"
                          >
                            {theater.name}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {theater.city}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge verified={theater.verified} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(theater.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 space-x-2">
                          <button
                            onClick={() => showDetail(theater)}
                            className="text-teal-600 hover:text-teal-500"
                          >
                            View
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => showForm(theater, "edit")}
                                className="text-blue-600 hover:text-blue-500"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(theater)}
                                className="text-red-600 hover:text-red-500"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <Pagination
                  pagination={paginationInfo}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // DETAIL VIEW
  if (view === "detail" && selectedTheater) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={showList}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            ← Back to Theaters
          </button>
          <div className="flex space-x-3">
            {isAdmin && (
              <>
                <button
                  onClick={() => showForm(selectedTheater, "edit")}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit Theater
                </button>
                <button
                  onClick={() => handleDelete(selectedTheater)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Theater
                </button>
              </>
            )}
          </div>
        </div>

        {/* Theater Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedTheater.name}
              </h2>
              <StatusBadge verified={selectedTheater.verified} />
            </div>
          </div>

          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City
              </label>
              <p className="text-gray-900 dark:text-gray-100">
                {selectedTheater.city}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Created: {new Date(selectedTheater.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FORM VIEW
  if (view === "form") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={showList}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            ← Back to Theaters
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {formMode === "create" ? "Add New Theater" : "Edit Theater"}
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Theater Information
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-6 space-y-6">
              <FormField
                label="Theater Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                required
              />

              <FormField
                label="City"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleInputChange}
                error={errors.city}
                required
              />

              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    name="verified"
                    value={formData.verified?.toString() || "false"}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="false">Unverified</option>
                    <option value="true">Verified</option>
                  </select>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg flex justify-end space-x-3">
              <button
                type="button"
                onClick={showList}
                disabled={submitting}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
              >
                {submitting
                  ? "Saving..."
                  : formMode === "create"
                    ? "Create Theater"
                    : "Update Theater"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return null;
};
