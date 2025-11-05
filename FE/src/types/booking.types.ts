// Types for Service Booking APIs

// Vehicle Type Response
export interface VehicleType {
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
  createdBy?: string;
  updatedBy?: string;
}

export interface VehicleTypeListData {
  data: VehicleType[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface VehicleTypeResponse {
  success: boolean;
  message: string;
  data: VehicleTypeListData;
  timestamp: string;
  errorCode?: string;
}

// Service Type Response
export interface VehiclePartCategory {
  vehiclePartCategoryId: string;
  partCategoryName: string;
  description: string;
  isDeleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface VehiclePart {
  vehiclePartId: string;
  vehiclePartName: string;
  vehicleType: VehicleType;
  vehiclePartCategory: VehiclePartCategory;
  currentQuantity: number;
  minStock: number;
  unitPrice: number;
  lastRestockDate: string;
  averageLifespan: number;
  status: "AVAILABLE" | "OUT_OF_STOCK" | "LOW_STOCK";
  note: string;
  isDeleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ServiceTypeVehiclePart {
  serviceTypeVehiclePartId: string;
  serviceType: string;
  vehiclePart: VehiclePart;
  requiredQuantity: number;
  estimatedTimeDefault: number;
  isDeleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ServiceType {
  serviceTypeId: string;
  serviceName: string;
  description: string;
  estimatedDurationMinutes: number;
  parentId: string | null;
  vehicleTypeResponse: VehicleType;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  children: ServiceType[];
  serviceTypeVehiclePartResponses: ServiceTypeVehiclePart[];
}

export interface ServiceTypeListData {
  data: ServiceType[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ServiceTypeResponse {
  success: boolean;
  message: string;
  data: ServiceTypeListData;
  timestamp: string;
  errorCode?: string;
}

// Request params
export interface GetVehicleTypeParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

export interface GetServiceTypeParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

// Service Mode Response
export interface ServiceModeResponse {
  success: boolean;
  message: string;
  data: string[];
  timestamp: string;
  errorCode?: string;
}

// Create Appointment Request
export interface CreateAppointmentRequest {
  customerId?: string;
  customerFullName: string;
  customerPhoneNumber?: string; 
  customerEmail: string;
  vehicleTypeId: string;
  vehicleNumberPlate: string;
  vehicleKmDistances?: string;
  userAddress?: string;
  serviceMode: string;
  scheduledAt: string;
  notes?: string;
  serviceTypeIds: string[];
  isWarrantyAppointment?: boolean;
}

// Create Appointment Response
export interface CreateAppointmentResponse {
  success: boolean;
  message: string;
  data?: string;
  timestamp: string;
  errorCode?: string;
}

// User Response
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
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  roleName: string[];
}

// User Appointment Response
export interface UserAppointment {
  appointmentId: string;
  customer: UserResponse;
  customerFullName: string;
  customerPhoneNumber: string;
  customerEmail: string;
  assignee: UserResponse;
  serviceMode: "STATIONARY" | "MOBILE";
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "PENDING_PAYMENT" | "COMPLETED" | "CANCELLED";
  vehicleTypeResponse: VehicleType;
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
  serviceTypeResponses: ServiceType[];
  isWarrantyAppointment?: boolean;
}

export interface UserAppointmentListData {
  data: UserAppointment[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface UserAppointmentResponse {
  success: boolean;
  message: string;
  data: UserAppointmentListData;
  timestamp: string;
  errorCode?: string;
}
