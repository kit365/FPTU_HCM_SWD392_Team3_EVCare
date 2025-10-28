import { API_BASE_URL } from "../constants/apiConstants";
import type { ApiResponse } from "../types/api";
import type {
  MessageResponse,
  CreationMessageRequest,
  PageResponse
} from "../types/message.types";
import type { UserResponse } from "../types/user.types";
import { apiClient } from "./api";
const API_BASE = `${API_BASE_URL}/messages`;
export const messageService = {
  /**
   * Gửi tin nhắn
   */
  sendMessage: async (senderId: string, data: CreationMessageRequest) => {
    const response = await apiClient.post<ApiResponse<MessageResponse>>(
      `${API_BASE}`,
      data,
      {
        headers: {
          "user-id": senderId
        }
      }
    );
    return response;
  },
  /**
   * Lấy chi tiết tin nhắn
   */
  getMessage: async (messageId: string, userId: string) => {
    const response = await apiClient.get<ApiResponse<MessageResponse>>(
      `${API_BASE}/${messageId}`,
      {
        headers: {
          "user-id": userId
        }
      }
    );
    return response;
  },
  /**
   * Lấy cuộc trò chuyện giữa 2 người dùng
   */
  getConversation: async (
    currentUserId: string,
    otherUserId: string,
    page: number = 0,
    pageSize: number = 50
  ) => {
    const response = await apiClient.get<ApiResponse<PageResponse<MessageResponse>>>(
      `${API_BASE}/conversation/${otherUserId}`,
      {
        params: {
          page,
          pageSize
        },
        headers: {
          "user-id": currentUserId
        }
      }
    );
    return response;
  },
  /**
   * Đánh dấu tin nhắn đã đọc
   */
  markMessageAsRead: async (messageId: string, userId: string) => {
    const response = await apiClient.put<ApiResponse<string>>(
      `${API_BASE}/${messageId}/read`,
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
   * Lấy số tin nhắn chưa đọc
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
   * Xóa tin nhắn
   */
  deleteMessage: async (messageId: string, userId: string) => {
    const response = await apiClient.delete<ApiResponse<string>>(
      `${API_BASE}/${messageId}`,
      {
        headers: {
          "user-id": userId
        }
      }
    );
    return response;
  },
  /**
   * Lấy tất cả tin nhắn
   */
  getAllMessages: async (userId: string, page: number = 0, pageSize: number = 20) => {
    const response = await apiClient.get<ApiResponse<PageResponse<MessageResponse>>>(
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
   * Lấy danh sách nhân viên có sẵn
   */
  getAvailableStaff: async () => {
    const response = await apiClient.get<ApiResponse<UserResponse[]>>(
      `${API_BASE}/staff/available`
    );
    return response;
  }
};
