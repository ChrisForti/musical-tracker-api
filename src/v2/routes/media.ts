import { Router, type Request, type Response } from "express";
import { ensureAuthenticated } from "../../lib/auth.js";
import { uploadMiddleware, handleMulterError } from "../../lib/upload.js";
import { imageProcessor } from "../../lib/imageProcessor.js";
import { s3Service } from "../../lib/s3.js";
import { imageDb } from "../../lib/imageDb.js";
import { Validator } from "../../lib/validator.js";
import { validate as validateUuid } from "uuid";

export const mediaRouter = Router();

// POST /v2/media - Upload any type of media (poster, profile)
mediaRouter.post(
  "/",
  ensureAuthenticated,
  uploadMiddleware.poster.handler,
  (req, res, next) => {
    // Validate file after multer
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    next();
  },
  uploadMediaHandler
);

// DELETE /v2/media/:imageId - Delete uploaded image
mediaRouter.delete("/:imageId", ensureAuthenticated, deleteImageHandler);

// GET /v2/media/debug - Debug AWS configuration
mediaRouter.get("/debug", debugConfigHandler);

// Interfaces for request bodies
interface UploadMediaBody {
  imageType: "poster" | "profile" | "thumbnail";
}

/**
 * Handle unified media upload for any image type
 */
async function uploadMediaHandler(
  req: Request<{}, {}, UploadMediaBody>,
  res: Response
) {
  try {
    // Check if file was uploaded
    if (!req.file) {
      console.error("No file uploaded");
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const { imageType } = req.body;
    const userId = req.user?.id;
    const validator = new Validator();

    // Simple validation - just imageType required
    validator.check(!!imageType, "imageType", "is required");
    validator.check(
      ["poster", "profile", "thumbnail"].includes(imageType),
      "imageType",
      "must be 'poster', 'profile', or 'thumbnail'"
    );

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Validate AWS configuration
    if (
      !process.env.AWS_ACCESS_KEY_ID ||
      !process.env.AWS_SECRET_ACCESS_KEY ||
      !process.env.AWS_S3_BUCKET
    ) {
      console.error("Missing AWS configuration");
      res.status(500).json({ error: "Server configuration error" });
      return;
    }

    // Validate file
    const validation = await imageProcessor.validateFile(
      req.file.buffer,
      req.file.originalname,
      imageType
    );

    if (!validation.isValid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    // Process image
    let processedImage;
    try {
      processedImage = await imageProcessor.processImage(
        req.file.buffer,
        imageType
      );
    } catch (error) {
      console.error("Image processing failed:", error);
      res.status(500).json({
        error: "Failed to process image. Please try a different image.",
      });
      return;
    }

    // Generate S3 key - simplified, use "user" for both types
    const fileExtension = imageProcessor.getFileExtension(
      processedImage.format
    );
    const s3Key = s3Service.generateS3Key(
      imageType,
      "user",
      userId,
      fileExtension
    );

    // Upload to S3 and get signed URL
    let s3Url;
    try {
      s3Url = await s3Service.uploadFileWithDirectUrl(
        processedImage.buffer,
        s3Key,
        imageProcessor.getMimeType(processedImage.format),
        {
          originalName: req.file.originalname,
          uploadedBy: userId,
          imageType: imageType,
        }
      );
    } catch (error) {
      console.error("S3 upload failed:", error);
      res.status(500).json({ error: "Failed to store image. Please try again." });
      return;
    }

    // Save to database
    let imageRecord;
    try {
      imageRecord = await imageDb.createImage({
        originalFilename: req.file.originalname,
        s3Key,
        s3Url,
        fileSize: processedImage.size,
        mimeType: validation.mimeType!,
        width: processedImage.width,
        height: processedImage.height,
        uploadedBy: userId,
        imageType: imageType,
      });
    } catch (error) {
      console.error("Database save failed:", error);
      // Attempt to clean up the uploaded S3 file
      try {
        await s3Service.deleteFile(s3Key);
      } catch (cleanupError) {
        console.error("Failed to cleanup S3 file after database error");
      }
      res.status(500).json({ error: "Failed to save image metadata. Please try again." });
      return;
    }

    res.status(201).json({
      success: true,
      imageId: imageRecord.id,
      url: s3Url,
      width: processedImage.width,
      height: processedImage.height,
      fileSize: processedImage.size,
      imageType: imageType,
    });
  } catch (error) {
    console.error("Error in uploadMediaHandler:", {
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
      context: {
        userId: req.user?.id,
        imageType: req.body.imageType,
        fileName: req.file?.originalname,
        fileSize: req.file?.size,
        mimeType: req.file?.mimetype,
        awsConfig: {
          hasAccessKeyId: !!process.env.AWS_ACCESS_KEY_ID,
          hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
          hasBucket: !!process.env.AWS_S3_BUCKET,
          region: process.env.AWS_REGION,
        },
      },
    });

    // Handle specific error types
    if (error instanceof Error) {
      if (
        error.message.includes("S3") ||
        error.message.includes("storage") ||
        error.message.includes("bucket")
      ) {
        res
          .status(500)
          .json({ error: "Storage service error. Please try again later." });
      } else if (
        error.message.includes("process") ||
        error.message.includes("image")
      ) {
        res
          .status(500)
          .json({
            error: "Image processing failed. Please try a different image.",
          });
      } else if (
        error.message.includes("database") ||
        error.message.includes("SQL")
      ) {
        res
          .status(500)
          .json({ error: "Failed to save image metadata. Please try again." });
      } else if (error.message.includes("configuration")) {
        res
          .status(500)
          .json({
            error: "Server configuration error. Please contact support.",
          });
      } else {
        res
          .status(500)
          .json({ error: "Failed to upload media. Please try again." });
      }
    } else {
      res
        .status(500)
        .json({
          error: "An unexpected error occurred. Please try again later.",
        });
    }
  }
}

/**
 * Delete an uploaded image
 */
async function deleteImageHandler(
  req: Request<{ imageId: string }>,
  res: Response
) {
  try {
    const { imageId } = req.params;
    const userId = req.user?.id;
    const validator = new Validator();

    validator.check(!!imageId, "imageId", "is required");
    if (imageId) {
      validator.check(validateUuid(imageId), "imageId", "must be a valid UUID");
    }

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Get the image record
    const image = await imageDb.getImageById(imageId);
    if (!image) {
      res.status(404).json({ error: "Image not found" });
      return;
    }

    // Only allow deletion by the uploader or admin
    if (image.uploadedBy !== userId && req.user?.role !== "admin") {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    // Delete from S3
    await s3Service.deleteFile(image.s3Key);

    // Delete from database
    await imageDb.deleteImage(imageId);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteImageHandler:", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
}

/**
 * Debug AWS configuration (development only)
 */
async function debugConfigHandler(req: Request, res: Response) {
  if (process.env.NODE_ENV === "production") {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const config = {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? "SET" : "NOT_SET",
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY
      ? "SET"
      : "NOT_SET",
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || "NOT_SET",
    AWS_REGION: process.env.AWS_REGION || "NOT_SET",
  };

  const issues: string[] = [];
  if (!process.env.AWS_ACCESS_KEY_ID) issues.push("AWS_ACCESS_KEY_ID not set");
  if (!process.env.AWS_SECRET_ACCESS_KEY)
    issues.push("AWS_SECRET_ACCESS_KEY not set");
  if (!process.env.AWS_S3_BUCKET) issues.push("AWS_S3_BUCKET not set");

  res.status(200).json({
    message: "AWS Configuration Debug (Development Only)",
    config,
    issues,
  });
}
