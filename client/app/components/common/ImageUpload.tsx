import { useState, useEffect } from "react";
import type { ChangeEvent, DragEvent } from "react";

interface UploadResponse {
  imageId: string;
  url: string;
}

interface ImageUploadProps {
  imageType: "poster" | "profile" | "thumbnail";
  currentImageUrl?: string;
  onUploadSuccess?: (data: UploadResponse) => void;
  onUploadError?: (error: string) => void;
  onImageSelect?: (file: File) => void;
  onClear?: () => void; // Add clear functionality instead of onDelete
  accept?: string;
  className?: string;
}

export const ImageUpload = ({
  imageType,
  currentImageUrl,
  onImageSelect,
  onUploadSuccess,
  onUploadError,
  onClear,
  accept = "image/*",
  className = "",
}: ImageUploadProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(
    currentImageUrl || null
  );
  const [isDragging, setIsDragging] = useState(false);

  // Update selectedImage when currentImageUrl changes
  useEffect(() => {
    setSelectedImage(currentImageUrl || null);
  }, [currentImageUrl]);

  const validateFile = (file: File) => {
    // Check file type
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files are allowed");
    }

    // Check file size (5MB for poster, 2MB for others)
    const maxSize = imageType === "poster" ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(
        `File size must be less than ${maxSize / (1024 * 1024)}MB`
      );
    }
  };

  const uploadImage = async (file: File) => {
    try {
      // Validate file before uploading
      validateFile(file);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("imageType", imageType);

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("http://localhost:3000/v2/media", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Upload failed: ${response.statusText}`;

        try {
          const errorData = JSON.parse(errorText);
          errorMessage =
            errorData?.error || errorData?.errors?.[0] || errorMessage;
        } catch (e) {
          console.error("Failed to parse error response:", errorText);
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Upload failed");
    }
  };

  const handleFile = async (file: File) => {
    if (file) {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Notify about file selection
      if (onImageSelect) {
        onImageSelect(file);
      }

      // Handle upload if callbacks are provided
      if (onUploadSuccess || onUploadError) {
        try {
          const data = await uploadImage(file);
          onUploadSuccess?.(data);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Upload failed";
          onUploadError?.(errorMessage);
          // Reset preview on error
          setSelectedImage(currentImageUrl || null);
        }
      }
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    if (onClear) {
      onClear();
    }
  };

  return (
    <div
      className={`image-upload ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleImageChange}
        className="hidden"
        id="image-upload"
      />
      <label
        htmlFor="image-upload"
        className={`cursor-pointer block p-4 border-2 border-dashed rounded-lg text-center transition-colors ${
          isDragging
            ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        {selectedImage ? (
          <div className="relative group">
            <img
              src={selectedImage}
              alt={`${imageType} preview`}
              className="max-w-full h-auto rounded"
            />
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {isDragging ? "Drop to replace image" : "Click to change image"}
            </div>
            {onClear && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClear();
                }}
                className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="text-gray-600 dark:text-gray-400">
              {isDragging ? "Drop image here" : `Click to upload ${imageType}`}
            </div>
            <div className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              or drag and drop
            </div>
          </div>
        )}
      </label>
    </div>
  );
};
