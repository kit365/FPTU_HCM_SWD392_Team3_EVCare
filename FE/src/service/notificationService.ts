import { API_BASE_URL } from "../constants/apiConstants";
import type { ApiResponse } from "../types/api";
import type {
  NotificationResponse,
  CreationNotificationRequest
} from "../types/notification.types";
import type { PageResponse } from "../types/message.types";
import { apiClient } from "./api";

const API_BASE = `${API_BASE_URL}/notifications`;

export const notificationService = {
  /**
   * Tạo thông báo mới
   */
  createNotification: async (data: CreationNotificationRequest) => {
    const response = await apiClient.post<ApiResponse<NotificationResponse>>(
      `${API_BASE}`,
      data,
      {
        headers: {
          "user-id": data.userId
        }
      }
    );
    return response;
  },

  /**
   * Lấy chi tiết thông báo
   */
  getNotification: async (notificationId: string, userId: string) => {
    const response = await apiClient.get<ApiResponse<NotificationResponse>>(
      `${API_BASE}/${notificationId}`,
      {
        headers: {
          "user-id": userId
        }
      }
    );
    return response;
  },

  /**
   * Lấy tất cả thông báo của user
   */
  getAllNotifications: async (
    userId: string,
    page: number = 0,
    pageSize: number = 20
  ) => {
    const response = await apiClient.get<ApiResponse<PageResponse<NotificationResponse>>>(
      `${API_BASE}`,
      {
        params: {
          page,
          pageSize
        },
        headers: {
          "user-id": userId
        }
      }
    );
    return response;
  },

  /**
   * Lấy thông báo chưa đọc
   */
  getUnreadNotifications: async (
    userId: string,
    page: number = 0,
    pageSize: number = 20
  ) => {
    const response = await apiClient.get<ApiResponse<PageResponse<NotificationResponse>>>(
      `${API_BASE}/unread`,
      {
        params: {
          page,
          pageSize
        },
        headers: {
          "user-id": userId
        }
      }
    );
    return response;
  },

  /**
   * Lấy số thông báo chưa đọc
   */
  getUnreadCount: async (userId: string) => {
    const response = await apiClient.get<ApiResponse<number>>(
      `${API_BASE}/unread-count`,
      {
        headers: {
          "user-id": userId
        }
      }
    );
    return response;
  },

  /**
   * Đánh dấu thông báo đã đọc
   */
  markAsRead: async (notificationId: string, userId: string) => {
    const response = await apiClient.put<ApiResponse<NotificationResponse>>(
      `${API_BASE}/${notificationId}/mark-read`,
      {},
      {
        headers: {
          "user-id": userId
        }
      }
    );
    return response;
  },

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  markAllAsRead: async (userId: string) => {
    const response = await apiClient.put<ApiResponse<string>>(
      `${API_BASE}/mark-all-read`,
      {},
      {
        headers: {
          "user-id": userId
        }
      }
    );
    return response;
  },

  /**
   * Xóa thông báo
   */
  deleteNotification: async (notificationId: string, userId: string) => {
    const response = await apiClient.delete<ApiResponse<string>>(
      `${API_BASE}/${notificationId}`,
      {
        headers: {
          "user-id": userId
        }
      }
    );
    return response;
  }
};

