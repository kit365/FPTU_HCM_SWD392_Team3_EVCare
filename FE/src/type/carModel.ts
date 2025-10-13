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

export interface CarProfile {
  carId: number;
  carName: string;
  licensePlate: string;
  carType: string;
}