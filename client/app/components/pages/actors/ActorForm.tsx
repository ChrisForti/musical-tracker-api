import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageTemplate } from "~/components/common/PageTemplate";

interface Actor {
  id: string;
  name: string;
  approved: boolean;
  bio?: string;
}

interface ActorFormProps {
  mode: "create" | "edit";
  actorId?: string;
}

export default function ActorForm({ mode, actorId }: ActorFormProps) {
  const [formData, setFormData] = useState<Partial<Actor>>({
    name: "",
    approved: false,
    bio: "",
  });

  const [loading, setLoading] = useState(mode === "edit");
  const navigate = useNavigate();
  const params = useParams();

  // If actorId is not provided directly, try to get it from URL params
  const id = actorId || params.id;

  useEffect(() => {
    if (mode === "edit" && id) {
      const fetchActor = async () => {
        try {
          const token = localStorage.getItem("authToken");
          const response = await fetch(`http://localhost:3000/v2/actor/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setFormData(data);
          } else {
            console.error("Failed to fetch actor:", response.statusText);
          }
        } catch (err) {
          console.error("Error fetching actor:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchActor();
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
        const response = await fetch("http://localhost:3000/v2/actor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          navigate("/actors");
        } else {
          console.error("Failed to create actor:", response.statusText);
        }
      } else {
        const response = await fetch(`http://localhost:3000/v2/actor/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          navigate(`/actors/view/${id}`);
        } else {
          console.error("Failed to update actor:", response.statusText);
        }
      }
    } catch (error) {
      console.error("Failed to save actor:", error);
    }
  };

  return (
    <PageTemplate
      title={mode === "create" ? "Add New Actor" : "Edit Actor"}
      backButton={{
        label: "Back",
        onClick: () =>
          mode === "edit" && id
            ? navigate(`/actors/view/${id}`)
            : navigate("/actors"),
      }}
    >
      {loading ? (
        <div className="p-4 text-center">Loading...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Biography
              </label>
              <textarea
                name="bio"
                value={formData.bio || ""}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="approved"
                checked={formData.approved || false}
                onChange={handleInputChange}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Approved
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() =>
                  mode === "edit" && id
                    ? navigate(`/actors/view/${id}`)
                    : navigate("/actors")
                }
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md"
              >
                {mode === "create" ? "Create Actor" : "Update Actor"}
              </button>
            </div>
          </form>
        </div>
      )}
    </PageTemplate>
  );
}
