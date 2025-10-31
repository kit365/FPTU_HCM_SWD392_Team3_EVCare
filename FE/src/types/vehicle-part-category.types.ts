// Vehicle Part Category Types
export interface VehiclePartCategoryResponse {
  vehiclePartCategoryId: string;
  partCategoryName: string;
  description?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CreationVehiclePartCategoryRequest {
  partCategoryName: string;
  description?: string;
}

export interface UpdationVehiclePartCategoryRequest {
  partCategoryName: string;
  description?: string;
  isActive: boolean;
}

export interface VehiclePartCategoryApiResponse {
  success: boolean;
  message: string;
  data: VehiclePartCategoryResponse;
  timestamp: string;
  errorCode?: string;
}

export interface VehiclePartCategoryListApiResponse {
  success: boolean;
  message: string;
  data: {
    data: VehiclePartCategoryResponse[];
    totalPages: number;
    totalElements: number;
  };
  timestamp: string;
  errorCode?: string;
}