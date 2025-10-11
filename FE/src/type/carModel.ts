//tạo request và response
import type { VehicleListData } from "../types/admin/car.types";
export interface GetVehicleTypeListRequest {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

export interface VehicleListResponse {
  success: boolean;
  message: string;
  data: VehicleListData;
  timestamp: string;
  errorCode: string;
}

export interface CreateVehicleTypeRequest {
  vehicleTypeName: string;
  manufacturer: string;
  modelYear: number;
  batteryCapacity: number;
  maintenanceIntervalKm: number;
  maintenanceIntervalMonths: number;
  description: string;
}

export interface CreateVehicleTypeResponse {
  success: boolean;
  message: string;
  data?: any;
  timestamp: string;
  errorCode: string;
}

export interface VehicleDetailResponse {
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
}
;

export interface UpdateVehicleTypeRequest {
  vehicleTypeName: string;
  manufacturer: string;
  modelYear: number;
  batteryCapacity: number;
  maintenanceIntervalKm: number;
  maintenanceIntervalMonths: number;
  description: string;
  isActive: boolean;
}



