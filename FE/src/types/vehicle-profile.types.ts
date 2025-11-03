import type { UserResponse } from "./user.types";
import type { VehicleTypeResponse } from "./vehicle-type.types";

// Vehicle Profile Response - dùng để hiển thị hồ sơ xe
export interface VehicleProfileResponse {
  vehicleId: string;
  user: UserResponse;
  vehicleType: VehicleTypeResponse;
  plateNumber: string;
  vin: string;
  currentKm: number;
  lastMaintenanceDate: string;
  lastMaintenanceKm: number;
  notes: string;
  phoneNumber: string;
  search: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// Creation Vehicle Profile Request - dùng khi tạo hồ sơ xe mới
export interface CreationVehicleProfileRequest {
  vehicleTypeId: string;
  userId: string;
  plateNumber: string;
  vin: string;
  currentKm?: number;
  lastMaintenanceDate?: string;
  lastMaintenanceKm?: number;
  notes?: string;
  phoneNumber?: string;
}

// Updation Vehicle Profile Request - dùng khi cập nhật hồ sơ xe
export interface UpdationVehicleProfileRequest {
  userId?: string;
  vehicleTypeId?: string;
  plateNumber?: string;
  vin?: string;
  currentKm?: number;
  lastMaintenanceDate?: string;
  lastMaintenanceKm?: number;
  notes?: string;
  phoneNumber?: string;
}

// Search params cho Vehicle Profile
export interface VehicleProfileSearchParams {
  keyword?: string;
  vehicleTypeId?: string;
  page: number;
  size: number;
}

