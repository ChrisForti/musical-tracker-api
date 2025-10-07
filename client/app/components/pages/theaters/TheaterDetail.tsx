import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageTemplate } from "~/components/common/PageTemplate";

interface Theater {
  id: string;
  name: string;
  city: string;
  verified: boolean;
}

interface TheaterDetailProps {
  theaterId: string;
}

export default function TheaterDetail({ theaterId }: TheaterDetailProps) {
  const [theater, setTheater] = useState<Theater | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTheater = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`http://localhost:3000/v2/theater/${theaterId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTheater(data);
        } else {
          console.error("Failed to fetch theater:", response.statusText);
        }
      } catch (err) {
        console.error("Error fetching theater:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheater();
  }, [theaterId]);

  const handleDelete = async () => {
    if (!theater) return;

    if (confirm("Are you sure you want to delete this theater?")) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`http://localhost:3000/v2/theater/${theater.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          navigate("/theaters");
        } else {
          console.error("Failed to delete theater:", response.statusText);
        }
      } catch (error) {
        console.error("Failed to delete theater:", error);
        alert("Failed to delete theater. Please try again.");
      }
    }
  };

  const handleVerify = async () => {
    if (!theater) return;

    if (confirm("Are you sure you want to verify this theater?")) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`http://localhost:3000/v2/theater/${theater.id}/verify`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          // Update local state to reflect verification
          setTheater({ ...theater, verified: true });
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

  if (loading) {
    return (
      <PageTemplate title="Theater Details">
        <div className="p-4 text-center">Loading theater...</div>
      </PageTemplate>
    );
  }

  if (!theater) {
    return (
      <PageTemplate title="Theater Details">
        <div className="p-4 text-center text-red-600">Theater not found.</div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={theater.name}
      backButton={{
        label: "Back to Theaters",
        onClick: () => navigate("/theaters"),
      }}
    >
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {theater.name}
            </h1>
            <span
              className={`px-3 py-1 text-sm rounded-full ${
                theater.verified
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {theater.verified ? "Verified" : "Pending Verification"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Theater Information
              </h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Name
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {theater.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    City
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {theater.city}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {theater.verified ? "Verified" : "Pending Verification"}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Quick Stats
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    0
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Performances Hosted
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex space-x-3">
            {!theater.verified && (
              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                onClick={handleVerify}
              >
                Verify Theater
              </button>
            )}
            <button
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md"
              onClick={() => navigate(`/theaters/edit/${theater.id}`)}
            >
              Edit Theater
            </button>
            <button
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
              onClick={handleDelete}
            >
              Delete Theater
            </button>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}