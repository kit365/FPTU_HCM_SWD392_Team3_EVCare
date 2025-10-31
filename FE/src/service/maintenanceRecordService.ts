import { apiClient } from "./api";
import type { ApiResponse } from "../types/api";

export interface UpdateMaintenanceRecordRequest {
  vehiclePartInventoryId: string;
  quantityUsed: number;
  approvedByUser: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateMaintenanceRecordRequest {
  vehiclePartInventoryId: string;
  quantityUsed: number;
  approvedByUser?: boolean;
}

export const maintenanceRecordService = {
  // Create maintenance record - POST /api/v1/maintenance-record/{maintenance_management_id}
  create: async (maintenanceManagementId: string, data: CreateMaintenanceRecordRequest) => {
    const response = await apiClient.post<ApiResponse<string>>(
      `/maintenance-record/${maintenanceManagementId}`,
      data
    );
    console.log("CREATE MAINTENANCE RECORD RESPONSE:", response);
    return response.data;
  },

  // Update maintenance record - PATCH /api/v1/maintenance-record/{id}
  update: async (id: string, data: UpdateMaintenanceRecordRequest) => {
    const response = await apiClient.patch<ApiResponse<string>>(
      `/maintenance-record/${id}`,
      data
    );
    console.log("UPDATE MAINTENANCE RECORD RESPONSE:", response);
    return response.data;
  },

  // Delete maintenance record - DELETE /api/v1/maintenance-record/{id}
  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<string>>(
      `/maintenance-record/${id}`
    );
    console.log("DELETE MAINTENANCE RECORD RESPONSE:", response);
    return response.data;
  },

  // Approve maintenance record - PATCH /api/v1/maintenance-record/{id} (với approvedByUser: true)
  approve: async (id: string, recordData: UpdateMaintenanceRecordRequest) => {
    const response = await apiClient.patch<ApiResponse<string>>(
      `/maintenance-record/${id}`,
      {
        ...recordData,
        approvedByUser: true,
      }
    );
    console.log("APPROVE MAINTENANCE RECORD RESPONSE:", response);
    return response.data;
  },
};

