import { Router, type Request, type Response } from "express";
import { ensureAuthenticated } from "../../lib/auth.js";
import { uploadMiddleware, handleMulterError } from "../../lib/upload.js";
import { imageProcessor } from "../../lib/imageProcessor.js";
import { s3Service } from "../../lib/s3.js";
import { imageDb } from "../../lib/imageDb.js";
import { Validator } from "../../lib/validator.js";
import { validate as validateUuid } from "uuid";
import { db } from "../../drizzle/db.js";
import { MusicalTable, PerformanceTable } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";

export const uploadRouter = Router();

// POST /v2/upload/poster - Upload poster for musical or performance
uploadRouter.post(
  "/poster",
  ensureAuthenticated,
  uploadMiddleware.poster.single("file"),
  uploadPosterHandler
);

// POST /v2/upload/profile - Upload user profile picture
uploadRouter.post(
  "/profile",
  ensureAuthenticated,
  uploadMiddleware.profile.single("file"),
  uploadProfileHandler
);

// DELETE /v2/upload/:imageId - Delete uploaded image
uploadRouter.delete("/:imageId", ensureAuthenticated, deleteImageHandler);

// GET /v2/upload/entity/:entityType/:entityId - Get images for an entity
uploadRouter.get(
  "/entity/:entityType/:entityId",
  ensureAuthenticated,
  getEntityImagesHandler
);

// GET /v2/upload/debug - Debug AWS configuration
uploadRouter.get("/debug", debugConfigHandler);

// Interfaces for request bodies
interface UploadPosterBody {
  type: "musical" | "performance";
  entityId: string;
}

interface UploadProfileBody {
  // Profile uploads don't need additional fields - user ID comes from auth
}

/**
 * Handle poster upload for musicals or performances
 */
async function uploadPosterHandler(
  req: Request<{}, {}, UploadPosterBody>,
  res: Response
) {
  try {
    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const { type, entityId } = req.body;
    const userId = req.user?.id;
    const validator = new Validator();

    // Validate request body
    validator.check(!!type, "type", "is required");
    validator.check(
      type === "musical" || type === "performance",
      "type",
      "must be 'musical' or 'performance'"
    );
    validator.check(!!entityId, "entityId", "is required");
    if (entityId) {
      validator.check(
        validateUuid(entityId),
        "entityId",
        "must be a valid UUID"
      );
    }

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    // Validate that the entity exists in the database
    if (type === "musical") {
      const musical = await db.query.MusicalTable.findFirst({
        where: eq(MusicalTable.id, entityId),
      });
      if (!musical) {
        res.status(404).json({ error: "Musical not found" });
        return;
      }
    } else if (type === "performance") {
      const performance = await db.query.PerformanceTable.findFirst({
        where: eq(PerformanceTable.id, entityId),
      });
      if (!performance) {
        res.status(404).json({ error: "Performance not found" });
        return;
      }
    }

    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Validate AWS configuration early
    if (!process.env.AWS_ACCESS_KEY_ID) {
      res.status(500).json({
        error: "Server configuration error",
        details: "AWS_ACCESS_KEY_ID not configured",
      });
      return;
    }
    if (!process.env.AWS_SECRET_ACCESS_KEY) {
      res.status(500).json({
        error: "Server configuration error",
        details: "AWS_SECRET_ACCESS_KEY not configured",
      });
      return;
    }
    if (!process.env.AWS_S3_BUCKET) {
      res.status(500).json({
        error: "Server configuration error",
        details:
          "AWS_S3_BUCKET not configured - this causes 'No value provided for input HTTP label: Bucket' error",
      });
      return;
    }

    // Validate file
    const validation = await imageProcessor.validateFile(
      req.file.buffer,
      req.file.originalname,
      "poster"
    );

    if (!validation.isValid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    // Process image
    const processedImage = await imageProcessor.processImage(
      req.file.buffer,
      "poster"
    );

    // Generate S3 key
    const fileExtension = imageProcessor.getFileExtension(
      processedImage.format
    );
    const s3Key = s3Service.generateS3Key(
      "poster",
      type,
      entityId,
      fileExtension
    );

    // Upload to S3
    const s3Url = await s3Service.uploadFile(
      processedImage.buffer,
      s3Key,
      imageProcessor.getMimeType(processedImage.format),
      {
        originalName: req.file.originalname,
        uploadedBy: userId,
        entityType: type,
        entityId: entityId,
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
      entityType: type,
      entityId,
      imageType: "poster",
    });

    // TODO: Generate thumbnail (optional)
    // const thumbnail = await imageProcessor.generateThumbnail(processedImage.buffer);
    // ... upload thumbnail to S3 and save to DB

    res.status(201).json({
      success: true,
      imageId: imageRecord.id,
      url: s3Url,
      width: processedImage.width,
      height: processedImage.height,
      fileSize: processedImage.size,
    });
  } catch (error) {
    // Handle multer errors
    if (error instanceof Error && error.message.includes("MulterError")) {
      const multerError = handleMulterError(error);
      res.status(400).json({ error: multerError });
      return;
    }

    console.error("Error in uploadPosterHandler:", error);

    // Provide more specific error information
    if (error instanceof Error) {
      if (error.message.includes("AWS") || error.message.includes("S3")) {
        res.status(500).json({
          error: "AWS S3 configuration error",
          details: error.message,
        });
      } else if (
        error.message.includes("database") ||
        error.message.includes("Database")
      ) {
        res
          .status(500)
          .json({ error: "Database error", details: error.message });
      } else {
        res
          .status(500)
          .json({ error: "Upload failed", details: error.message });
      }
    } else {
      res.status(500).json({ error: "Failed to upload poster" });
    }
  }
}

/**
 * Handle profile picture upload
 */
async function uploadProfileHandler(
  req: Request<{}, {}, UploadProfileBody>,
  res: Response
) {
  try {
    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Validate file
    const validation = await imageProcessor.validateFile(
      req.file.buffer,
      req.file.originalname,
      "profile"
    );

    if (!validation.isValid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    // Process image (crop to square, resize)
    const processedImage = await imageProcessor.processImage(
      req.file.buffer,
      "profile"
    );

    // Generate S3 key
    const fileExtension = imageProcessor.getFileExtension(
      processedImage.format
    );
    const s3Key = s3Service.generateS3Key(
      "profile",
      "user",
      userId,
      fileExtension
    );

    // Upload to S3
    const s3Url = await s3Service.uploadFile(
      processedImage.buffer,
      s3Key,
      imageProcessor.getMimeType(processedImage.format),
      {
        originalName: req.file.originalname,
        uploadedBy: userId,
        entityType: "user",
        entityId: userId,
      }
    );

    // Check if user already has a profile picture and delete the old one
    const existingImages = await imageDb.getImagesByEntity(
      "user",
      userId,
      "profile"
    );
    for (const existingImage of existingImages) {
      try {
        await s3Service.deleteFile(existingImage.s3Key);
        await imageDb.deleteImage(existingImage.id);
      } catch (error) {
        console.error("Error deleting old profile picture:", error);
        // Continue anyway - don't fail the upload for cleanup issues
      }
    }

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
      entityType: "user",
      entityId: userId,
      imageType: "profile",
    });

    res.status(201).json({
      success: true,
      imageId: imageRecord.id,
      url: s3Url,
      width: processedImage.width,
      height: processedImage.height,
      fileSize: processedImage.size,
    });
  } catch (error) {
    // Handle multer errors
    if (error instanceof Error && error.message.includes("MulterError")) {
      const multerError = handleMulterError(error);
      res.status(400).json({ error: multerError });
      return;
    }

    console.error("Error in uploadProfileHandler:", error);
    res.status(500).json({ error: "Failed to upload profile picture" });
  }
}

