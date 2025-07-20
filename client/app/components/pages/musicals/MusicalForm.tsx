import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageTemplate } from "~/components/common/PageTemplate";

interface Musical {
  id: string;
  title: string;
  composer: string;
  lyricist: string;
  approved: boolean;
  synopsis?: string;
}

interface MusicalFormProps {
  mode: "create" | "edit";
  musicalId?: string;
}

export default function MusicalForm({ mode, musicalId }: MusicalFormProps) {
  const [formData, setFormData] = useState<Partial<Musical>>({
    title: "",
    composer: "",
    lyricist: "",
    approved: false,
    synopsis: "",
  });

  const [loading, setLoading] = useState(mode === "edit");
  const navigate = useNavigate();

  useEffect(() => {
    if (mode === "edit" && musicalId) {
      // Sample data for testing
      const sampleMusicals = [
        {
          id: "1",
          title: "Hamilton",
          composer: "Lin-Manuel Miranda",
          lyricist: "Lin-Manuel Miranda",
          approved: true,
          synopsis:
            "A musical about the life of American Founding Father Alexander Hamilton.",
        },
        {
          id: "2",
          title: "The Phantom of the Opera",
          composer: "Andrew Lloyd Webber",
          lyricist: "Charles Hart",
          approved: true,
          synopsis:
            "A musical about a disfigured musical genius who haunts the Paris Opera House.",
        },
      ];

      // Find the musical to edit
      const musicalToEdit = sampleMusicals.find((m) => m.id === musicalId);

      if (musicalToEdit) {
        setFormData(musicalToEdit);
      }

      setLoading(false);

      // In a real app, fetch from API
      // fetch(`/api/musicals/${musicalId}`)
      //   .then(res => res.json())
      //   .then(data => {
      //     setFormData(data);
      //     setLoading(false);
      //   })
      //   .catch(err => {
      //     console.error("Error fetching musical:", err);
      //     setLoading(false);
      //   });
    }
  }, [mode, musicalId]);

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
      if (mode === "create") {
        // In a real app, make an API call to create
        // const response = await fetch("/api/musicals", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(formData),
        // });
        // const newMusical = await response.json();

        console.log("Creating new musical:", formData);
        navigate("/musicals");
      } else {
        // In a real app, make an API call to update
        // const response = await fetch(`/api/musicals/${musicalId}`, {
        //   method: "PUT",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(formData),
        // });
        // const updatedMusical = await response.json();

        console.log("Updating musical:", formData);
        navigate(`/musicals/view/${musicalId}`);
      }
    } catch (error) {
      console.error("Failed to save musical:", error);
    }
  };

  return (
    <PageTemplate
      title={mode === "create" ? "Add New Musical" : "Edit Musical"}
      backButton={{
        label: "Back",
        onClick: () =>
          mode === "edit" && musicalId
            ? navigate(`/musicals/view/${musicalId}`)
            : navigate("/musicals"),
      }}
    >
      {loading ? (
        <div className="p-4 text-center">Loading...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Composer
              </label>
              <input
                type="text"
                name="composer"
                value={formData.composer || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Lyricist
              </label>
              <input
                type="text"
                name="lyricist"
                value={formData.lyricist || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Synopsis
              </label>
              <textarea
                name="synopsis"
                value={formData.synopsis || ""}
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
                  mode === "edit" && musicalId
                    ? navigate(`/musicals/view/${musicalId}`)
                    : navigate("/musicals")
                }
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md"
              >
                {mode === "create" ? "Create Musical" : "Update Musical"}
              </button>
            </div>
          </form>
        </div>
      )}
    </PageTemplate>
  );
}
