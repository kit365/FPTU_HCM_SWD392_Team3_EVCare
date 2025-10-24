// Vehicle Part Types based on backend DTOs

// Enums
export const VehiclePartStatusEnum = {
  AVAILABLE: 'AVAILABLE',
  LOW_STOCK: 'LOW_STOCK',
  OUT_OF_STOCK: 'OUT_OF_STOCK'
} as const;

export type VehiclePartStatusEnum = typeof VehiclePartStatusEnum[keyof typeof VehiclePartStatusEnum];

// Request Types
export interface CreationVehiclePartRequest {
  vehiclePartName: string;
  currentQuantity: number;
  minStock: number;
  unitPrice: number;
  status: VehiclePartStatusEnum;
  averageLifespan: number;
  note?: string;
  vehicleTypeId: string;
  vehiclePartCategoryId: string;
}

export interface UpdationVehiclePartRequest {
  vehiclePartName: string;
  currentQuantity: number;
  minStock: number;
  unitPrice: number;
  status: VehiclePartStatusEnum;
  averageLifespan: number;
  note?: string;
  vehiclePartCategoryId: string;
  isActive: boolean;
  isDeleted: boolean;
  createdBy: string;
  updatedBy: string;
}

// Response Types
export interface VehiclePartResponse {
  vehiclePartId: string;
  vehiclePartName: string;
  vehicleType: {
    vehicleTypeId: string;
    vehicleTypeName: string;
    manufacturer: string;
    modelYear: number;
    batteryCapacity: number;
    maintenanceIntervalKm: number;
    maintenanceIntervalMonths: number;
    description: string;
    isDeleted: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
  };
  vehiclePartCategory: {
    vehiclePartCategoryId: string;
    partCategoryName: string;
    description?: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
  };
  currentQuantity: number;
  minStock: number;
  unitPrice: number;
  lastRestockDate?: string;
  averageLifespan: number;
  status: VehiclePartStatusEnum;
  note?: string;
  isDeleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// API Response Types
export interface VehiclePartApiResponse {
  success: boolean;
  message: string;
  data: VehiclePartResponse;
  timestamp: string;
  errorCode?: string;
}

export interface VehiclePartListApiResponse {
  success: boolean;
  message: string;
  data: {
    data: VehiclePartResponse[];
    totalPages: number;
    totalElements: number;
  };
  timestamp: string;
  errorCode?: string;
}

// Search Request
export interface VehiclePartSearchRequest {
  page: number;
  pageSize: number;
  keyword?: string;
  vehicleTypeId?: string;
  vehiclePartCategoryId?: string;
  status?: VehiclePartStatusEnum;
}