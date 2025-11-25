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
    profile: 2 * 1024 * 1024, // 2MB,
    thumbnail: 1 * 1024 * 1024, // 1MB
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
    imageType: "poster" | "profile" | "thumbnail"
  ): Promise<{ isValid: boolean; error?: string; mimeType?: string }> {
    try {
      console.log("Validating image file:", {
        fileSize: buffer.length,
        maxAllowedSize: this.MAX_FILE_SIZE[imageType],
        imageType,
        originalName,
      });

      // Check if buffer is empty or too small
      if (!buffer || buffer.length === 0) {
        console.warn("Empty file received:", { originalName });
        return {
          isValid: false,
          error: "Empty file received. Please select a valid image file.",
        };
      }

      if (buffer.length < 100) {
        // Arbitrary small size that's too small for a valid image
        console.warn("Suspiciously small file received:", {
          size: buffer.length,
          originalName,
        });
        return {
          isValid: false,
          error:
            "File appears to be invalid or corrupted. Please select a valid image file.",
        };
      }

      // Check file size
      const maxSize = this.MAX_FILE_SIZE[imageType];
      if (buffer.length > maxSize) {
        console.warn("File size exceeded limit:", {
          size: buffer.length,
          maxSize,
          imageType,
          originalName,
        });
        return {
          isValid: false,
          error: `File size too large. Maximum ${
            maxSize / (1024 * 1024)
          }MB allowed for ${imageType} images. Your file is ${(
            buffer.length /
            (1024 * 1024)
          ).toFixed(1)}MB.`,
        };
      }

      // Check file type using file-type library
      const fileTypeResult = await fileTypeFromBuffer(buffer);
      console.log("Detected file type:", {
        detectedType: fileTypeResult?.mime,
        allowedTypes: this.ALLOWED_MIME_TYPES,
        originalName,
      });

      if (!fileTypeResult) {
        console.warn("Could not determine file type:", {
          originalName,
          fileSize: buffer.length,
          firstBytes: buffer.slice(0, 4).toString("hex"),
        });
        return {
          isValid: false,
          error:
            "Could not determine file type. The file may be corrupted or not a valid image file. Please ensure you're uploading a JPEG, PNG, or WebP image.",
        };
      }

      if (!this.ALLOWED_MIME_TYPES.includes(fileTypeResult.mime)) {
        console.warn("Invalid file type detected:", {
          detectedType: fileTypeResult.mime,
          originalName,
          extension: originalName.split(".").pop()?.toLowerCase(),
        });
        return {
          isValid: false,
          error: `Invalid file type detected: ${fileTypeResult.mime}. Only JPEG, PNG, and WebP images are allowed. Please convert your image to one of these formats and try again.`,
        };
      }

      // Store mime type for the response
      const detectedMimeType = fileTypeResult.mime;

      // Verify image can be processed by sharp and has valid dimensions
      try {
        const metadata = await sharp(buffer).metadata();

        if (!metadata.width || !metadata.height) {
          console.warn("Invalid image dimensions:", { metadata, originalName });
          throw new Error("Invalid image dimensions");
        }

        if (metadata.width < 10 || metadata.height < 10) {
          console.warn("Image dimensions too small:", {
            width: metadata.width,
            height: metadata.height,
            originalName,
          });
          return {
            isValid: false,
            error:
              "Image dimensions are too small. Please upload a larger image.",
          };
        }

        if (metadata.width > 10000 || metadata.height > 10000) {
          console.warn("Image dimensions too large:", {
            width: metadata.width,
            height: metadata.height,
            originalName,
          });
          return {
            isValid: false,
            error:
              "Image dimensions are too large. Maximum allowed dimensions are 10000x10000 pixels.",
          };
        }

        console.log("Image validation successful:", {
          dimensions: `${metadata.width}x${metadata.height}`,
          format: metadata.format,
          space: metadata.space,
          channels: metadata.channels,
          originalName,
        });
      } catch (err) {
        console.error("Sharp validation failed:", {
          error: err,
          originalName,
          fileSize: buffer.length,
        });

        if (err instanceof Error) {
          if (
            err.message.includes(
              "Input buffer contains unsupported image format"
            )
          ) {
            return {
              isValid: false,
              error:
                "Unsupported image format. Please upload a JPEG, PNG, or WebP image.",
            };
          }
          if (err.message.includes("Input file contains incomplete image")) {
            return {
              isValid: false,
              error:
                "The image file appears to be incomplete or corrupted. Please try uploading it again.",
            };
          }
        }

        return {
          isValid: false,
          error:
            "The file could not be processed as a valid image. Please ensure it's not corrupted and is in a supported format (JPEG, PNG, or WebP).",
        };
      }

      // All validations passed
      return {
        isValid: true,
        mimeType: detectedMimeType,
      };
    } catch (error) {
      console.error("Error in validateFile:", error);
      return {
        isValid: false,
        error: "Failed to validate image file",
      };
    }
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
      console.error("Error processing image:", {
        error,
        originalSize: buffer.length,
      });

      if (error instanceof Error) {
        // Sharp specific errors
        if (
          error.message.includes(
            "Input buffer contains unsupported image format"
          )
        ) {
          throw new Error(
            "Image format not supported. Please upload a JPEG, PNG, or WebP image."
          );
        } else if (error.message.includes("Input file is too large")) {
          throw new Error(
            "Image is too large to process. Please try a smaller image."
          );
        } else if (
          error.message.includes("Input file contains unsupported marker")
        ) {
          throw new Error(
            "Image file is corrupted. Please try a different image."
          );
        }

        throw new Error(`Failed to process image: ${error.message}`);
      }

      throw new Error("Failed to process image due to an unexpected error");
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
