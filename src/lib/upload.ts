import multer from "multer";
import type { Request } from "express";

// Configure multer for memory storage (we'll process and upload to S3)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allow only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

// Create multer upload middleware with different size limits
export const createUploadMiddleware = (maxSizeBytes: number) => {
  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSizeBytes,
      files: 1, // Only allow single file upload
    },
  });
};

// Predefined upload middlewares for different image types
export const uploadMiddleware = {
  // For poster images (5MB limit)
  poster: createUploadMiddleware(5 * 1024 * 1024),

  // For profile images (2MB limit)
  profile: createUploadMiddleware(2 * 1024 * 1024),
};

// Error handler for multer errors
export const handleMulterError = (error: any) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        return "File too large";
      case "LIMIT_FILE_COUNT":
        return "Too many files";
      case "LIMIT_UNEXPECTED_FILE":
        return "Unexpected file field";
      default:
        return "Upload error: " + error.message;
    }
  } else if (error) {
    return error.message;
  }
  return "Unknown upload error";
};
