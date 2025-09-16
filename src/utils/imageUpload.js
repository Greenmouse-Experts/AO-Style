/**
 * Image upload utility for market rep products
 * Handles image uploads to cloud storage (Cloudinary or similar)
 */

// Mock upload function - replace with actual cloud storage implementation
export const uploadImagesToCloud = async (files) => {
  try {
    const uploadPromises = files.map(async (file) => {
      // Validate file
      if (!isValidImageFile(file)) {
        throw new Error(`Invalid file: ${file.name}`);
      }

      // Create FormData for upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ao_style_products"); // Replace with your preset
      formData.append("folder", "market-rep-products");

      // Mock upload - replace with actual Cloudinary or AWS S3 upload
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 2000),
      );

      // Return mock URL - replace with actual upload response
      const mockUrl = `https://res.cloudinary.com/demo/image/upload/v${Date.now()}/${file.name.replace(/\.[^/.]+$/, "")}.jpg`;

      return {
        url: mockUrl,
        originalName: file.name,
        size: file.size,
        type: file.type,
      };
    });

    const results = await Promise.all(uploadPromises);
    return {
      success: true,
      data: results,
      message: "Images uploaded successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: "Failed to upload images",
    };
  }
};

// Validate image file
export const isValidImageFile = (file) => {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return false;
  }

  if (file.size > maxSize) {
    return false;
  }

  return true;
};

// Get file size in readable format
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Generate image preview URL
export const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Compress image before upload
export const compressImage = (file, maxWidth = 1920, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        file.type,
        quality,
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

// Batch upload with progress tracking
export const uploadImagesWithProgress = async (files, onProgress) => {
  const results = [];
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    try {
      const file = files[i];

      // Compress image if needed
      const compressedFile = await compressImage(file);

      // Upload single file
      const result = await uploadImagesToCloud([compressedFile]);

      if (result.success) {
        results.push(result.data[0]);
      } else {
        results.push({ error: result.error, file: file.name });
      }

      // Update progress
      if (onProgress) {
        onProgress({
          completed: i + 1,
          total,
          percentage: Math.round(((i + 1) / total) * 100),
          currentFile: file.name,
        });
      }
    } catch (error) {
      results.push({ error: error.message, file: files[i].name });
    }
  }

  return {
    success: results.filter((r) => r.url).length > 0,
    results,
    uploaded: results.filter((r) => r.url).length,
    failed: results.filter((r) => r.error).length,
  };
};

// Remove image from cloud storage
export const deleteImageFromCloud = async (imageUrl) => {
  try {
    // Extract public ID from URL for Cloudinary
    const publicId = extractPublicIdFromUrl(imageUrl);

    // Mock delete - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      message: "Image deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: "Failed to delete image",
    };
  }
};

// Extract public ID from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
  // This is a simplified extraction - adjust based on your cloud provider
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  return filename.split(".")[0];
};

// Default export for convenience
export default {
  uploadImagesToCloud,
  uploadImagesWithProgress,
  deleteImageFromCloud,
  isValidImageFile,
  formatFileSize,
  createImagePreview,
  compressImage,
};
