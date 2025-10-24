// Service Type Vehicle Part Types
// Matching with BE DTOs

export interface ServiceTypeVehiclePartResponse {
  serviceTypeVehiclePartId: string;
  serviceType: ServiceTypeResponse;
  vehiclePart: VehiclePartResponse;
  requiredQuantity: number;
  estimatedTimeDefault: number;
  isDeleted?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreationServiceTypeVehiclePartRequest {
  serviceTypeId: string;
  vehiclePartId: string;
  requiredQuantity: number;
  estimatedTimeDefault: number;
}

export interface UpdationServiceTypeVehiclePartRequest {
  serviceTypeId: string;
  vehiclePartId: string;
  requiredQuantity: number;
  estimatedTimeDefault: number;
  isActive?: boolean;
  isDeleted?: boolean;
  createdBy?: string;
  updatedBy?: string;
}

// Related Response Types
export interface ServiceTypeResponse {
  serviceTypeId: string;
  serviceName: string;
  description?: string;
  parentId?: string;
  vehicleTypeResponse?: VehicleTypeResponse;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  children?: ServiceTypeResponse[];
  serviceTypeVehiclePartResponses?: ServiceTypeVehiclePartResponse[];
}

export interface VehiclePartResponse {
  vehiclePartId: string;
  vehiclePartName: string;
  vehicleType?: VehicleTypeResponse;
  vehiclePartCategory?: VehiclePartCategoryResponse;
  currentQuantity: number;
  minStock: number;
  unitPrice: number;
  lastRestockDate?: string;
  averageLifespan?: number;
  status: VehiclePartStatusEnum;
  note?: string;
  isDeleted?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface VehicleTypeResponse {
  vehicleTypeId: string;
  vehicleTypeName: string;
  manufacturer?: string;
  modelYear?: number;
  batteryCapacity?: number;
  maintenanceIntervalKm?: number;
  maintenanceIntervalMonths?: number;
  description?: string;
  isDeleted?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

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

// Enums
export const VehiclePartStatusEnum = {
  AVAILABLE: 'AVAILABLE',
  LOW_STOCK: 'LOW_STOCK',
  OUT_OF_STOCK: 'OUT_OF_STOCK'
} as const;

export type VehiclePartStatusEnum = typeof VehiclePartStatusEnum[keyof typeof VehiclePartStatusEnum];

// Form Types for UI
export interface ServiceTypeVehiclePartFormData {
  serviceTypeId: string;
  vehiclePartId: string;
  requiredQuantity: number;
  estimatedTimeDefault: number;
}

export interface ServiceTypeVehiclePartTableData extends ServiceTypeVehiclePartResponse {
  serviceTypeName?: string;
  vehiclePartName?: string;
  vehicleTypeName?: string;
  partCategoryName?: string;
}

// API Response Types
export interface ServiceTypeVehiclePartApiResponse {
  data: ServiceTypeVehiclePartResponse;
  message: string;
  status: number;
}

export interface ServiceTypeVehiclePartListApiResponse {
  data: ServiceTypeVehiclePartResponse[];
  message: string;
  status: number;
  totalElements?: number;
  totalPages?: number;
  currentPage?: number;
}
