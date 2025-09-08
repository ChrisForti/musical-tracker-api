import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "jpeg" | "png" | "webp";
  cropToSquare?: boolean;
}

export class ImageProcessor {
  private static readonly ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  private static readonly MAX_FILE_SIZE = {
    poster: 5 * 1024 * 1024, // 5MB
    profile: 2 * 1024 * 1024, // 2MB
  };

  private static readonly DEFAULT_PROCESSING_OPTIONS = {
    poster: {
      maxWidth: 1200,
      maxHeight: 1800,
      quality: 85,
      format: "jpeg" as const,
    },
    profile: {
      maxWidth: 300,
      maxHeight: 300,
      quality: 90,
      format: "jpeg" as const,
      cropToSquare: true,
    },
    thumbnail: {
      maxWidth: 150,
      maxHeight: 150,
      quality: 80,
      format: "jpeg" as const,
      cropToSquare: true,
    },
  };

  /**
   * Validate file type and size
   */
  static async validateFile(
    buffer: Buffer,
    originalName: string,
    imageType: "poster" | "profile"
  ): Promise<{ isValid: boolean; error?: string; mimeType?: string }> {
    // Check file size
    const maxSize = this.MAX_FILE_SIZE[imageType];
    if (buffer.length > maxSize) {
      return {
        isValid: false,
        error: `File size too large. Maximum ${
          maxSize / (1024 * 1024)
        }MB allowed for ${imageType} images.`,
      };
    }

    // Check file type using file-type library (more reliable than relying on filename)
    const fileType = await fileTypeFromBuffer(buffer);

    if (!fileType || !this.ALLOWED_MIME_TYPES.includes(fileType.mime)) {
      return {
        isValid: false,
        error:
          "Invalid file type. Only JPEG, PNG, and WebP images are allowed.",
      };
    }

    return {
      isValid: true,
      mimeType: fileType.mime,
    };
  }

  /**
   * Process image based on type (poster, profile, thumbnail)
   */
  static async processImage(
    buffer: Buffer,
    imageType: "poster" | "profile" | "thumbnail",
    customOptions?: ImageProcessingOptions
  ): Promise<ProcessedImage> {
    try {
      const options = {
        ...this.DEFAULT_PROCESSING_OPTIONS[imageType],
        ...customOptions,
      };

      let sharpInstance = sharp(buffer);

      // Get original metadata
      const metadata = await sharpInstance.metadata();

      if (!metadata.width || !metadata.height) {
        throw new Error("Unable to read image dimensions");
      }

      // Handle cropping to square (for profile pictures and thumbnails)
      if (options.cropToSquare) {
        const size = Math.min(metadata.width, metadata.height);
        sharpInstance = sharpInstance.resize(size, size, {
          fit: "cover",
          position: "center",
        });
      } else {
        // Resize while maintaining aspect ratio
        sharpInstance = sharpInstance.resize(
          options.maxWidth,
          options.maxHeight,
          {
            fit: "inside",
            withoutEnlargement: true,
          }
        );
      }

      // Apply format and quality settings
      if (options.format === "jpeg") {
        sharpInstance = sharpInstance.jpeg({ quality: options.quality });
      } else if (options.format === "png") {
        sharpInstance = sharpInstance.png({ quality: options.quality });
      } else if (options.format === "webp") {
        sharpInstance = sharpInstance.webp({ quality: options.quality });
      }

      // Process the image
      const processedBuffer = await sharpInstance.toBuffer();
      const processedMetadata = await sharp(processedBuffer).metadata();

      return {
        buffer: processedBuffer,
        width: processedMetadata.width || 0,
        height: processedMetadata.height || 0,
        format: options.format,
        size: processedBuffer.length,
      };
    } catch (error) {
      console.error("Error processing image:", error);
      throw new Error("Failed to process image");
    }
  }

  /**
   * Generate thumbnail from processed image
   */
  static async generateThumbnail(buffer: Buffer): Promise<ProcessedImage> {
    return this.processImage(buffer, "thumbnail");
  }

  /**
   * Get MIME type from format
   */
  static getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      jpeg: "image/jpeg",
      jpg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
    };

    return mimeTypes[format.toLowerCase()] || "image/jpeg";
  }

  /**
   * Get file extension from format
   */
  static getFileExtension(format: string): string {
    const extensions: Record<string, string> = {
      jpeg: "jpg",
      jpg: "jpg",
      png: "png",
      webp: "webp",
    };

    return extensions[format.toLowerCase()] || "jpg";
  }
}

export const imageProcessor = ImageProcessor;
