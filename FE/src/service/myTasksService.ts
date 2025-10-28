
import type { ApiResponse } from "../types/api";
import type { MaintenanceManagementResponse } from "../types/maintenance-management.types";
import type { PageResponse } from "../types/message.types";
import { apiClient } from "./api";

const BASE_URL = "/maintenance-management/my-tasks";

export const myTasksService = {
  /**
   * Lấy danh sách công việc của technician hiện tại
   * @param date - Ngày cần lấy (format: yyyy-MM-dd), default = hôm nay
   * @param status - Lọc theo status (PENDING, IN_PROGRESS, COMPLETED)
   * @param page - Số trang
   * @param pageSize - Số lượng mỗi trang
   */
  getMyTasks: async (
    date?: string,
    status?: string,
    page: number = 0,
    pageSize: number = 100
  ): Promise<PageResponse<MaintenanceManagementResponse>> => {
    const params = new URLSearchParams();
    if (date) params.append("date", date);
    if (status) params.append("status", status);
    params.append("page", page.toString());
    params.append("pageSize", pageSize.toString());

    const response = await apiClient.get<ApiResponse<PageResponse<MaintenanceManagementResponse>>>(
      `${BASE_URL}?${params.toString()}`
    );
    return response.data.data;
  },
};

