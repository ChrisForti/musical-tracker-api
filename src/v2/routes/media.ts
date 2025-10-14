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
  uploadMiddleware.poster.single("file"),
  uploadMediaHandler
);

// DELETE /v2/media/:imageId - Delete uploaded image
mediaRouter.delete("/:imageId", ensureAuthenticated, deleteImageHandler);

// GET /v2/media/debug - Debug AWS configuration
mediaRouter.get("/debug", debugConfigHandler);

// Interfaces for request bodies
interface UploadMediaBody {
  imageType: "poster" | "profile";
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
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const { imageType } = req.body;
    const userId = req.user?.id;
    const validator = new Validator();

    // Simple validation - just imageType required
    validator.check(!!imageType, "imageType", "is required");
    validator.check(
      ["poster", "profile"].includes(imageType),
      "imageType",
      "must be 'poster' or 'profile'"
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
    const processedImage = await imageProcessor.processImage(
      req.file.buffer,
      imageType
    );

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

    // Upload to S3 - use public URLs for posters, signed URLs for profiles
    const s3Url =
      imageType === "poster"
        ? await s3Service.uploadFileWithDirectUrl(
            processedImage.buffer,
            s3Key,
            imageProcessor.getMimeType(processedImage.format),
            {
              originalName: req.file.originalname,
              uploadedBy: userId,
              imageType: imageType,
            }
          )
        : await s3Service.uploadFile(
            processedImage.buffer,
            s3Key,
            imageProcessor.getMimeType(processedImage.format),
            {
              originalName: req.file.originalname,
              uploadedBy: userId,
              imageType: imageType,
            }
          );

    // Save to database
    const imageRecord = await imageDb.createImage({
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
    console.error("Error in uploadMediaHandler:", error);
    res.status(500).json({ error: "Failed to upload media" });
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
