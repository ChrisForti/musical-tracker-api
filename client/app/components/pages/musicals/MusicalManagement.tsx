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
import { ImageUpload } from "~/components/common/ImageUpload";
import { BackToDashboardButton } from "~/components/common/BackToDashboardButton";

interface Musical {
  id: string;
  name: string;
  composer: string;
  lyricist: string;
  approved: boolean;
  posterId?: string;
  posterUrl?: string;
  createdAt: string;
}

type ViewMode = "list" | "detail" | "form";
type FormMode = "create" | "edit";

interface FormData {
  name: string;
  composer: string;
  lyricist: string;
  approved: boolean;
  posterId: string;
  posterUrl: string;
}

const musicalValidationSchema = {
  name: { required: true, minLength: 1 },
  composer: { required: true, minLength: 1 },
  lyricist: { required: true, minLength: 1 },
};

export const MusicalManagement: React.FC = () => {
  // View state management
  const [view, setView] = useState<ViewMode>("list");
  const [selectedMusical, setSelectedMusical] = useState<Musical | null>(null);
  const [formMode, setFormMode] = useState<FormMode>("create");

  // Data state
  const [musicals, setMusicals] = useState<Musical[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{
    approved?: boolean;
  }>({});

  // Form data
  const [formData, setFormData] = useState<FormData>({
    name: "",
    composer: "",
    lyricist: "",
    approved: false,
    posterId: "",
    posterUrl: "",
  });

  // Hooks
  const { isAdmin } = useAuth();
  const { setActiveSection } = useNavigation();
  const { addToast } = useToast();
  const { errors, validate, validateSingle, clearError } = useValidation(
    musicalValidationSchema
  );

  // Pagination
  const { currentPage, itemsPerPage, setCurrentPage, resetToFirstPage } =
    usePagination(10);

  // Sorting
  const { sortConfig, handleSort, sortedData } = useSort(musicals);

  // Fetch musicals data
  useEffect(() => {
    fetchMusicals();
  }, []);

  const fetchMusicals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("http://localhost:3000/v2/musical", {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setMusicals(Array.isArray(data) ? data : []);
      } else {
        if (response.status === 401) {
          addToast({
            type: "error",
            title: "Authentication required. Please log in.",
          });
        } else {
          addToast({ type: "error", title: "Failed to load musicals" });
        }
      }
    } catch (error) {
      console.error("Error fetching musicals:", error);
      addToast({ type: "error", title: "Error loading musicals" });
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
  const showList = () => setView("list");
  const showDetail = (musical: Musical) => {
    setSelectedMusical(musical);
    setView("detail");
  };
  const showForm = (musical?: Musical, mode: FormMode = "create") => {
    setFormMode(mode);
    if (musical) {
      setSelectedMusical(musical);
      setFormData({
        name: musical.name,
        composer: musical.composer,
        lyricist: musical.lyricist,
        approved: musical.approved,
        posterId: musical.posterId || "",
        posterUrl: musical.posterUrl || "",
      });
    } else {
      setSelectedMusical(null);
      setFormData({
        name: "",
        composer: "",
        lyricist: "",
        approved: false,
        posterId: "",
        posterUrl: "",
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
      [name]: name === "approved" ? value === "true" : value,
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
          ? "http://localhost:3000/v2/musical"
          : `http://localhost:3000/v2/musical/${selectedMusical?.id}`;

      const method = formMode === "create" ? "POST" : "PUT";

      const token = localStorage.getItem("authToken");
      if (!token) {
        addToast({
          type: "error",
          title: "Authentication required. Please log in.",
        });
        return;
      }

      const requestData = {
        name: formData.name.trim(),
        composer: formData.composer,
        lyricist: formData.lyricist,
        posterId: formData.posterId || undefined,
      };

      console.log("Sending musical data:", requestData);
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Server error:", data);
        const errorMessage = data.error || "Failed to save musical";
        addToast({ type: "error", title: errorMessage });
        return;
      }

      const message =
        formMode === "create"
          ? "Musical created successfully"
          : "Musical updated successfully";
      addToast({ type: "success", title: message });
      await fetchMusicals();
      showList();
    } catch (error) {
      console.error("Error saving musical:", error);
      addToast({ type: "error", title: "Error saving musical" });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete musical
  const handleDelete = async (musical: Musical) => {
    if (!confirm(`Are you sure you want to delete ${musical.name}?`)) return;

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
        `http://localhost:3000/v2/musical/${musical.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        addToast({ type: "success", title: "Musical deleted successfully" });
        await fetchMusicals();
        if (view === "detail" && selectedMusical?.id === musical.id) {
          showList();
        }
      } else {
        addToast({ type: "error", title: "Failed to delete musical" });
      }
    } catch (error) {
      console.error("Error deleting musical:", error);
      addToast({ type: "error", title: "Error deleting musical" });
    }
  };

  // Filter musicals based on search and filters
  const filteredMusicals = musicals.filter((musical) => {
    const matchesSearch =
      !searchTerm ||
      musical.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      musical.composer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      musical.lyricist.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesApproved =
      filters.approved === undefined || musical.approved === filters.approved;

    return matchesSearch && matchesApproved;
  });

  // Apply sorting to filtered data
  const sortedMusicals = sortedData || filteredMusicals;

  // Calculate pagination
  const paginationInfo: PaginationInfo = {
    currentPage,
    totalPages: Math.ceil(filteredMusicals.length / itemsPerPage),
    totalItems: filteredMusicals.length,
    itemsPerPage,
    hasNextPage:
      currentPage < Math.ceil(filteredMusicals.length / itemsPerPage),
    hasPreviousPage: currentPage > 1,
  };

  // Paginate sorted musicals
  const paginatedMusicals = sortedMusicals.slice(
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
              Musicals
            </h1>
          </div>
          <button
            onClick={() => showForm()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Add Musical
          </button>
        </div>

        {loading ? (
          <div className="p-4 text-center">Loading musicals...</div>
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow space-y-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Search musicals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <select
                  value={
                    filters.approved === undefined
                      ? ""
                      : filters.approved.toString()
                  }
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      approved:
                        e.target.value === ""
                          ? undefined
                          : e.target.value === "true",
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Status</option>
                  <option value="true">Approved</option>
                  <option value="false">Pending</option>
                </select>
              </div>
            </div>

            {/* Results */}
            {paginatedMusicals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No musicals found
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <SortableHeader
                        sortKey="title"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      >
                        Title
                      </SortableHeader>
                      <SortableHeader
                        sortKey="composer"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      >
                        Composer
                      </SortableHeader>
                      <SortableHeader
                        sortKey="lyricist"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      >
                        Lyricist
                      </SortableHeader>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedMusicals.map((musical) => (
                      <tr
                        key={musical.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => showDetail(musical)}
                            className="text-teal-600 hover:text-teal-500 font-medium"
                          >
                            {musical.name}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {musical.composer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {musical.lyricist}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge verified={musical.approved} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 space-x-2">
                          <button
                            onClick={() => showDetail(musical)}
                            className="text-teal-600 hover:text-teal-500"
                          >
                            View
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => showForm(musical, "edit")}
                                className="text-blue-600 hover:text-blue-500"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(musical)}
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
  if (view === "detail" && selectedMusical) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={showList}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            ← Back to Musicals
          </button>
          <div className="flex space-x-3">
            {isAdmin && (
              <>
                <button
                  onClick={() => showForm(selectedMusical, "edit")}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit Musical
                </button>
                <button
                  onClick={() => handleDelete(selectedMusical)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Musical
                </button>
              </>
            )}
          </div>
        </div>

        {/* Musical Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedMusical.name}
              </h2>
              <StatusBadge verified={selectedMusical.approved} />
            </div>
          </div>

          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Composer
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {selectedMusical.composer}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lyricist
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {selectedMusical.lyricist}
                </p>
              </div>
            </div>

            {selectedMusical.posterUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Poster
                </label>
                <img
                  src={selectedMusical.posterUrl}
                  alt={`${selectedMusical.name} poster`}
                  className="max-w-xs rounded-lg shadow-md"
                />
              </div>
            )}
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
            ← Back to Musicals
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {formMode === "create" ? "Add New Musical" : "Edit Musical"}
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Musical Information
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-6 space-y-6">
              <FormField
                label="Title"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Composer"
                  name="composer"
                  type="text"
                  value={formData.composer}
                  onChange={handleInputChange}
                  error={errors.composer}
                  required
                />

                <FormField
                  label="Lyricist"
                  name="lyricist"
                  type="text"
                  value={formData.lyricist}
                  onChange={handleInputChange}
                  error={errors.lyricist}
                  required
                />
              </div>
            </div>

            {/* Poster Image Upload Section */}
            <div className="px-6 pb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Poster Image
                </label>
                <ImageUpload
                  imageType="poster"
                  currentImageUrl={formData.posterUrl}
                  onUploadSuccess={(imageData) => {
                    setFormData((prev) => ({
                      ...prev,
                      posterId: imageData.imageId,
                      posterUrl: imageData.url,
                    }));
                  }}
                  onUploadError={(error) => {
                    addToast({
                      type: "error",
                      title: `Image upload failed: ${error}`,
                    });
                  }}
                />
              </div>
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
                    ? "Create Musical"
                    : "Update Musical"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return null;
};