/**
 * Delete uploaded image
 */
async function deleteImageHandler(
  req: Request<{ imageId: string }>,
  res: Response
) {
  try {
    const { imageId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const validator = new Validator();

    // Validate image ID
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

    // Get image record
    const imageRecord = await imageDb.getImageById(imageId);
    if (!imageRecord) {
      res.status(404).json({ error: "Image not found" });
      return;
    }

    // Check permissions - user can only delete their own images unless admin
    if (imageRecord.uploadedBy !== userId && userRole !== "admin") {
      res.status(403).json({ error: "Not authorized to delete this image" });
      return;
    }

    // Delete from S3
    await s3Service.deleteFile(imageRecord.s3Key);

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
 * Get images for a specific entity
 */
async function getEntityImagesHandler(
  req: Request<{ entityType: string; entityId: string }>,
  res: Response
) {
  try {
    const { entityType, entityId } = req.params;
    const imageType = req.query.imageType as string;
    const validator = new Validator();

    // Validate parameters
    validator.check(!!entityType, "entityType", "is required");
    validator.check(
      ["musical", "performance", "user"].includes(entityType),
      "entityType",
      "must be 'musical', 'performance', or 'user'"
    );
    validator.check(!!entityId, "entityId", "is required");
    if (entityId) {
      validator.check(
        validateUuid(entityId),
        "entityId",
        "must be a valid UUID"
      );
    }

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    // Get images
    const images = await imageDb.getImagesByEntity(
      entityType,
      entityId,
      imageType
    );

    res.status(200).json({
      success: true,
      images: images.map((img) => ({
        id: img.id,
        url: img.s3Url,
        imageType: img.imageType,
        width: img.width,
        height: img.height,
        fileSize: img.fileSize,
        createdAt: img.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error in getEntityImagesHandler:", error);
    res.status(500).json({ error: "Failed to get images" });
  }
}

/**
 * Debug AWS configuration (development only)
 */
async function debugConfigHandler(req: Request, res: Response) {
  // Only allow in development environment
  if (process.env.NODE_ENV === "production") {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const awsConfig = {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? "SET" : "NOT SET",
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY
      ? "SET"
      : "NOT SET",
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || "NOT SET",
    AWS_REGION: process.env.AWS_REGION || "NOT SET (defaulting to us-east-1)",
  };

  res.json({
    message: "AWS Configuration Debug (Development Only)",
    config: awsConfig,
    issues: [
      ...(awsConfig.AWS_ACCESS_KEY_ID === "NOT SET"
        ? ["Missing AWS_ACCESS_KEY_ID"]
        : []),
      ...(awsConfig.AWS_SECRET_ACCESS_KEY === "NOT SET"
        ? ["Missing AWS_SECRET_ACCESS_KEY"]
        : []),
      ...(awsConfig.AWS_S3_BUCKET === "NOT SET"
        ? [
            "Missing AWS_S3_BUCKET - This causes 'No value provided for input HTTP label: Bucket' error",
          ]
        : []),
    ],
  });
}
