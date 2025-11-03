import React, { useState, useEffect } from "react";
import { CLOUDINARY_UPLOAD_URL, CLOUDINARY_UPLOAD_PRESET } from "../../../constants/apiConstants";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  label?: string;
  error?: string;
  required?: boolean;
  publicId?: string; // For overwrite/delete functionality
  onPublicIdChange?: (publicId: string) => void; // To track public_id for management
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onUploadingChange,
  label = "Hình ảnh",
  error,
  required = false,
  publicId,
  onPublicIdChange,
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);

  // Helper function to extract public_id from Cloudinary URL
  const extractPublicIdFromUrl = (url: string): string | null => {
    if (!url || !url.includes('cloudinary.com')) return null;
    try {
      // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
      const parts = url.split('/upload/');
      if (parts.length > 1) {
        const afterUpload = parts[1];
        // Remove version prefix if exists
        const withoutVersion = afterUpload.split('/').slice(1).join('/');
        // Remove file extension
        const publicId = withoutVersion.split('.')[0];
        return publicId;
      }
    } catch (error) {
      console.error('Error extracting public_id:', error);
    }
    return null;
  };

  // ✅ Notify parent when uploading state changes
  useEffect(() => {
    if (onUploadingChange) {
      onUploadingChange(uploading);
    }
  }, [uploading, onUploadingChange]);

  // ✅ Update preview when value prop changes (existing image from DB)
  useEffect(() => {
    if (value) {
      console.log("📷 Loading existing image:", value);
      setPreviewImage(value);
      // Extract and track public_id if URL is from Cloudinary
      if (onPublicIdChange && value.includes('cloudinary.com')) {
        const extractedPublicId = extractPublicIdFromUrl(value);
        if (extractedPublicId) {
          onPublicIdChange(extractedPublicId);
        }
      }
    } else {
      setPreviewImage(null);
      if (onPublicIdChange) {
        onPublicIdChange('');
      }
    }
  }, [value, onPublicIdChange]);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước file không được vượt quá 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh");
      return;
    }

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);

    // Upload to Cloudinary
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      console.log("🔄 Uploading to Cloudinary...");
      const res = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      console.log("📡 Response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Cloudinary error:", errorData);
        throw new Error(errorData.error?.message || "Upload failed");
      }

      const uploaded = await res.json();
      console.log("✅ Upload success:", uploaded.secure_url);
      const imageUrl = uploaded.secure_url;
      
      // Update parent component with Cloudinary URL
      onChange(imageUrl);
      setPreviewImage(imageUrl);
      
      // Track public_id for potential delete operations
      if (onPublicIdChange && uploaded.public_id) {
        console.log("📝 Tracking public_id:", uploaded.public_id);
        onPublicIdChange(uploaded.public_id);
      }
    } catch (error: any) {
      console.error("❌ Error uploading image:", error);
      alert(`Upload hình ảnh thất bại: ${error.message || 'Vui lòng thử lại.'}`);
      // Revert preview
      setPreviewImage(value || null);
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="col-span-2">
      <label className="block text-[1.3rem] font-[500] text-[#313131] mb-[6px]">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Upload box */}
      <div className="relative flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200 ease-in-out p-6">
        {/* Input file - hidden when has preview */}
        {!previewImage && (
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={uploading}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          />
        )}

        {/* Empty state */}
        {!previewImage && !uploading && (
          <div className="flex flex-col items-center text-gray-500 z-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 mb-2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6h.1a5 5 0 010 10H7z"
              />
            </svg>
            <p className="text-[14px] font-medium">Nhấn để chọn hình ảnh</p>
            <p className="text-[12px] text-gray-400 mt-1">PNG, JPG, JPEG (tối đa 5MB)</p>
          </div>
        )}

        {/* Uploading state */}
        {uploading && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-[14px] text-gray-600">Đang tải lên...</p>
          </div>
        )}

        {/* Preview state */}
        {previewImage && !uploading && (
          <div className="flex flex-col items-center">
            <img
              src={previewImage}
              alt="Preview"
              className="w-[220px] h-[160px] object-cover rounded-lg shadow-sm border"
            />
            <div className="mt-3 flex items-center gap-4">
              {/* Change image button */}
              <label className="text-[13px] text-blue-500 hover:underline cursor-pointer">
                Thay đổi hình ảnh
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              {/* Delete button */}
              {value && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange('');
                    setPreviewImage(null);
                    if (onPublicIdChange) {
                      onPublicIdChange('');
                    }
                  }}
                  className="text-[13px] text-red-500 hover:underline cursor-pointer"
                >
                  Xóa hình ảnh
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-red-500 text-[13px] mt-[6px]">{error}</p>
      )}
    </div>
  );
};

