import React, { useState, useRef, useCallback } from "react";

interface ImageUploadProps {
  imageType: "poster" | "profile";
  currentImageUrl?: string;
  onUploadSuccess: (imageData: {
    imageId: string;
    url: string;
    width: number;
    height: number;
    fileSize: number;
  }) => void;
  onUploadError?: (error: string) => void;
  onDeleteImage?: (imageId?: string) => void;
  className?: string;
  disabled?: boolean;
}

interface UploadResponse {
  success: boolean;
  imageId: string;
  url: string;
  width: number;
  height: number;
  fileSize: number;
  imageType: string;
}

export function ImageUpload({
  imageType,
  currentImageUrl,
  onUploadSuccess,
  onUploadError,
  onDeleteImage,
  className = "",
  disabled = false,
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get size limits based on image type
  const maxSize = imageType === "poster" ? 5 : 2; // MB
  const maxSizeBytes = maxSize * 1024 * 1024;
  const acceptedTypes = ".jpg,.jpeg,.png,.webp";

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle drop events
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    [disabled]
  );

  // Validate file before upload
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSize}MB limit`;
    }

    // Check file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return "Please upload a valid image file (JPEG, PNG, or WebP)";
    }

    return null;
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      onUploadError?.(validationError);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("imageType", imageType);

      const token = localStorage.getItem("authToken");

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      };

      // Handle response
      xhr.onload = () => {
        if (xhr.status === 201) {
          const response: UploadResponse = JSON.parse(xhr.responseText);
          onUploadSuccess({
            imageId: response.imageId,
            url: response.url,
            width: response.width,
            height: response.height,
            fileSize: response.fileSize,
          });
          setPreviewUrl(null);
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            console.error("Upload failed:", errorResponse);
            onUploadError?.(
              errorResponse.error || `Upload failed (${xhr.status})`
            );
          } catch (e) {
            console.error(
              "Upload failed with status:",
              xhr.status,
              "Response:",
              xhr.responseText
            );
            onUploadError?.(`Upload failed (${xhr.status}): ${xhr.statusText}`);
          }
          setPreviewUrl(null);
        }
        setUploading(false);
        setUploadProgress(0);
      };

      xhr.onerror = () => {
        onUploadError?.("Network error during upload");
        setUploading(false);
        setUploadProgress(0);
        setPreviewUrl(null);
      };

      xhr.open("POST", "http://localhost:3000/v2/media");
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.send(formData);
    } catch (error) {
      console.error("Upload error:", error);
      onUploadError?.("Failed to upload image");
      setUploading(false);
      setUploadProgress(0);
      setPreviewUrl(null);
    }
  };

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Handle click to open file picker
  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle delete image
  const handleDelete = () => {
    if (onDeleteImage) {
      onDeleteImage();
    }
  };

  return (
    <div className={`image-upload ${className}`}>
      {/* Current or Preview Image */}
      {(currentImageUrl || previewUrl) && (
        <div className="mb-4 relative">
          <img
            src={previewUrl || currentImageUrl}
            alt={`${imageType} preview`}
            className={`max-w-full h-auto rounded-lg shadow-md ${
              imageType === "profile" ? "max-w-[200px]" : "max-w-[300px]"
            }`}
          />

          {/* Upload progress overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="text-white text-center">
                <div className="text-sm mb-2">Uploading...</div>
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="text-xs mt-1">{uploadProgress}%</div>
              </div>
            </div>
          )}

          {/* Delete button */}
          {currentImageUrl && !uploading && onDeleteImage && (
            <button
              onClick={handleDelete}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center"
              title="Delete image"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Upload Area */}
      {!uploading && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${
              dragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={acceptedTypes}
            onChange={handleInputChange}
            disabled={disabled}
          />

          <div className="text-gray-600 dark:text-gray-400">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm">
              {currentImageUrl
                ? "Click or drag to replace image"
                : "Click or drag to upload image"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {imageType === "poster" ? "Poster" : "Profile"} • Max {maxSize}MB
              • JPEG, PNG, WebP
            </div>
          </div>
        </div>
      )}

      {/* Upload Status */}
      {uploading && !previewUrl && (
        <div className="text-center py-8">
          <div className="text-gray-600 dark:text-gray-400">
            <div className="text-2xl mb-2">⏳</div>
            <div className="text-sm">Processing upload...</div>
          </div>
        </div>
      )}
    </div>
  );
}
