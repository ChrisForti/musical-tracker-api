import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageTemplate } from "../../common/PageTemplate";

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
}

interface Musical {
  id: string;
  name: string;
}

interface Casting {
  id: string;
  roleId: string;
  actorId: string;
  performanceId: string;
}

export function CastingForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    actorId: "",
    roleId: "",
    performanceId: "",
  });

  const [actors, setActors] = useState<Actor[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [musicals, setMusicals] = useState<Musical[]>([]);
  const [selectedMusicalId, setSelectedMusicalId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const [actorsRes, rolesRes, performancesRes, musicalsRes] =
        await Promise.all([
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
        ]);

      if (actorsRes.ok) setActors(await actorsRes.json());
      if (rolesRes.ok) setRoles(await rolesRes.json());
      if (performancesRes.ok) setPerformances(await performancesRes.json());
      if (musicalsRes.ok) setMusicals(await musicalsRes.json());
    } catch (err) {
      setError("Failed to load form data");
      console.error("Error fetching data:", err);
    }
  };

  const fetchCasting = async (castingId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:3000/v2/casting/${castingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch casting");
      }

      const casting: Casting = await response.json();
      setFormData({
        actorId: casting.actorId,
        roleId: casting.roleId,
        performanceId: casting.performanceId,
      });

      // Set the musical filter based on the performance
      const performance = performances.find(
        (p) => p.id === casting.performanceId
      );
      if (performance) {
        setSelectedMusicalId(performance.musicalId);
      }
    } catch (err) {
      setError("Failed to load casting");
      console.error("Error fetching casting:", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If performance changes, update the musical filter
    if (name === "performanceId" && value) {
      const performance = performances.find((p) => p.id === value);
      if (performance) {
        setSelectedMusicalId(performance.musicalId);
        // Clear role selection if it doesn't match the new musical
        const selectedRole = roles.find((r) => r.id === formData.roleId);
        if (selectedRole && selectedRole.musicalId !== performance.musicalId) {
          setFormData((prev) => ({ ...prev, roleId: "" }));
        }
      }
    }
  };

  const handleMusicalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const musicalId = e.target.value;
    setSelectedMusicalId(musicalId);

    // Clear performance and role selections when musical changes
    setFormData((prev) => ({
      ...prev,
      performanceId: "",
      roleId: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.actorId) {
      setError("Actor selection is required");
      return;
    }

    if (!formData.roleId) {
      setError("Role selection is required");
      return;
    }

    if (!formData.performanceId) {
      setError("Performance selection is required");
      return;
    }

    // Validate that the role belongs to the same musical as the performance
    const selectedRole = roles.find((r) => r.id === formData.roleId);
    const selectedPerformance = performances.find(
      (p) => p.id === formData.performanceId
    );

    if (
      selectedRole &&
      selectedPerformance &&
      selectedRole.musicalId !== selectedPerformance.musicalId
    ) {
      setError(
        "The selected role must belong to the same musical as the performance"
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      const url = isEditing
        ? `http://localhost:3000/v2/casting/${id}`
        : "http://localhost:3000/v2/casting";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actorId: formData.actorId,
          roleId: formData.roleId,
          performanceId: formData.performanceId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to ${isEditing ? "update" : "create"} casting`
        );
      }

      navigate("/castings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/castings");
  };

  // Filter performances and roles based on selected musical
  const filteredPerformances = selectedMusicalId
    ? performances.filter((p) => p.musicalId === selectedMusicalId)
    : performances;

  const filteredRoles = selectedMusicalId
    ? roles.filter((r) => r.musicalId === selectedMusicalId)
    : roles;

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (isEditing && id && performances.length > 0) {
      fetchCasting(id);
    }
  }, [isEditing, id, performances]);

  return (
    <PageTemplate title={isEditing ? "Edit Casting" : "New Casting"}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEditing
                ? "Edit Cast Assignment"
                : "Create New Cast Assignment"}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {error && (
              <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="text-sm text-red-700 dark:text-red-400">
                  {error}
                </div>
              </div>
            )}

            {/* Musical Filter (for easier selection) */}
            <div>
              <label
                htmlFor="musicalFilter"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Filter by Musical (optional)
              </label>
              <select
                id="musicalFilter"
                value={selectedMusicalId}
                onChange={handleMusicalChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Musicals</option>
                {musicals.map((musical) => (
                  <option key={musical.id} value={musical.id}>
                    {musical.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Select a musical to filter performances and roles
              </p>
            </div>

            {/* Actor Selection */}
            <div>
              <label
                htmlFor="actorId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Actor *
              </label>
              <select
                id="actorId"
                name="actorId"
                value={formData.actorId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select an actor...</option>
                {actors.map((actor) => (
                  <option key={actor.id} value={actor.id}>
                    {actor.firstName} {actor.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Performance Selection */}
            <div>
              <label
                htmlFor="performanceId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Performance *
              </label>
              <select
                id="performanceId"
                name="performanceId"
                value={formData.performanceId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select a performance...</option>
                {filteredPerformances.map((performance) => {
                  const musical = musicals.find(
                    (m) => m.id === performance.musicalId
                  );
                  const date = new Date(performance.date).toLocaleDateString();
                  const time = performance.time;
                  return (
                    <option key={performance.id} value={performance.id}>
                      {musical?.name} - {date} at {time}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Role Selection */}
            <div>
              <label
                htmlFor="roleId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Role *
              </label>
              <select
                id="roleId"
                name="roleId"
                value={formData.roleId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select a role...</option>
                {filteredRoles.map((role) => {
                  const musical = musicals.find((m) => m.id === role.musicalId);
                  return (
                    <option key={role.id} value={role.id}>
                      {role.name} ({musical?.name})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : isEditing ? (
                  "Update Casting"
                ) : (
                  "Create Casting"
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2">
            <strong>Casting Guidelines:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Select a musical first to filter relevant performances and roles
            </li>
            <li>The role must belong to the same musical as the performance</li>
            <li>Each actor can only be cast in one role per performance</li>
            <li>Verify the performance date and time before assigning</li>
          </ul>
        </div>
      </div>
    </PageTemplate>
  );
}
