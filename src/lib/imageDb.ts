import { db } from "../drizzle/db.js";
import { UploadedImagesTable } from "../drizzle/schema.js";
import { eq, and } from "drizzle-orm";

export interface CreateImageParams {
  originalFilename: string;
  s3Key: string;
  s3Url: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  uploadedBy: string;
  imageType: "poster" | "profile" | "thumbnail";
}

export interface ImageRecord {
  id: string;
  originalFilename: string;
  s3Key: string;
  s3Url: string;
  fileSize: number;
  mimeType: string;
  width?: number | null;
  height?: number | null;
  uploadedBy: string;
  entityType?: string | null;
  entityId?: string | null;
  imageType: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ImageDb {
  /**
   * Save image metadata to database
   */
  static async createImage(params: CreateImageParams): Promise<ImageRecord> {
    try {
      const [newImage] = await db
        .insert(UploadedImagesTable)
        .values({
          originalFilename: params.originalFilename,
          s3Key: params.s3Key,
          s3Url: params.s3Url,
          fileSize: params.fileSize,
          mimeType: params.mimeType,
          width: params.width,
          height: params.height,
          uploadedBy: params.uploadedBy,
          imageType: params.imageType,
        })
        .returning();

      if (!newImage) {
        throw new Error("Failed to create image record");
      }

      return newImage as ImageRecord;
    } catch (error) {
      console.error("Error creating image record:", error);
      throw new Error("Failed to save image metadata");
    }
  }

  /**
   * Get image by ID
   */
  static async getImageById(id: string): Promise<ImageRecord | null> {
    try {
      const image = await db.query.UploadedImagesTable.findFirst({
        where: eq(UploadedImagesTable.id, id),
      });

      return image as ImageRecord | null;
    } catch (error) {
      console.error("Error fetching image by ID:", error);
      throw new Error("Failed to fetch image");
    }
  }

  /**
   * Get images by user (uploaded by specific user)
   */
  static async getImagesByUser(
    userId: string,
    imageType?: string
  ): Promise<ImageRecord[]> {
    try {
      const whereConditions = [eq(UploadedImagesTable.uploadedBy, userId)];

      if (imageType) {
        whereConditions.push(eq(UploadedImagesTable.imageType, imageType));
      }

      const images = await db
        .select()
        .from(UploadedImagesTable)
        .where(and(...whereConditions))
        .orderBy(UploadedImagesTable.createdAt);

      return images as ImageRecord[];
    } catch (error) {
      console.error("Error fetching images by user:", error);
      throw new Error("Failed to fetch user images");
    }
  }

  /**
   * Delete image record from database
   */
  static async deleteImage(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(UploadedImagesTable)
        .where(eq(UploadedImagesTable.id, id));

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error deleting image record:", error);
      throw new Error("Failed to delete image record");
    }
  }

  /**
   * Update image metadata
   */
  static async updateImage(
    id: string,
    updates: Partial<CreateImageParams>
  ): Promise<ImageRecord | null> {
    try {
      const [updatedImage] = await db
        .update(UploadedImagesTable)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(UploadedImagesTable.id, id))
        .returning();

      return updatedImage as ImageRecord | null;
    } catch (error) {
      console.error("Error updating image record:", error);
      throw new Error("Failed to update image record");
    }
  }
}

export const imageDb = ImageDb;
