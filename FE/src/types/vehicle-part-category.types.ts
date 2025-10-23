// Vehicle Part Category Types
// Matching with BE DTOs

export interface VehiclePartCategoryResponse {
  vehiclePartCategoryId: string;
  partCategoryName: string;
  description?: string;
  isDeleted?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreationVehiclePartCategoryRequest {
  partCategoryName: string;
  description?: string;
}

export interface UpdationVehiclePartCategoryRequest {
  partCategoryName: string;
  description?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdBy?: string;
  updatedBy?: string;
}

// Form Types for UI
export interface VehiclePartCategoryFormData {
  partCategoryName: string;
  description?: string;
}

export interface VehiclePartCategoryTableData extends VehiclePartCategoryResponse {
  // Additional fields for table display if needed
}

// API Response Types
export interface VehiclePartCategoryApiResponse {
  data: VehiclePartCategoryResponse;
  message: string;
  status: number;
}

export interface VehiclePartCategoryListApiResponse {
  data: VehiclePartCategoryResponse[];
  message: string;
  status: number;
  totalElements?: number;
  totalPages?: number;
  currentPage?: number;
}
