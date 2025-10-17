import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageTemplate } from "~/components/common/PageTemplate";
import { FormField } from "~/components/common/FormField";
import { useValidation, actorValidationSchema } from "~/hooks/useValidation";
import { useToast } from "~/components/common/ToastProvider";

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
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const { errors, validate, validateSingle, clearError } = useValidation(
    actorValidationSchema
  );
  const { addToast } = useToast();

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
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    const type = "type" in e.target ? e.target.type : "";
    const newValue =
      type === "checkbox" && "checked" in e.target
        ? (e.target as HTMLInputElement).checked
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      clearError(name);
    }
  };

  const handleBlur = (
    e: React.FocusEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
      | HTMLDivElement
    >
  ) => {
    const target = e.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;
    if ("name" in target && "value" in target) {
      validateSingle(target.name, target.value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validate(formData)) {
      addToast({
        type: "error",
        title: "Validation Error",
        message: "Please fix the errors in the form before submitting.",
      });
      return;
    }

    setSubmitting(true);

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
          addToast({
            type: "success",
            title: "Success",
            message: "Actor created successfully!",
          });
          navigate("/actors");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create actor");
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
          addToast({
            type: "success",
            title: "Success",
            message: "Actor updated successfully!",
          });
          navigate(`/actors/view/${id}`);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update actor");
        }
      }
    } catch (error) {
      console.error("Failed to save actor:", error);
      addToast({
        type: "error",
        title: "Error",
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while saving the actor.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTemplate
      title={mode === "create" ? "Add New Actor" : "Edit Actor"}
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
            <FormField
              label="Name"
              name="name"
              type="text"
              value={formData.name || ""}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.name}
              placeholder="Enter actor's full name"
              required
            />

            <FormField
              label="Biography"
              name="bio"
              type="textarea"
              value={formData.bio || ""}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.bio}
              placeholder="Enter actor's biography (optional)"
              rows={4}
            />

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
                disabled={submitting}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitting && (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {mode === "create" ? "Create Actor" : "Update Actor"}
              </button>
            </div>
          </form>
        </div>
      )}
    </PageTemplate>
  );
}
