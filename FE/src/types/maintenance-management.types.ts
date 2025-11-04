// Maintenance Management Types
export interface MaintenanceManagementResponse {
  maintenanceManagementId: string;
  appointmentResponse: any; // Can import AppointmentResponse if needed
  serviceTypeResponse: {
    serviceTypeId: string;
    serviceName: string;
    serviceDescription?: string;
  };
  startTime: string | null;
  endTime: string | null;
  totalCost: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string | null;
  maintenanceRecords: {
    data: MaintenanceRecordResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface MaintenanceRecordResponse {
  maintenanceRecordId: string;
  vehiclePartResponse: {
    vehiclePartId: string;
    vehiclePartName: string;
    unitPrice: number; // Changed from vehiclePartPrice
    quantity?: number;
    currentQuantity?: number; // Tồn kho hiện tại của phụ tùng
  };
  quantityUsed: number;
  approvedByUser: boolean; // Changed from isApprovedByUser
  notes?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateMaintenanceNotesRequest {
  id: string;
  notes: string;
}

export interface UpdateMaintenanceStatusRequest {
  id: string;
  status: string;
}

