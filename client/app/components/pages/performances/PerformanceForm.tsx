import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageTemplate } from "~/components/common/PageTemplate";
import { ImageUpload } from "~/components/common/ImageUpload";
import { navigateBackToDashboard } from "~/lib/navigationUtils";

interface Performance {
  id: string;
  musicalId: string;
  date: string;
  theaterId: string;
  posterId?: string;
  posterUrl?: string;
}

interface PerformanceFormProps {
  mode: "create" | "edit";
  performanceId?: string;
}

export default function PerformanceForm({
  mode,
  performanceId,
}: PerformanceFormProps) {
  const [formData, setFormData] = useState<Partial<Performance>>({
    date: "",
    musicalId: "",
    theaterId: "",
  });

  const [loading, setLoading] = useState(mode === "edit");
  const [imageError, setImageError] = useState<string | null>(null);
  const [musicals, setMusicals] = useState<{ id: string; name: string }[]>([]);
  const [theaters, setTheaters] = useState<{ id: string; name: string; city: string }[]>([]);
  const navigate = useNavigate();

  // Load data when editing an existing performance
  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (mode === "edit" && performanceId) {
      const fetchPerformance = async () => {
        try {
          const response = await fetch(
            `http://localhost:3000/v2/performance/${performanceId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setFormData(data);
          } else {
            console.error("Failed to fetch performance:", response.statusText);
          }
        } catch (err) {
          console.error("Error fetching performance:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchPerformance();
    }

    // Load reference data (musicals, theaters)
    const loadReferenceData = async () => {
      try {
        // Fetch musicals (for productions)
        const musicalsResponse = await fetch(
          "http://localhost:3000/v2/musical",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (musicalsResponse.ok) {
          const musicalsData = await musicalsResponse.json();
          setProductions(
            musicalsData.map((musical: any) => ({
              id: musical.id,
              name: musical.name,
              musicalTitle: musical.name,
            }))
          );
        }

        // Fetch theaters (only verified ones for performance creation)
        const theatersResponse = await fetch(
          "http://localhost:3000/v2/theater",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (theatersResponse.ok) {
          const theatersData = await theatersResponse.json();
          console.log("🎭 Theater API Response:", theatersData); // Debug log
          // Filter to only show verified theaters for performance creation
          const verifiedTheaters = theatersData.filter(
            (theater: any) => theater.verified
          );
          console.log("🎭 Verified theaters:", verifiedTheaters); // Debug log
          setTheaters(
            verifiedTheaters.map((theater: any) => ({
              id: theater.id,
              name: `${theater.name} - ${theater.city}`,
              city: theater.city,
            }))
          );
        } else {
          console.error(
            "🎭 Theater API failed:",
            theatersResponse.status,
            theatersResponse.statusText
          ); // Debug log
        }
      } catch (error) {
        console.error("Error loading reference data:", error);
      }
    };

    loadReferenceData();
  }, [mode, performanceId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("authToken");

      if (mode === "create") {
        const response = await fetch("http://localhost:3000/v2/performance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            musicalId: formData.musicalId,
            theaterId: formData.theaterId,
            date: formData.date,
          }),
        });

        if (response.ok) {
          navigate("/performances");
        } else {
          console.error("Failed to create performance:", response.statusText);
        }
      } else {
        const response = await fetch(
          `http://localhost:3000/v2/performance/${performanceId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              musicalId: formData.productionId,
              theaterId: formData.theaterId,
              date: formData.date,
            }),
          }
        );

        if (response.ok) {
          navigate(`/performances/view/${performanceId}`);
        } else {
          console.error("Failed to update performance:", response.statusText);
        }
      }
    } catch (error) {
      console.error("Error saving performance:", error);
      alert("Failed to save performance. Please try again.");
    }
  };

  return (
    <PageTemplate
      title={mode === "create" ? "Add New Performance" : "Edit Performance"}
      backButton={{
        label: "Back to Dashboard",
        onClick: () => navigateBackToDashboard(navigate),
      }}
    >
      {loading ? (
        <div className="p-4 text-center">Loading...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Production
                </label>
                <select
                  name="musicalId"
                  value={formData.musicalId || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  required
                >
                  <option value="">Select a Production</option>
                            .map((musical) => (
                    <option key={musical.id} value={musical.id}>
                      {musical.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Theater
                </label>
                <select
                  name="theaterId"
                  value={formData.theaterId || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  required
                >
                  <option value="">Select a Theater</option>
                  {theaters.map((theater) => (
                    <option key={theater.id} value={theater.id}>
                      {theater.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() =>
                  mode === "edit" && performanceId
                    ? navigate(`/performances/view/${performanceId}`)
                    : navigate("/performances")
                }
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md"
              >
                {mode === "create"
                  ? "Create Performance"
                  : "Update Performance"}
              </button>
            </div>
          </form>
        </div>
      )}
    </PageTemplate>
  );
}
