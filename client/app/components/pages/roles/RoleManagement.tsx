import React, { useState, useEffect } from "react";
import { useAuth } from "~/hooks/useAuth";
import { useNavigation } from "~/components/layout/NavigationProvider";
import { BackToAdminButton } from "~/components/common/BackToAdminButton";

interface Role {
  id: string;
  name: string;
  musicalId: string;
  musicalName?: string;
  verified: boolean;
}

interface Musical {
  id: string;
  name: string;
}

type ViewMode = "list" | "detail" | "form";

interface RoleManagementProps {
  onBackToAdmin?: () => void;
}

export default function RoleManagement({
  onBackToAdmin,
}: RoleManagementProps = {}) {
  // State management
  const [roles, setRoles] = useState<Role[]>([]);
  const [musicals, setMusicals] = useState<Musical[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMusicalId, setSelectedMusicalId] = useState<string>("");

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    musicalId: "",
  });

  const { isAdmin } = useAuth();
  const { setActiveSection } = useNavigation();

  // API calls
  const fetchRoles = async (musicalId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("authToken");
      const url = musicalId
        ? `http://localhost:3000/v2/role?musicalId=${musicalId}`
        : "http://localhost:3000/v2/role";

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError("Failed to load roles. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMusicals = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:3000/v2/musical", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMusicals(data);
      }
    } catch (err) {
      console.error("Error fetching musicals:", err);
    }
  };

  const fetchRoleById = async (id: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:3000/v2/role/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name || "",
          musicalId: data.musicalId || "",
        });
      }
    } catch (err) {
      console.error("Error fetching role:", err);
    }
  };

  const saveRole = async () => {
    if (!formData.name.trim()) {
      setError("Role name is required");
      return;
    }

    if (!formData.musicalId) {
      setError("Musical selection is required");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const url = isEditing
        ? `http://localhost:3000/v2/role/${selectedRoleId}`
        : "http://localhost:3000/v2/role";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchRoles(selectedMusicalId);
        setViewMode("list");
        setSelectedRoleId(null);
        setIsEditing(false);
        resetForm();
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error("Error saving role:", err);
      setError("Failed to save role. Please try again.");
    }
  };

  const deleteRole = async (id: string) => {
    if (confirm("Are you sure you want to delete this role?")) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`http://localhost:3000/v2/role/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          await fetchRoles(selectedMusicalId);
          if (selectedRoleId === id) {
            setViewMode("list");
            setSelectedRoleId(null);
          }
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } catch (err) {
        console.error("Error deleting role:", err);
        setError("Failed to delete role. Please try again.");
      }
    }
  };

  // Initialize data
  useEffect(() => {
    fetchRoles();
    fetchMusicals();
  }, []);

  // Refetch roles when musical filter changes
  useEffect(() => {
    fetchRoles(selectedMusicalId);
  }, [selectedMusicalId]);

  // Event handlers
  const handleViewDetail = (role: Role) => {
    setSelectedRoleId(role.id);
    setViewMode("detail");
  };

  const handleEdit = async (role: Role) => {
    setSelectedRoleId(role.id);
    setIsEditing(true);
    await fetchRoleById(role.id);
    setViewMode("form");
  };

  const handleAdd = () => {
    setSelectedRoleId(null);
    setIsEditing(false);
    resetForm();
    setViewMode("form");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedRoleId(null);
    setIsEditing(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      musicalId: "",
    });
    setError(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveRole();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMusicalFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMusicalId(e.target.value);
  };

  // Filter roles
  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.musicalName &&
        role.musicalName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get selected role
  const selectedRole = selectedRoleId
    ? roles.find((r) => r.id === selectedRoleId)
    : null;

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading roles...</div>
      </div>
    );
  }

  // Error state
  if (error && viewMode === "list") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">{error}</div>
        <button
          onClick={() => {
            setError(null);
            fetchRoles();
          }}
          className="mt-2 text-red-600 hover:text-red-500 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  // Form view
  if (viewMode === "form") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            ← Back to Roles
          </button>
          <h2 className="text-2xl font-semibold">
            {isEditing ? "Edit Role" : "Add New Role"}
          </h2>
        </div>

        <form onSubmit={handleFormSubmit} className="max-w-md space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="text-red-800 text-sm">{error}</div>
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Role Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Jean Valjean, Elphaba, Danny Zuko"
            />
          </div>

          <div>
            <label
              htmlFor="musicalId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Musical
            </label>
            <select
              id="musicalId"
              name="musicalId"
              value={formData.musicalId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a musical...</option>
              {musicals.map((musical) => (
                <option key={musical.id} value={musical.id}>
                  {musical.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isEditing ? "Update Role" : "Create Role"}
            </button>
            <button
              type="button"
              onClick={handleBackToList}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Detail view
  if (viewMode === "detail" && selectedRole) {
    const musical = musicals.find((m) => m.id === selectedRole.musicalId);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            ← Back to Roles
          </button>
          <h2 className="text-2xl font-semibold">Role Details</h2>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">{selectedRole.name}</h3>
          <div className="space-y-2">
            <p>
              <strong>Musical:</strong> {musical?.name || "Unknown"}
            </p>
            <p>
              <strong>Status:</strong>
              <span
                className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  selectedRole.verified
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {selectedRole.verified ? "Verified" : "Pending"}
              </span>
            </p>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={() => handleEdit(selectedRole)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit Role
            </button>
            <button
              onClick={() => deleteRole(selectedRole.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete Role
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BackToAdminButton onBack={onBackToAdmin} />
          <h2 className="text-2xl font-semibold">Roles</h2>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Add Role
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="max-w-xs">
          <select
            value={selectedMusicalId}
            onChange={handleMusicalFilter}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Musicals</option>
            {musicals.map((musical) => (
              <option key={musical.id} value={musical.id}>
                {musical.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Role List */}
      {filteredRoles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm || selectedMusicalId
            ? "No roles found matching your criteria."
            : "No roles found."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Musical
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoles.map((role) => {
                const musical = musicals.find((m) => m.id === role.musicalId);

                return (
                  <tr
                    key={role.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewDetail(role)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {role.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {musical?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          role.verified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {role.verified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(role);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(role);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRole(role.id);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
