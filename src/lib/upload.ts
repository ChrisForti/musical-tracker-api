import multer from "multer";
import type { Request, Response, NextFunction } from "express";

// Configure multer for memory storage (we'll process and upload to S3)
const storage = multer.memoryStorage();

// Custom type for enhanced multer instance
interface EnhancedMulterInstance extends multer.Multer {
  handler: (req: Request, res: Response, next: NextFunction) => void;
}

// Error types for better error handling
type FileValidationError = Error & { code?: string };

const createFileValidationError = (
  message: string,
  code: string
): FileValidationError => {
  const error = new Error(message) as FileValidationError;
  error.code = code;
  return error;
};

const validateContentType = (mimetype: string): boolean => {
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  return validTypes.includes(mimetype.toLowerCase());
};

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const fileDetails = {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    fieldname: file.fieldname,
    encoding: file.encoding,
    headers: req.headers["content-type"],
  };
  console.log("Processing upload file:", fileDetails);

  try {
    // Parse Content-Type
    if (!file.mimetype) {
      throw createFileValidationError(
        "Missing content type",
        "MISSING_CONTENT_TYPE"
      );
    }

    // Validate file field name
    if (file.fieldname !== "file") {
      throw createFileValidationError(
        "File must be uploaded in the 'file' field",
        "INVALID_FIELD_NAME"
      );
    }

    // Check extension first (faster than mimetype validation)
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = file.originalname.toLowerCase().match(/\.[^.]*$/)?.[0];

    if (!ext || !allowedExtensions.includes(ext)) {
      throw createFileValidationError(
        `Invalid file extension. Allowed extensions: ${allowedExtensions.join(", ")}`,
        "INVALID_FILE_EXTENSION"
      );
    }

    // Strict content type validation
    if (!validateContentType(file.mimetype)) {
      throw createFileValidationError(
        `Invalid content type: ${file.mimetype}. Allowed types: image/jpeg, image/png, image/webp`,
        "INVALID_CONTENT_TYPE"
      );
    }

    // Validate image mime type prefix
    if (!file.mimetype.startsWith("image/")) {
      throw createFileValidationError(
        "Only image files are allowed",
        "INVALID_FILE_TYPE"
      );
    }

    console.log("File validation successful:", {
      filename: file.originalname,
      type: file.mimetype,
      size: file.size,
    });

    cb(null, true);
  } catch (error) {
    console.error("File validation failed:", {
      error: error instanceof Error ? error.message : "Unknown error",
      code: (error as FileValidationError).code,
      file: fileDetails,
    });
    cb(error as Error);
  }
};

// Function to create a middleware with the multer instance
const wrapMulterInstance = (instance: ReturnType<typeof multer>): EnhancedMulterInstance => {
  const wrapped = instance as EnhancedMulterInstance;
  
  wrapped.handler = (req: Request, res: Response, next: NextFunction) => {
    const uploadSingle = instance.single("file");
    uploadSingle(req, res, (err: any) => {
      if (err) {
        console.error("Multer upload error:", {
          errorType: err instanceof multer.MulterError ? "MulterError" : "ValidationError",
          name: err.name,
          code: err.code,
          message: err.message,
          field: err.field,
          headers: {
            contentType: req.headers["content-type"],
            contentLength: req.headers["content-length"],
          },
        });

        const statusCode = err instanceof multer.MulterError || err.code ? 400 : 500;
        const errorMessage = err instanceof multer.MulterError || err.code
          ? handleMulterError(err)
          : "File upload failed. Please try again.";

        res.status(statusCode).json({ error: errorMessage });
        return;
      }

      if (!req.file) {
        console.error("No file in request after multer processing", {
          body: req.body,
          headers: {
            contentType: req.headers["content-type"],
            contentLength: req.headers["content-length"],
          },
        });
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      next();
    });
  };
  
  return wrapped;
};

// Create multer upload middleware with different size limits
export const createUploadMiddleware = (maxSizeBytes: number): EnhancedMulterInstance => {
  return wrapMulterInstance(multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSizeBytes,
      files: 1,
      fields: 10, // Allow multiple form fields
      // Remove parts limit - it's too restrictive
    },
  }));
};

// Predefined upload middlewares for different image types
export const uploadMiddleware = {
  // For poster images (5MB limit)
  poster: createUploadMiddleware(5 * 1024 * 1024),

  // For profile images (2MB limit)
  profile: createUploadMiddleware(2 * 1024 * 1024),

  // For thumbnail images (1MB limit)
  thumbnail: createUploadMiddleware(1 * 1024 * 1024),
};

// Error handler for multer errors
export const handleMulterError = (error: any) => {
  const errorDetails = {
    name: error?.name,
    code: error?.code,
    message: error?.message,
    field: error?.field,
    type:
      error instanceof multer.MulterError
        ? "MulterError"
        : error instanceof Error
        ? error.constructor.name
        : "Unknown",
  };

  console.error("Upload error details:", errorDetails);

  // Handle our custom validation errors
  if (error.code && typeof error.code === "string") {
    switch (error.code) {
      case "MISSING_CONTENT_TYPE":
        return "Content type is required for file upload";
      case "INVALID_FIELD_NAME":
        return "File must be uploaded using the 'file' field";
      case "INVALID_CONTENT_TYPE":
        return (
          error.message ||
          "Invalid file type. Only JPG, PNG, and WebP images are allowed"
        );
      case "INVALID_FILE_EXTENSION":
        return "Invalid file extension. Only .jpg, .jpeg, .png, and .webp files are allowed";
      case "INVALID_FILE_TYPE":
        return "Only image files (JPG, PNG, WebP) are allowed";
    }
  }

  // Handle Multer's built-in errors
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        return "File size exceeds the allowed limit";
      case "LIMIT_FILE_COUNT":
        return "Only one file can be uploaded at a time";
      case "LIMIT_UNEXPECTED_FILE":
        return "Invalid upload field name";
      case "LIMIT_FIELD_KEY":
        return "Invalid form field name";
      case "LIMIT_FIELD_VALUE":
        return "Form field value exceeds the limit";
      case "LIMIT_FIELD_COUNT":
        return "Too many form fields";
      case "LIMIT_PART_COUNT":
        return "Too many parts in multipart form";
      case "MISSING_FIELD_NAME":
        return "Missing field name in form data";
      default:
        return `Upload error: ${error.message}`;
    }
  }

  if (error instanceof Error) {
    // Handle specific error messages from our file filter
    if (error.message.includes("extension")) {
      return "Invalid file extension. Only .jpg, .jpeg, .png, and .webp files are allowed";
    }
    if (error.message.includes("image files")) {
      return "Only image files (JPG, PNG, WebP) are allowed";
    }
    return error.message || "An error occurred during file validation";
  }

  return "An unexpected error occurred during upload";
};
