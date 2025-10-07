import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageTemplate } from "~/components/common/PageTemplate";

interface Theater {
  id: string;
  name: string;
  city: string;
  verified: boolean;
}

interface TheaterFormProps {
  mode: "create" | "edit";
  theaterId?: string;
}

export default function TheaterForm({ mode, theaterId }: TheaterFormProps) {
  const [formData, setFormData] = useState<Partial<Theater>>({
    name: "",
    city: "",
    verified: false,
  });

  const [loading, setLoading] = useState(mode === "edit");
  const navigate = useNavigate();
  const params = useParams();

  // If theaterId is not provided directly, try to get it from URL params
  const id = theaterId || params.id;

  useEffect(() => {
    if (mode === "edit" && id) {
      const fetchTheater = async () => {
        try {
          const token = localStorage.getItem("authToken");
          const response = await fetch(`http://localhost:3000/v2/theater/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setFormData(data);
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
    }
  }, [mode, id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("authToken");

      if (mode === "create") {
        const response = await fetch("http://localhost:3000/v2/theater", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            city: formData.city,
          }),
        });

        if (response.ok) {
          navigate("/theaters");
        } else {
          console.error("Failed to create theater:", response.statusText);
        }
      } else {
        const response = await fetch(`http://localhost:3000/v2/theater/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            city: formData.city,
          }),
        });

        if (response.ok) {
          navigate(`/theaters/view/${id}`);
        } else {
          console.error("Failed to update theater:", response.statusText);
        }
      }
    } catch (error) {
      console.error("Error saving theater:", error);
      alert("Failed to save theater. Please try again.");
    }
  };

  return (
    <PageTemplate
      title={mode === "create" ? "Add New Theater" : "Edit Theater"}
      backButton={{
        label: "Back",
        onClick: () =>
          mode === "edit" && id
            ? navigate(`/theaters/view/${id}`)
            : navigate("/theaters"),
      }}
    >
      {loading ? (
        <div className="p-4 text-center">Loading...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Theater Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter theater name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    required
                    value={formData.city || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter city"
                  />
                </div>

                {mode === "edit" && (
                  <div>
                    <div className="flex items-center">
                      <input
                        id="verified"
                        name="verified"
                        type="checkbox"
                        checked={formData.verified || false}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="verified"
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        Verified Theater
                      </label>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Only verified theaters can be selected for performances.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() =>
                    mode === "edit" && id
                      ? navigate(`/theaters/view/${id}`)
                      : navigate("/theaters")
                  }
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  {mode === "create" ? "Create Theater" : "Update Theater"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageTemplate>
  );
}