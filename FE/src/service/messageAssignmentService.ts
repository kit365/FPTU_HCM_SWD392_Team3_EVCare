import { apiClient } from "./api";
import type { ApiResponse } from "../types/api";
import type {
  MessageAssignmentResponse,
  MessageAssignmentRequest,
  PageResponse,
} from "../types/message.types";
import type { UserResponse } from "../types/admin/user";

const API_BASE = "/message-assignments";

export const messageAssignmentService = {
  /**
   * Phân công customer cho staff (Admin only)
   */
  assignCustomerToStaff: async (
    data: MessageAssignmentRequest,
    adminId: string
  ) => {
    const response = await apiClient.post<
      ApiResponse<MessageAssignmentResponse>
    >(`${API_BASE}`, data, {
      headers: {
        "user-id": adminId,
      },
    });
    return response;
  },

  /**
   * Lấy staff của customer
   */
  getAssignmentByCustomerId: async (customerId: string) => {
    const response = await apiClient.get<
      ApiResponse<MessageAssignmentResponse>
    >(`${API_BASE}/customer/${customerId}`);
    return response;
  },

  /**
   * Lấy customers của staff
   */
  getAssignmentsByStaffId: async (
    staffId: string,
    page: number = 0,
    pageSize: number = 20
  ) => {
    const response = await apiClient.get<
      ApiResponse<PageResponse<MessageAssignmentResponse>>
    >(`${API_BASE}/staff/${staffId}`, {
      params: { page, pageSize },
    });
    return response;
  },

  /**
   * Lấy tất cả assignments (Admin only)
   */
  getAllAssignments: async (page: number = 0, pageSize: number = 20) => {
    const response = await apiClient.get<
      ApiResponse<PageResponse<MessageAssignmentResponse>>
    >(`${API_BASE}`, {
      params: { page, pageSize },
    });
    return response;
  },

  /**
   * Lấy customers chưa được phân công
   */
  getUnassignedCustomers: async (page: number = 0, pageSize: number = 20) => {
    const response = await apiClient.get<
      ApiResponse<PageResponse<UserResponse>>
    >(`${API_BASE}/unassigned-customers`, {
      params: { page, pageSize },
    });
    return response;
  },

  /**
   * Hủy assignment
   */
  deactivateAssignment: async (assignmentId: string, adminId: string) => {
    const response = await apiClient.put<ApiResponse<string>>(
      `${API_BASE}/${assignmentId}/deactivate`,
      {},
      {
        headers: {
          "user-id": adminId,
        },
      }
    );
    return response;
  },

  /**
   * Reassign customer
   */
  reassignCustomer: async (
    customerId: string,
    newStaffId: string,
    adminId: string
  ) => {
    const response = await apiClient.put<
      ApiResponse<MessageAssignmentResponse>
    >(
      `${API_BASE}/reassign`,
      {},
      {
        params: { customerId, newStaffId },
        headers: {
          "user-id": adminId,
        },
      }
    );
    return response;
  },

  /**
   * Tự động phân công staff cho customer (load balancing)
   */
  autoAssignStaff: async (customerId: string) => {
    const response = await apiClient.post<
      ApiResponse<MessageAssignmentResponse>
    >(`${API_BASE}/auto-assign/${customerId}`);
    return response;
  },
};

