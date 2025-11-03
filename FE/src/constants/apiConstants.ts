const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
export const API_BASE_URL = `${BACKEND_URL}/api/v1`;

// Cloudinary configuration
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dxyuuul0q";
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "maika_xinh_dep";
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;