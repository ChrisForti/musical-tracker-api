import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageTemplate } from "~/components/common/PageTemplate";
import { StatusBadge } from "~/components/common/StatusBadge";
import { useAuth } from "~/hooks/useAuth";

interface Theater {
  id: string;
  name: string;
  city: string;
  verified: boolean;
}

export default function TheaterPage() {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("http://localhost:3000/v2/theater", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTheaters(data);
        } else {
          console.error("Failed to fetch theaters:", response.statusText);
        }
      } catch (err) {
        console.error("Error fetching theaters:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheaters();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this theater?")) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`http://localhost:3000/v2/theater/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          // Update local state
          setTheaters(theaters.filter((theater) => theater.id !== id));
        } else {
          console.error("Failed to delete theater:", response.statusText);
        }
      } catch (error) {
        console.error("Failed to delete theater:", error);
      }
    }
  };

  const handleVerify = async (id: string) => {
    if (confirm("Are you sure you want to verify this theater?")) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `http://localhost:3000/v2/theater/${id}/verify`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          // Update local state to reflect verification
          setTheaters(
            theaters.map((theater) =>
              theater.id === id ? { ...theater, verified: true } : theater
            )
          );
          alert("Theater verified successfully!");
        } else {
          console.error("Failed to verify theater:", response.statusText);
          alert("Failed to verify theater. You may need admin permissions.");
        }
      } catch (error) {
        console.error("Failed to verify theater:", error);
        alert("Failed to verify theater. Please try again.");
      }
    }
  };

  return (
    <PageTemplate
      title="Theaters"
      actionButton={{
        label: "Add Theater",
        onClick: () => navigate("/theaters/new"),
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
        <div className="p-4 text-center">Loading theaters...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  City
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
              {theaters.map((theater) => (
                <tr key={theater.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {theater.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {theater.city}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge verified={theater.verified} size="sm" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/theaters/view/${theater.id}`)}
                        className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
                      >
                        View
                      </button>
                      {!theater.verified && (
                        <button
                          onClick={() => handleVerify(theater.id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          Verify
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/theaters/edit/${theater.id}`)}
                        className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(theater.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {theaters.length === 0 && (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No theaters found. Add your first theater to get started!
            </div>
          )}
        </div>
      )}
    </PageTemplate>
  );
}
