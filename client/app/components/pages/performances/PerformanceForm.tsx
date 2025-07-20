import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageTemplate } from "~/components/common/PageTemplate";

interface Performance {
  id: string;
  productionId: string;
  date: string;
  theaterId: string;
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
    productionId: "",
    theaterId: "",
  });

  const [loading, setLoading] = useState(mode === "edit");
  const [productions, setProductions] = useState<
    { id: string; name: string; musicalTitle: string }[]
  >([]);
  const [theaters, setTheaters] = useState<{ id: string; name: string }[]>([]);
  const navigate = useNavigate();

  // Load data when editing an existing performance
  useEffect(() => {
    if (mode === "edit" && performanceId) {
      // In a real app, fetch the performance data from the API
      // For now, using sample data
      const samplePerformances = [
        {
          id: "1",
          productionId: "prod1",
          date: "2025-07-20",
          theaterId: "theater1",
        },
        {
          id: "2",
          productionId: "prod2",
          date: "2025-07-21",
          theaterId: "theater2",
        },
      ];

      const performance = samplePerformances.find(
        (p) => p.id === performanceId
      );
      if (performance) {
        setFormData(performance);
      }

      setLoading(false);
    }

    // Load reference data (productions, theaters)
    const loadReferenceData = async () => {
      // In a real app, fetch from API
      // For now, using sample data
      setProductions([
        { id: "prod1", name: "Broadway Revival", musicalTitle: "Hamilton" },
        {
          id: "prod2",
          name: "National Tour",
          musicalTitle: "The Phantom of the Opera",
        },
        {
          id: "prod3",
          name: "West End Production",
          musicalTitle: "Les Misérables",
        },
      ]);

      setTheaters([
        { id: "theater1", name: "Gershwin Theatre" },
        { id: "theater2", name: "Kennedy Center" },
        { id: "theater3", name: "Queen's Theatre" },
      ]);
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
      if (mode === "create") {
        // Create new performance
        // const response = await fetch('http://localhost:3000/v1/performances', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify(formData)
        // });

        // if (!response.ok) {
        //   throw new Error(`Error ${response.status}: ${response.statusText}`);
        // }

        // const data = await response.json();
        console.log("Created new performance:", formData);

        navigate("/performances");
      } else {
        // Update existing performance
        // const response = await fetch(`http://localhost:3000/v1/performances/${performanceId}`, {
        //   method: 'PUT',
        //   headers: {
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify(formData)
        // });

        // if (!response.ok) {
        //   throw new Error(`Error ${response.status}: ${response.statusText}`);
        // }

        // const data = await response.json();
        console.log("Updated performance:", formData);

        navigate(`/performances/view/${performanceId}`);
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
        label: "Back",
        onClick: () =>
          mode === "edit" && performanceId
            ? navigate(`/performances/view/${performanceId}`)
            : navigate("/performances"),
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
                  name="productionId"
                  value={formData.productionId || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  required
                >
                  <option value="">Select a Production</option>
                  {productions.map((production) => (
                    <option key={production.id} value={production.id}>
                      {production.musicalTitle} - {production.name}
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
