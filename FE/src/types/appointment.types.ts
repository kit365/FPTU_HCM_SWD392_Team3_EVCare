// Appointment Types based on backend DTOs

// Warranty Eligibility Types
export interface CheckWarrantyEligibilityRequest {
  customerId?: string;
  customerEmail?: string;
  customerPhoneNumber?: string;
  customerFullName?: string;
}

export interface WarrantyAppointmentSummary {
  appointmentId: string;
  customerFullName: string;
  customerEmail: string;
  customerPhoneNumber: string;
  vehicleNumberPlate: string;
  scheduledAt: string;
  serviceNames: string[];
}

export interface WarrantyEligibilityResponse {
  hasWarrantyEligibleAppointments: boolean;
  totalWarrantyEligibleAppointments: number;
  warrantyAppointments: WarrantyAppointmentSummary[];
}

export interface WarrantyEligibilityApiResponse {
  success: boolean;
  message: string;
  data: WarrantyEligibilityResponse;
}

// Enums
export const AppointmentStatusEnum = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

export type AppointmentStatusEnum = typeof AppointmentStatusEnum[keyof typeof AppointmentStatusEnum];

export const ServiceModeEnum = {
  STATIONARY: 'STATIONARY',
  MOBILE: 'MOBILE'
} as const;

export type ServiceModeEnum = typeof ServiceModeEnum[keyof typeof ServiceModeEnum];

// Common types
export interface UserResponse {
  userId: string;
  username: string;
  email: string;
  address: string;
  fullName: string;
  numberPhone: string;
  avatarUrl: string;
  technicianSkills: string;
  isActive: boolean;
  lastLogin: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  roleName: string[];
}

export interface VehicleTypeResponse {
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

export interface VehiclePartCategoryResponse {
  vehiclePartCategoryId: string;
  partCategoryName: string;
  description: string;
  isDeleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface VehiclePartResponse {
  vehiclePartId: string;
  vehiclePartName: string;
  vehicleType: VehicleTypeResponse;
  vehiclePartCategory: VehiclePartCategoryResponse;
  currentQuantity: number;
  minStock: number;
  unitPrice: number;
  lastRestockDate: string;
  averageLifespan: number;
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'LOW_STOCK';
  note: string;
  isDeleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface ServiceTypeVehiclePartResponse {
  serviceTypeVehiclePartId: string;
  serviceType: string;
  vehiclePart: VehiclePartResponse;
  requiredQuantity: number;
  estimatedTimeDefault: number;
  isDeleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface ServiceTypeResponse {
  serviceTypeId: string;
  serviceName: string;
  description: string;
  parentId: string;
  vehicleTypeResponse: VehicleTypeResponse;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  children: string[];
  serviceTypeVehiclePartResponses: ServiceTypeVehiclePartResponse[];
}

// Appointment Response
export interface AppointmentResponse {
  appointmentId: string;
  customer: UserResponse;
  customerFullName: string;
  customerPhoneNumber: string;
  customerEmail: string;
  assignee: UserResponse;
  serviceMode: ServiceModeEnum;
  status: AppointmentStatusEnum;
  vehicleTypeResponse: VehicleTypeResponse;
  vehicleNumberPlate: string;
  vehicleKmDistances: string;
  userAddress: string;
  scheduledAt: string;
  quotePrice: number;
  notes: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  technicianResponses: UserResponse[];
  serviceTypeResponses: ServiceTypeResponse[];
  isWarrantyAppointment?: boolean;
  originalAppointment?: AppointmentResponse; // Nested appointment gốc nếu đây là appointment bảo hành
}

// Search Request
export interface AppointmentSearchRequest {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: string;
  serviceMode?: string;
  fromDate?: string;
  toDate?: string;
}

// API Response Types
export interface AppointmentApiResponse {
  success: boolean;
  message: string;
  data: AppointmentResponse;
  timestamp: string;
  errorCode?: string;
}

export interface AppointmentListApiResponse {
  success: boolean;
  message: string;
  data: {
    data: AppointmentResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
  timestamp: string;
  errorCode?: string;
}


