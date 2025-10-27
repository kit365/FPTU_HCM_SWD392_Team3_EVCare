// ServiceType Types - matching with BE DTOs

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

export interface CreationServiceTypeRequest {
  serviceName: string;
  description?: string;
  parentId?: string;
  vehicleTypeId: string;
}

export interface UpdationServiceTypeRequest {
  serviceName: string;
  description?: string;
  isActive?: string;
  isDeleted?: boolean;
  createdBy?: string;
  updatedBy?: string;
}

// Import existing types that are referenced
import type { VehicleTypeResponse } from './service-type-vehicle-part.types';
import type { ServiceTypeVehiclePartResponse } from './service-type-vehicle-part.types';
