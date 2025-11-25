import React, { useState, useEffect } from "react";
import { useAuth } from "~/hooks/useAuth";
import { useNavigation } from "~/components/layout/NavigationProvider";
import { useToast } from "~/components/common/ToastProvider";
import { useValidation, actorValidationSchema } from "~/hooks/useValidation";
import { FormField } from "~/components/common/FormField";
import { StatusBadge } from "~/components/common/StatusBadge";
import { BackToDashboardButton } from "~/components/common/BackToDashboardButton";
import {
  Pagination,
  usePagination,
  type PaginationInfo,
} from "~/components/common/Pagination";
import { SortableHeader, useSort } from "~/components/common/SortableHeader";

interface Actor {
  id: number;
  name: string;
  email: string;
  bio?: string;
  profileImageUrl?: string;
  verified: boolean;
  approved: boolean;
  createdAt: string;
}

type ViewMode = "list" | "detail" | "form";
type FormMode = "create" | "edit";

export const ActorManagement: React.FC = () => {
  // View state management
  const [view, setView] = useState<ViewMode>("list");
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);
  const [formMode, setFormMode] = useState<FormMode>("create");

  // Data state
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{
    approved?: boolean;
    verified?: boolean;
  }>({});

  // Form data
  const [formData, setFormData] = useState<Partial<Actor>>({
    name: "",
    email: "",
    bio: "",
    approved: false,
    verified: false,
  });

  // Hooks
  const { isAdmin } = useAuth();
  const { setActiveSection } = useNavigation();
  const { addToast } = useToast();
  const { errors, validate, validateSingle, clearError } = useValidation(
    actorValidationSchema
  );

  // Pagination
  const { currentPage, itemsPerPage, setCurrentPage, resetToFirstPage } =
    usePagination(10);

  // Fetch actors data
  useEffect(() => {
    fetchActors();
  }, []);

  const fetchActors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("http://localhost:3000/v2/actor", {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setActors(Array.isArray(data) ? data : []);
      } else {
        if (response.status === 401) {
          addToast({
            type: "error",
            title: "Authentication required. Please log in.",
          });
        } else {
          addToast({ type: "error", title: "Failed to load actors" });
        }
      }
    } catch (error) {
      console.error("Error fetching actors:", error);
      addToast({ type: "error", title: "Error loading actors" });
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
  const showList = () => setView("list");
  const showDetail = (actor: Actor) => {
    setSelectedActor(actor);
    setView("detail");
  };
  const showForm = (actor?: Actor, mode: FormMode = "create") => {
    setFormMode(mode);
    if (actor) {
      setSelectedActor(actor);
      setFormData(actor);
    } else {
      setSelectedActor(null);
      setFormData({
        name: "",
        email: "",
        bio: "",
        approved: false,
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
    const type = "type" in e.target ? e.target.type : "";
    const newValue =
      type === "checkbox" && "checked" in e.target
        ? (e.target as HTMLInputElement).checked
        : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    clearError(name);
  };

  const handleBlur = (
    e: React.FocusEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
      | HTMLDivElement
    >
  ) => {
    if ("name" in e.target && "value" in e.target) {
      const { name, value } = e.target;
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
          ? "http://localhost:3000/v2/actor"
          : `http://localhost:3000/v2/actor/${selectedActor?.id}`;

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
            ? "Actor created successfully"
            : "Actor updated successfully";
        addToast({ type: "success", title: message });
        await fetchActors(); // Refresh list
        showList(); // Back to list view
      } else {
        addToast({ type: "error", title: "Failed to save actor" });
      }
    } catch (error) {
      console.error("Error saving actor:", error);
      addToast({ type: "error", title: "Error saving actor" });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete actor
  const handleDelete = async (actor: Actor) => {
    if (!confirm(`Are you sure you want to delete ${actor.name}?`)) return;

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
        `http://localhost:3000/v2/actor/${actor.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        addToast({ type: "success", title: "Actor deleted successfully" });
        await fetchActors();
        if (view === "detail" && selectedActor?.id === actor.id) {
          showList();
        }
      } else {
        addToast({ type: "error", title: "Failed to delete actor" });
      }
    } catch (error) {
      console.error("Error deleting actor:", error);
      addToast({ type: "error", title: "Error deleting actor" });
    }
  };

  // Filter actors based on search and filters
  const filteredActors = actors.filter((actor) => {
    const matchesSearch =
      !searchTerm ||
      actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actor.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesApproved =
      filters.approved === undefined || actor.approved === filters.approved;
    const matchesVerified =
      filters.verified === undefined || actor.verified === filters.verified;

    return matchesSearch && matchesApproved && matchesVerified;
  });

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
  const paginatedActors = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedActors.slice(startIndex, endIndex);
  }, [sortedActors, currentPage, itemsPerPage]);

  // Pagination info
  const paginationInfo: PaginationInfo = React.useMemo(
    () => ({
      currentPage,
      totalPages: Math.ceil(sortedActors.length / itemsPerPage),
      totalItems: sortedActors.length,
      itemsPerPage,
      hasNextPage: currentPage < Math.ceil(sortedActors.length / itemsPerPage),
      hasPreviousPage: currentPage > 1,
    }),
    [currentPage, sortedActors.length, itemsPerPage]
  );

  // Reset pagination when filters change
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
              Actors
            </h1>
          </div>
          <button
            onClick={() => showForm()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Add Actor
          </button>
        </div>

        {loading ? (
          <div className="p-4 text-center">Loading actors...</div>
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search actors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.approved || false}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          approved: e.target.checked || undefined,
                        }))
                      }
                      className="mr-2"
                    />
                    Approved Only
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.verified || false}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          verified: e.target.checked || undefined,
                        }))
                      }
                      className="mr-2"
                    />
                    Verified Only
                  </label>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
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
                      sortKey="email"
                      currentSort={sortConfig}
                      onSort={handleSort}
                    >
                      Email
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
                  {paginatedActors.map((actor) => (
                    <tr
                      key={actor.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {actor.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {actor.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <StatusBadge verified={actor.approved} size="sm" />
                          <StatusBadge verified={actor.verified} size="sm" />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(actor.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => showDetail(actor)}
                          className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
                        >
                          View
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => showForm(actor, "edit")}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(actor)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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

              {paginatedActors.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No actors found.{" "}
                  {isAdmin && "Add your first actor to get started!"}
                </div>
              )}
            </div>

            {/* Pagination */}
            {paginationInfo.totalPages > 1 && (
              <Pagination
                pagination={paginationInfo}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    );
  }

  // DETAIL VIEW
  if (view === "detail" && selectedActor) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={showList}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            ← Back to Actors
          </button>

          {isAdmin && (
            <div className="space-x-3">
              <button
                onClick={() => showForm(selectedActor, "edit")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Edit Actor
              </button>
              <button
                onClick={() => handleDelete(selectedActor)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
              >
                Delete Actor
              </button>
            </div>
          )}
        </div>

        {/* Actor Details */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {selectedActor.name}
              </h1>
              <div className="flex space-x-2">
                <StatusBadge verified={selectedActor.approved} />
                <StatusBadge verified={selectedActor.verified} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Email:</span>{" "}
                    {selectedActor.email}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(selectedActor.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedActor.bio && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Biography
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedActor.bio}
                  </p>
                </div>
              )}
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
            ← Back to Actors
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {formMode === "create"
              ? "Add New Actor"
              : `Edit ${selectedActor?.name}`}
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Name"
              name="name"
              type="text"
              value={formData.name || ""}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.name}
              required
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.email}
              required
            />

            <FormField
              label="Biography"
              name="bio"
              type="textarea"
              value={formData.bio || ""}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.bio}
              rows={4}
            />

            {isAdmin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.approved || false}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        approved: e.target.checked,
                      }))
                    }
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Approved
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.verified || false}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        verified: e.target.checked,
                      }))
                    }
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Verified
                  </span>
                </label>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={showList}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
              >
                {submitting
                  ? "Saving..."
                  : formMode === "create"
                    ? "Create Actor"
                    : "Update Actor"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return null;
};
