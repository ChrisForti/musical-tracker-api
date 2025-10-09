import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PageTemplate } from "~/components/common/PageTemplate";

interface Musical {
  id: string;
  title: string;
  composer: string;
  lyricist: string;
  approved: boolean;
  synopsis?: string;
}

interface Role {
  id: string;
  name: string;
  musicalId: string;
  verified: boolean;
}

interface MusicalDetailProps {
  musicalId: string;
}

export default function MusicalDetail({ musicalId }: MusicalDetailProps) {
  const [musical, setMusical] = useState<Musical | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMusical = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `http://localhost:3000/v2/musical/${musicalId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Map API data to component structure
          const mappedMusical = {
            id: data.id,
            title: data.name, // API returns 'name', component expects 'title'
            composer: data.composer,
            lyricist: data.lyricist,
            approved: data.verified, // API returns 'verified', component expects 'approved'
            synopsis: data.description, // API returns 'description', component expects 'synopsis'
          };
          setMusical(mappedMusical);
        } else {
          console.error("Failed to fetch musical:", response.statusText);
        }
      } catch (err) {
        console.error("Error fetching musical:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMusical();
  }, [musicalId]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `http://localhost:3000/v2/role?musicalId=${musicalId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setRoles(data);
        } else {
          console.error("Failed to fetch roles:", response.statusText);
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, [musicalId]);

  const handleDelete = async () => {
    if (!musical) return;

    if (confirm("Are you sure you want to delete this musical?")) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `http://localhost:3000/v2/musical/${musical.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          // Navigate back to the list
          navigate("/musicals");
        } else {
          console.error("Failed to delete musical:", response.statusText);
        }
      } catch (error) {
        console.error("Failed to delete musical:", error);
      }
    }
  };

  return (
    <PageTemplate
      title={musical?.title || "Musical Details"}
      backButton={{
        label: "Back to Musicals",
        onClick: () => navigate("/musicals"),
      }}
    >
      {loading ? (
        <div className="p-4 text-center">Loading musical details...</div>
      ) : !musical ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">
          Musical not found.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {musical.title}
              </h1>
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  musical.approved
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {musical.approved ? "Approved" : "Pending Approval"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                  Details
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                  <div>
                    <span className="font-medium">Composer:</span>{" "}
                    {musical.composer}
                  </div>
                  <div>
                    <span className="font-medium">Lyricist:</span>{" "}
                    {musical.lyricist}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                  Synopsis
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {musical.synopsis || "No synopsis available."}
                </p>
              </div>
            </div>

            {/* Roles Section */}
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Roles ({roles.length})
                </h2>
                <div className="flex space-x-2">
                  <Link
                    to={`/roles/new?musicalId=${musical.id}`}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
                  >
                    Add Role
                  </Link>
                  <Link
                    to={`/roles?musicalId=${musical.id}`}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md"
                  >
                    View All Roles
                  </Link>
                </div>
              </div>

              {rolesLoading ? (
                <div className="text-center py-4 text-gray-500">
                  Loading roles...
                </div>
              ) : roles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roles.slice(0, 6).map((role) => (
                    <Link
                      key={role.id}
                      to={`/roles/${role.id}`}
                      className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {role.name}
                        </h3>
                        {!role.verified && (
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                  {roles.length > 6 && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                      <Link
                        to={`/roles?musicalId=${musical.id}`}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        +{roles.length - 6} more roles
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No roles created yet for this musical.</p>
                  <Link
                    to={`/roles/new?musicalId=${musical.id}`}
                    className="mt-2 inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  >
                    Create First Role
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md"
                onClick={() => navigate(`/musicals/edit/${musical.id}`)}
              >
                Edit Musical
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                onClick={handleDelete}
              >
                Delete Musical
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTemplate>
  );
}
