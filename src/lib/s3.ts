import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

type ImageType = "poster" | "profile" | "thumbnail";
type EntityType = "musical" | "performance" | "user";

interface S3UploadResult {
  key: string;
  url: string;
  contentType: string;
  size: number;
}

export class S3Service {
  private s3Client: S3Client | null = null;
  private bucketName = "";
  private isConfigValid = false;
  private lastInitAttempt = 0;
  private initError: string | null = null;
  private readonly region = process.env.AWS_REGION || "us-east-1";

  constructor() {
    this.checkAndLogConfig();
  }

  private checkAndLogConfig(): void {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const bucketName = process.env.AWS_S3_BUCKET;

    const configState = {
      hasAccessKeyId: !!accessKeyId,
      hasSecretKey: !!secretAccessKey,
      hasBucket: !!bucketName,
      region: this.region,
      bucket: bucketName || "(not set)",
    };

    console.log("S3Service configuration state:", configState);
  }

  private async initializeIfNeeded(): Promise<void> {
    const now = Date.now();
    if (
      this.isConfigValid ||
      (now - this.lastInitAttempt < 300000 && this.initError)
    ) {
      if (this.initError) {
        throw new Error(this.initError);
      }
      return;
    }

    this.lastInitAttempt = now;
    this.initError = null;

    try {
      const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
      const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
      const bucketName = process.env.AWS_S3_BUCKET;

      if (!accessKeyId || !secretAccessKey || !bucketName) {
        const missing = [];
        if (!accessKeyId) missing.push("AWS_ACCESS_KEY_ID");
        if (!secretAccessKey) missing.push("AWS_SECRET_ACCESS_KEY");
        if (!bucketName) missing.push("AWS_S3_BUCKET");

        this.initError = `Missing required AWS configuration: ${missing.join(
          ", "
        )}`;
        throw new Error(this.initError);
      }

      console.log("Initializing S3 client with config:", {
        hasAccessKeyId: !!accessKeyId,
        hasSecretKey: !!secretAccessKey,
        bucket: bucketName,
        region: this.region,
      });

      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      this.bucketName = bucketName;
      this.isConfigValid = true;

      await this.checkConnection();
    } catch (error) {
      this.isConfigValid = false;
      if (error instanceof Error) {
        this.initError = error.message;
        throw new Error(`S3 initialization failed: ${error.message}`);
      }
      this.initError = "Unknown initialization error";
      throw new Error(
        "Failed to initialize S3 service due to an unknown error"
      );
    }
  }

  async checkConnection(): Promise<void> {
    if (!this.s3Client) {
      throw new Error("S3 client not initialized");
    }

    try {
      console.log("Testing S3 connection to bucket:", this.bucketName);

      const command = new ListObjectsCommand({
        Bucket: this.bucketName,
        MaxKeys: 1,
      });

      await this.s3Client.send(command);
      console.log("S3 connection test successful");
    } catch (error) {
      console.error("S3 connection test failed:", error);

      if (error instanceof Error) {
        if (error.message.includes("InvalidAccessKeyId")) {
          throw new Error(
            "Invalid AWS access key. Please check your credentials."
          );
        }
        if (error.message.includes("SignatureDoesNotMatch")) {
          throw new Error(
            "Invalid AWS secret key. Please check your credentials."
          );
        }
        if (error.message.includes("NoSuchBucket")) {
          throw new Error(
            `Bucket "${this.bucketName}" not found in region ${this.region}.`
          );
        }
        if (error.message.includes("NetworkingError")) {
          throw new Error(
            "Network error while connecting to S3. Please check your internet connection."
          );
        }
        throw new Error(`S3 Connection Error: ${error.message}`);
      }

      throw new Error("Failed to connect to S3 due to an unknown error");
    }
  }

