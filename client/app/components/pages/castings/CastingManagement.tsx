import React, { useState, useEffect } from "react";
import { useNavigation } from "~/components/layout/NavigationProvider";
import { BackToAdminButton } from "~/components/common/BackToAdminButton";

interface Actor {
  id: string;
  firstName: string;
  lastName: string;
}

interface Role {
  id: string;
  name: string;
  musicalId: string;
}

interface Performance {
  id: string;
  musicalId: string;
  date: string;
  time: string;
  theaterId: string;
}

interface Musical {
  id: string;
  name: string;
}

interface Theater {
  id: string;
  name: string;
  city: string;
}

interface Casting {
  id: string;
  roleId: string;
  actorId: string;
  performanceId: string;
}

type ViewMode = "list" | "detail" | "form";

interface CastingManagementProps {
  onBackToAdmin?: () => void;
}

export function CastingManagement({
  onBackToAdmin,
}: CastingManagementProps = {}) {
  const { setActiveSection } = useNavigation();

  // State management
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedCastingId, setSelectedCastingId] = useState<string>("");
  const [castings, setCastings] = useState<Casting[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [musicals, setMusicals] = useState<Musical[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedMusicalId, setSelectedMusicalId] = useState<string>("");
  const [selectedPerformanceId, setSelectedPerformanceId] =
    useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    actorId: "",
    roleId: "",
    performanceId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const [
        castingsRes,
        actorsRes,
        rolesRes,
        performancesRes,
        musicalsRes,
        theatersRes,
      ] = await Promise.all([
        fetch("http://localhost:3000/v2/casting", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("http://localhost:3000/v2/actor", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("http://localhost:3000/v2/role", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("http://localhost:3000/v2/performance", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("http://localhost:3000/v2/musical", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("http://localhost:3000/v2/theater", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      if (castingsRes.ok) setCastings(await castingsRes.json());
      if (actorsRes.ok) setActors(await actorsRes.json());
      if (rolesRes.ok) setRoles(await rolesRes.json());
      if (performancesRes.ok) setPerformances(await performancesRes.json());
      if (musicalsRes.ok) setMusicals(await musicalsRes.json());
      if (theatersRes.ok) setTheaters(await theatersRes.json());

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getActorName = (actorId: string) => {
    const actor = actors.find((a) => a.id === actorId);
    return actor ? `${actor.firstName} ${actor.lastName}` : "Unknown Actor";
  };

  const getRoleName = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    return role?.name || "Unknown Role";
  };

  const getPerformanceDetails = (performanceId: string) => {
    const performance = performances.find((p) => p.id === performanceId);
    if (!performance) return "Unknown Performance";

    const musical = musicals.find((m) => m.id === performance.musicalId);
    const theater = theaters.find((t) => t.id === performance.theaterId);

    return `${musical?.name || "Unknown Musical"} - ${performance.date} at ${theater?.name || "Unknown Theater"}`;
  };

  const getMusicalFromRole = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    return role ? musicals.find((m) => m.id === role.musicalId) : null;
  };

  // Filter castings
  const filteredCastings = castings.filter((casting) => {
    // Musical filter
    if (selectedMusicalId) {
      const role = roles.find((r) => r.id === casting.roleId);
      if (!role || role.musicalId !== selectedMusicalId) return false;
    }

    // Performance filter
    if (
      selectedPerformanceId &&
      casting.performanceId !== selectedPerformanceId
    ) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const actorName = getActorName(casting.actorId).toLowerCase();
      const roleName = getRoleName(casting.roleId).toLowerCase();
      const performanceDetails = getPerformanceDetails(
        casting.performanceId
      ).toLowerCase();

      return (
        actorName.includes(searchTerm.toLowerCase()) ||
        roleName.includes(searchTerm.toLowerCase()) ||
        performanceDetails.includes(searchTerm.toLowerCase())
      );
    }

    return true;
  });

  // Filter performances by selected musical
  const filteredPerformances = selectedMusicalId
    ? performances.filter((p) => p.musicalId === selectedMusicalId)
    : performances;

  // Filter roles by selected musical
  const filteredRoles = selectedMusicalId
    ? roles.filter((r) => r.musicalId === selectedMusicalId)
    : roles;

  // CRUD operations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      const isEditing = selectedCastingId !== "";

      const response = await fetch(
        `http://localhost:3000/v2/casting${isEditing ? `/${selectedCastingId}` : ""}`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? "update" : "create"} casting`);
      }

      await fetchAllData();
      setViewMode("list");
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this casting?")) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:3000/v2/casting/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete casting");
      }

      await fetchAllData();
      if (selectedCastingId === id) {
        setViewMode("list");
        setSelectedCastingId("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete casting");
    }
  };

  const resetForm = () => {
    setFormData({
      actorId: "",
      roleId: "",
      performanceId: "",
    });
    setSelectedCastingId("");
  };

  const handleEdit = (casting: Casting) => {
    setSelectedCastingId(casting.id);
    setFormData({
      actorId: casting.actorId,
      roleId: casting.roleId,
      performanceId: casting.performanceId,
    });

    // Set the musical filter based on the role's musical
    const role = roles.find((r) => r.id === casting.roleId);
    if (role) {
      setSelectedMusicalId(role.musicalId);
    }

    setViewMode("form");
  };

  const handleView = (casting: Casting) => {
    setSelectedCastingId(casting.id);
    setViewMode("detail");
  };

  const handleCreate = () => {
    resetForm();
    setViewMode("form");
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading castings...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <BackToAdminButton onBack={onBackToAdmin} />
      </div>
    );
  }

  // Detail view
  if (viewMode === "detail") {
    const casting = castings.find((c) => c.id === selectedCastingId);
    if (!casting) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-red-600">Casting not found</div>
          <button
            onClick={() => setViewMode("list")}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            ← Back to Castings
          </button>
        </div>
      );
    }

    const role = roles.find((r) => r.id === casting.roleId);
    const musical = role ? musicals.find((m) => m.id === role.musicalId) : null;
    const performance = performances.find(
      (p) => p.id === casting.performanceId
    );
    const theater = performance
      ? theaters.find((t) => t.id === performance.theaterId)
      : null;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Casting Details</h1>
          <BackToAdminButton onBack={onBackToAdmin} />
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {getActorName(casting.actorId)} as {getRoleName(casting.roleId)}
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Actor</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {getActorName(casting.actorId)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {getRoleName(casting.roleId)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Musical</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {musical?.name || "Unknown Musical"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Performance Date
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {performance?.date || "Unknown Date"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Performance Time
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {performance?.time || "Unknown Time"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Theater</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {theater
                    ? `${theater.name}, ${theater.city}`
                    : "Unknown Theater"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setViewMode("list")}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            ← Back to List
          </button>
          <div className="flex space-x-2">
            <button
              onClick={() => handleEdit(casting)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(casting.id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form view
  if (viewMode === "form") {
    const isEditing = selectedCastingId !== "";

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? "Edit Casting" : "Create New Casting"}
          </h1>
          <BackToAdminButton onBack={onBackToAdmin} />
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-6 rounded-lg shadow"
        >
          {/* Musical Filter */}
          <div>
            <label
              htmlFor="musicalFilter"
              className="block text-sm font-medium text-gray-700"
            >
              Musical (Filter)
            </label>
            <select
              id="musicalFilter"
              value={selectedMusicalId}
              onChange={(e) => {
                setSelectedMusicalId(e.target.value);
                // Reset dependent fields when musical changes
                setFormData((prev) => ({
                  ...prev,
                  roleId: "",
                  performanceId: "",
                }));
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Musicals</option>
              {musicals.map((musical) => (
                <option key={musical.id} value={musical.id}>
                  {musical.name}
                </option>
              ))}
            </select>
          </div>

          {/* Actor Selection */}
          <div>
            <label
              htmlFor="actorId"
              className="block text-sm font-medium text-gray-700"
            >
              Actor *
            </label>
            <select
              id="actorId"
              value={formData.actorId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, actorId: e.target.value }))
              }
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select an actor...</option>
              {actors.map((actor) => (
                <option key={actor.id} value={actor.id}>
                  {actor.firstName} {actor.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Role Selection */}
          <div>
            <label
              htmlFor="roleId"
              className="block text-sm font-medium text-gray-700"
            >
              Role *
            </label>
            <select
              id="roleId"
              value={formData.roleId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, roleId: e.target.value }))
              }
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a role...</option>
              {filteredRoles.map((role) => {
                const musical = musicals.find((m) => m.id === role.musicalId);
                return (
                  <option key={role.id} value={role.id}>
                    {role.name}{" "}
                    {musical && !selectedMusicalId ? `(${musical.name})` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Performance Selection */}
          <div>
            <label
              htmlFor="performanceId"
              className="block text-sm font-medium text-gray-700"
            >
              Performance *
            </label>
            <select
              id="performanceId"
              value={formData.performanceId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  performanceId: e.target.value,
                }))
              }
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a performance...</option>
              {filteredPerformances.map((performance) => {
                const musical = musicals.find(
                  (m) => m.id === performance.musicalId
                );
                const theater = theaters.find(
                  (t) => t.id === performance.theaterId
                );
                return (
                  <option key={performance.id} value={performance.id}>
                    {musical?.name} - {performance.date} {performance.time} at{" "}
                    {theater?.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Update Casting"
                  : "Create Casting"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // List view
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Casting Management</h1>
        <BackToAdminButton onBack={onBackToAdmin} />
      </div>

      {/* Filters and Actions */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Musical Filter */}
          <div>
            <label
              htmlFor="musicalFilter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filter by Musical
            </label>
            <select
              id="musicalFilter"
              value={selectedMusicalId}
              onChange={(e) => setSelectedMusicalId(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Musicals</option>
              {musicals.map((musical) => (
                <option key={musical.id} value={musical.id}>
                  {musical.name}
                </option>
              ))}
            </select>
          </div>

          {/* Performance Filter */}
          <div>
            <label
              htmlFor="performanceFilter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filter by Performance
            </label>
            <select
              id="performanceFilter"
              value={selectedPerformanceId}
              onChange={(e) => setSelectedPerformanceId(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Performances</option>
              {filteredPerformances.map((performance) => {
                const musical = musicals.find(
                  (m) => m.id === performance.musicalId
                );
                const theater = theaters.find(
                  (t) => t.id === performance.theaterId
                );
                return (
                  <option key={performance.id} value={performance.id}>
                    {musical?.name} - {performance.date} at {theater?.name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Search */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search actors, roles, or performances..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-end">
            <button
              onClick={handleCreate}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Casting
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600">
          {filteredCastings.length} casting
          {filteredCastings.length !== 1 ? "s" : ""} found
        </div>
      </div>

      {/* Castings Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredCastings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No castings found.{" "}
            {castings.length === 0
              ? "Create your first casting!"
              : "Try adjusting your filters."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Musical
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCastings.map((casting) => {
                  const role = roles.find((r) => r.id === casting.roleId);
                  const musical = role
                    ? musicals.find((m) => m.id === role.musicalId)
                    : null;
                  const performance = performances.find(
                    (p) => p.id === casting.performanceId
                  );
                  const theater = performance
                    ? theaters.find((t) => t.id === performance.theaterId)
                    : null;

                  return (
                    <tr key={casting.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getActorName(casting.actorId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getRoleName(casting.roleId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {musical?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {performance
                          ? `${performance.date} at ${theater?.name || "Unknown Theater"}`
                          : "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(casting)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(casting)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(casting.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
