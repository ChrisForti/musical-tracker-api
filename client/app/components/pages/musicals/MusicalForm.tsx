import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageTemplate } from "~/components/common/PageTemplate";
import { ImageUpload } from "~/components/common/ImageUpload";

interface Musical {
  id: string;
  title: string;
  composer: string;
  lyricist: string;
  approved: boolean;
  synopsis?: string;
  posterId?: string;
  posterUrl?: string;
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
    posterId: undefined,
    posterUrl: undefined,
  });

  const [loading, setLoading] = useState(mode === "edit");
  const [imageError, setImageError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (mode === "edit" && musicalId) {
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
            setFormData(data);
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

  // Handle image upload success
  const handleImageUpload = (imageData: {
    imageId: string;
    url: string;
    width: number;
    height: number;
    fileSize: number;
  }) => {
    setFormData(prev => ({
      ...prev,
      posterId: imageData.imageId,
      posterUrl: imageData.url,
    }));
    setImageError(null);
  };

  // Handle image upload error
  const handleImageError = (error: string) => {
    setImageError(error);
  };

  // Handle image deletion
  const handleImageDelete = async (imageId?: string) => {
    if (!imageId && !formData.posterId) return;

    try {
      const token = localStorage.getItem("authToken");
      const deleteId = imageId || formData.posterId;
      
      const response = await fetch(`http://localhost:3000/v2/media/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          posterId: undefined,
          posterUrl: undefined,
        }));
      } else {
        console.error('Failed to delete image:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("authToken");

      if (mode === "create") {
        const response = await fetch("http://localhost:3000/v2/musical", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.title, // API uses 'name' not 'title'
            composer: formData.composer,
            lyricist: formData.lyricist,
            description: formData.synopsis, // API uses 'description' not 'synopsis'
            posterId: formData.posterId,
          }),
        });

        if (response.ok) {
          navigate("/musicals");
        } else {
          console.error("Failed to create musical:", response.statusText);
        }
      } else {
        const response = await fetch(
          `http://localhost:3000/v2/musical/${musicalId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: formData.title,
              composer: formData.composer,
              lyricist: formData.lyricist,
              description: formData.synopsis,
              posterId: formData.posterId,
            }),
          }
        );

        if (response.ok) {
          navigate(`/musicals/view/${musicalId}`);
        } else {
          console.error("Failed to update musical:", response.statusText);
        }
      }
    } catch (error) {
      console.error("Failed to save musical:", error);
    }
  };

  return (
    <PageTemplate
      title={mode === "create" ? "Add New Musical" : "Edit Musical"}
      backButton={{
        label: "Back to Dashboard",
        onClick: () => navigate("/"),
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

            {/* Poster Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Poster Image
              </label>
              <ImageUpload
                imageType="poster"
                currentImageUrl={formData.posterUrl}
                onUploadSuccess={handleImageUpload}
                onUploadError={handleImageError}
                onDeleteImage={handleImageDelete}
                className="max-w-md"
              />
              {imageError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {imageError}
                </p>
              )}
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
