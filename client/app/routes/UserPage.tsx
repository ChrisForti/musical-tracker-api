import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageTemplate } from "../components/common/PageTemplate";
import { ExportButton } from "../components/common/ExportButton";
import { useToast } from "../components/common/ToastProvider";
import { BackToDashboardButton } from "../components/common/BackToDashboardButton";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "user";
  emailVerified: boolean;
}

export function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "user">("all");
  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch("http://localhost:3000/v2/user/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to load users",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (
    userId: string,
    newRole: "admin" | "user"
  ) => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        `http://localhost:3000/v2/user/${userId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update user role: ${response.statusText}`);
      }

      // Update the local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      addToast({
        type: "success",
        title: "Success",
        message: `User role updated to ${newRole}`,
      });
    } catch (err) {
      console.error("Error updating user role:", err);
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to update user role",
      });
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <PageTemplate title="User Management">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading users...
          </p>
        </div>
      </PageTemplate>
    );
  }

  if (error) {
    return (
      <PageTemplate title="User Management">
        <div className="text-center py-8">
          <div className="text-red-600 dark:text-red-400">
            <svg
              className="w-12 h-12 mx-auto mb-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-lg font-semibold">Error Loading Users</p>
            <p className="mt-2">{error}</p>
            <button
              onClick={fetchUsers}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title="User Management">
      <div className="space-y-6">
        {/* Back to Dashboard Button */}
        <BackToDashboardButton />

        {/* Search, Filter, and Export Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) =>
                setFilterRole(e.target.value as "all" | "admin" | "user")
              }
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="user">Users</option>
            </select>
            <ExportButton
              data={filteredUsers}
              type="users"
              label="Export Users"
              disabled={loading}
            />
          </div>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Total Users
            </h3>
            <p className="text-3xl font-bold text-teal-600">{users.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Administrators
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {users.filter((u) => u.role === "admin").length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Verified Users
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {users.filter((u) => u.emailVerified).length}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Users ({filteredUsers.length})
            </h2>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || filterRole !== "all"
                  ? "No users found matching your criteria."
                  : "No users found."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(
                              user.id,
                              e.target.value as "admin" | "user"
                            )
                          }
                          className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.emailVerified
                              ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400"
                          }`}
                        >
                          {user.emailVerified ? "Verified" : "Unverified"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageTemplate>
  );
}
