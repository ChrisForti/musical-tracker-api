import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET!;
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(
    file: Buffer,
    key: string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
        Metadata: metadata,
        // Make images publicly readable
        ACL: "public-read",
      });

      await this.s3Client.send(command);

      // Return the public URL
      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
      console.error("Error uploading to S3:", error);
      throw new Error("Failed to upload file to S3");
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error("Error deleting from S3:", error);
      throw new Error("Failed to delete file from S3");
    }
  }

  /**
   * Generate S3 key (path) for different image types
   */
  generateS3Key(
    imageType: "poster" | "profile" | "thumbnail",
    entityType: "musical" | "performance" | "user",
    entityId: string,
    fileExtension: string
  ): string {
    const timestamp = Date.now();
    const uniqueId = uuidv4().substring(0, 8);

    switch (imageType) {
      case "poster":
        if (entityType === "musical") {
          return `posters/musicals/${entityId}/poster-${timestamp}-${uniqueId}.${fileExtension}`;
        } else if (entityType === "performance") {
          return `posters/performances/${entityId}/poster-${timestamp}-${uniqueId}.${fileExtension}`;
        }
        break;
      case "profile":
        return `profiles/users/${entityId}/avatar-${timestamp}-${uniqueId}.${fileExtension}`;
      case "thumbnail":
        return `thumbnails/${entityType}/${entityId}/thumb-${timestamp}-${uniqueId}.${fileExtension}`;
    }

    // Fallback
    return `uploads/${entityType}/${entityId}/${imageType}-${timestamp}-${uniqueId}.${fileExtension}`;
  }

  /**
   * Extract file extension from filename
   */
  getFileExtension(filename: string): string {
    return filename.split(".").pop()?.toLowerCase() || "jpg";
  }

  /**
   * Get S3 key from full URL
   */
  getKeyFromUrl(url: string): string {
    const bucketUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
    return url.replace(bucketUrl, "");
  }
}

export const s3Service = new S3Service();
