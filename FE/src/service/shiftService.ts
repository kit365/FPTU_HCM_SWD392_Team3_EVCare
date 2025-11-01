import { apiClient } from "./api";
import type {
  ShiftResponse,
  CreationShiftRequest,
  UpdationShiftRequest,
  ShiftSearchRequest,
  AssignShiftRequest,
} from "../types/shift.types";
import type { PageResponse } from "../types/pageResponse.types";
import type { UserResponse } from "../types/user.types";

const SHIFT_BASE = "/shift";

export const shiftService = {
  // Get available technicians for time range
  getAvailableTechnicians: async (
    startTime: string,
    endTime: string,
    excludeShiftId?: string
  ) => {
    const params = new URLSearchParams({
      startTime,
      endTime,
      ...(excludeShiftId && { excludeShiftId }),
    });

    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: UserResponse[];
    }>(`${SHIFT_BASE}/available-technicians?${params.toString()}`);

    return response;
  },

  // Get all shift types
  getAllTypes: async () => {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: string[];
    }>(`${SHIFT_BASE}/types`);
    return response;
  },

  // Get all shift statuses
  getAllStatuses: async () => {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: string[];
    }>(`${SHIFT_BASE}/statuses`);
    return response;
  },

  // Get shift by ID
  getById: async (id: string) => {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: ShiftResponse;
    }>(`${SHIFT_BASE}/${id}`);
    return response;
  },

  // Search shifts
  search: async (params: ShiftSearchRequest) => {
    const queryParams = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      ...(params.keyword ? { keyword: params.keyword } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.shiftType ? { shiftType: params.shiftType } : {}),
      ...(params.fromDate ? { fromDate: params.fromDate } : {}),
      ...(params.toDate ? { toDate: params.toDate } : {}),
    }).toString();
    
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: PageResponse<ShiftResponse>;
    }>(`${SHIFT_BASE}/search?${queryParams}`);
    return response;
  },

  // Create shift
  create: async (data: CreationShiftRequest) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: string;
    }>(`${SHIFT_BASE}`, data);
    return response;
  },

  // Update shift
  update: async (id: string, data: UpdationShiftRequest) => {
    const response = await apiClient.put<{
      success: boolean;
      message: string;
    }>(`${SHIFT_BASE}/${id}`, data);
    return response;
  },

  // Update shift status (e.g., SCHEDULED → IN_PROGRESS)
  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
    }>(`${SHIFT_BASE}/status/${id}`, status, {
      headers: {
        'Content-Type': 'text/plain'
      }
    });
    return response;
  },

  // Delete shift
  delete: async (id: string) => {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
    }>(`${SHIFT_BASE}/${id}`);
    return response;
  },

  // Restore shift
  restore: async (id: string) => {
    const response = await apiClient.put<{
      success: boolean;
      message: string;
    }>(`${SHIFT_BASE}/restore/${id}`);
    return response;
  },

  // Assign shift (phân công ca làm việc)
  assign: async (id: string, data: AssignShiftRequest) => {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
    }>(`${SHIFT_BASE}/${id}/assign`, data);
    return response;
  },

  // Search shifts by Technician ID - CA LÀM CỦA TÔI
  searchByTechnician: async (technicianId: string, params: ShiftSearchRequest) => {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: PageResponse<ShiftResponse>;
    }>(`${SHIFT_BASE}/technician/search/${technicianId}`, { params });
    return response;
  },
};
