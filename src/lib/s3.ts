import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

export class S3Service {
  private s3Client: S3Client | null = null;
  private bucketName: string;

  constructor() {
    // Initialize S3 client only if all required env vars are present
    // Validation will happen when upload is attempted
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const bucketName = process.env.AWS_S3_BUCKET;

    if (accessKeyId && secretAccessKey && bucketName) {
      this.s3Client = new S3Client({
        region: process.env.AWS_REGION || "us-east-1",
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.bucketName = bucketName;
    } else {
      // Will be caught by upload route validation
      this.bucketName = "";
    }
  }

  /**
   * Check if S3 is properly configured
   */
  private checkS3Configuration(): void {
    if (!this.s3Client || !this.bucketName) {
      throw new Error(
        "AWS S3 not properly configured. Missing environment variables."
      );
    }
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
    this.checkS3Configuration();

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
        Metadata: metadata,
        // Note: ACL removed because bucket doesn't allow ACLs
        // Make sure bucket has public read policy instead
      });

      await this.s3Client!.send(command);

      // Generate a signed URL that works for 24 hours
      return await this.getSignedUrl(key);
    } catch (error) {
      console.error("Error uploading to S3:", error);
      if (error instanceof Error) {
        throw new Error(`S3 Upload Error: ${error.message}`);
      } else {
        throw new Error("Failed to upload file to S3");
      }
    }
  }

  /**
   * Generate a signed URL for viewing an object (24 hour expiry)
   */
  async getSignedUrl(key: string): Promise<string> {
    this.checkS3Configuration();

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client!, command, {
        expiresIn: 86400, // 24 hours
      });

      return signedUrl;
    } catch (error) {
      console.error("Error generating signed URL:", error);
      // Fallback to regular URL if signing fails
      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    this.checkS3Configuration();

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client!.send(command);
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