  private getBucketBaseUrl(): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com`;
  }

  private isBucketPublic = false;

  private async checkBucketPublicAccess(): Promise<boolean> {
    if (!this.s3Client) {
      throw new Error("S3 client not initialized");
    }

    try {
      // Try to upload a test object with public-read ACL
      const testKey = `test/public-access-check-${Date.now()}`;
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: testKey,
        Body: Buffer.from("test"),
        ACL: "public-read",
      });

      await this.s3Client.send(command);

      // If successful, clean up the test object
      try {
        await this.deleteFile(testKey);
      } catch (cleanupError) {
        console.warn("Failed to clean up test object:", cleanupError);
      }

      this.isBucketPublic = true;
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes("AccessDenied")) {
        this.isBucketPublic = false;
        return false;
      }
      throw error;
    }
  }

  async uploadFileWithDirectUrl(
    buffer: Buffer,
    key: string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    await this.initializeIfNeeded();
    const result = await this.uploadFile(buffer, key, contentType, metadata);
    return result.url;
  }

  private async uploadFile(
    buffer: Buffer,
    key: string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<S3UploadResult> {
    if (!this.s3Client) {
      throw new Error("S3 client not initialized");
    }

    if (!buffer || buffer.length === 0) {
      throw new Error("Cannot upload empty file");
    }

    if (!key) {
      throw new Error("S3 key is required");
    }

    if (!contentType) {
      contentType = "application/octet-stream";
    }

    try {
      // Upload without ACL - rely on bucket policy for access control
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: metadata,
        // Removed ACL: "public-read" - bucket doesn't allow ACLs
      });

      await this.s3Client.send(command);

      // Since bucket doesn't allow ACLs, generate a signed URL for access
      const signedUrl = await this.getSignedUrl(key);

      return {
        key,
        url: signedUrl,
        contentType,
        size: buffer.length,
      };
    } catch (error) {
      console.error("Error uploading to S3:", {
        error,
        key,
        contentType,
        size: buffer.length,
      });

      if (error instanceof Error) {
        if (error.message.includes("AccessDenied")) {
          throw new Error(
            "Access denied to S3 bucket. Check IAM permissions and bucket policy."
          );
        }
        if (error.message.includes("NoSuchBucket")) {
          throw new Error(
            `Bucket "${this.bucketName}" not found in region ${this.region}.`
          );
        }
        if (error.message.includes("NetworkingError")) {
          throw new Error(
            "Network error while uploading. Check your internet connection."
          );
        }
        if (error.message.includes("TimeoutError")) {
          throw new Error(
            "Timeout while uploading. The file may be too large or your connection too slow."
          );
        }
        if (error.message.includes("InvalidAccessKeyId")) {
          throw new Error(
            "Invalid AWS access key. Check your AWS credentials."
          );
        }
        if (error.message.includes("SignatureDoesNotMatch")) {
          throw new Error(
            "Invalid AWS secret key. Check your AWS credentials."
          );
        }
        throw new Error(`Upload failed: ${error.message}`);
      }

      throw new Error("Upload failed due to an unknown error");
    }
  }

  async uploadImage(
    buffer: Buffer,
    fileName: string,
    mimetype: string
  ): Promise<string> {
    await this.initializeIfNeeded();

    if (!buffer || buffer.length === 0) {
      throw new Error("Cannot upload empty image file");
    }

    if (!fileName) {
      throw new Error("Image filename is required");
    }

    if (!mimetype) {
      console.warn(
        "No mimetype specified for image upload, inferring from filename"
      );
      mimetype = this.getContentTypeFromFilename(fileName);
    }

    try {
      const sanitizedName = this.sanitizeFilename(fileName);
      const key = `images/${uuidv4()}-${sanitizedName}`;

      const result = await this.uploadFile(buffer, key, mimetype, {
        originalName: fileName,
      });

      console.log("Image upload successful:", {
        key: result.key,
        size: result.size,
        type: result.contentType,
        originalName: fileName,
      });

      return result.key;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Image upload failed: ${error.message}`);
      }
      throw new Error("Failed to upload image due to an unknown error");
    }
  }

  async getSignedUrl(key: string): Promise<string> {
    await this.initializeIfNeeded();

    if (!this.s3Client) {
      throw new Error("S3 client not initialized");
    }

    if (!key) {
      throw new Error("S3 key is required");
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 86400, // 24 hours
      });

      return signedUrl;
    } catch (error) {
      console.error("Error generating signed URL:", {
        error,
        key,
        bucket: this.bucketName,
      });

      // Fallback to regular URL if signing fails
      return `${this.getBucketBaseUrl()}/${key}`;
    }
  }

  async deleteFile(key: string): Promise<void> {
    await this.initializeIfNeeded();

    if (!this.s3Client) {
      throw new Error("S3 client not initialized");
    }

    if (!key) {
      throw new Error("S3 key is required");
    }

    try {
      console.log("Deleting file from S3:", { key });

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      console.log("File deletion successful:", { key });
    } catch (error) {
      console.error("Error deleting from S3:", {
        error,
        key,
        bucket: this.bucketName,
      });

      if (error instanceof Error) {
        if (error.message.includes("AccessDenied")) {
          throw new Error("Access denied to S3 bucket. Check IAM permissions.");
        }
        if (error.message.includes("NoSuchKey")) {
          throw new Error(`File "${key}" not found in bucket.`);
        }
        throw new Error(`Failed to delete file: ${error.message}`);
      }

      throw new Error("Failed to delete file due to an unknown error");
    }
  }

  generateS3Key(
    imageType: ImageType,
    entityType: EntityType,
    entityId: string,
    fileExtension: string
  ): string {
    if (!imageType || !entityType || !entityId) {
      throw new Error("Missing required parameters for S3 key generation");
    }

    fileExtension = fileExtension.replace(/^\./, "").toLowerCase();
    return `${imageType}/${entityType}/${entityId}/${uuidv4()}.${fileExtension}`;
  }

  private sanitizeFilename(filename: string): string {
    filename = filename.replace(/^.*[\\\/]/, "");
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_{2,}/g, "_")
      .toLowerCase();
  }

  private getFileExtension(filename: string): string {
    const parts = filename.split(".");
    return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
  }

  private getContentTypeFromFilename(filename: string): string {
    const ext = this.getFileExtension(filename);
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
    };

    return mimeTypes[ext] || "application/octet-stream";
  }
}

export const s3Service = new S3Service();
