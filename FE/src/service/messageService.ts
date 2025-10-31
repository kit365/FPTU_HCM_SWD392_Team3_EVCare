import { apiClient } from "./api";
import type { ApiResponse } from "../types/api";
import type {
  MessageResponse,
  CreationMessageRequest,
  PageResponse,
} from "../types/message.types";

const API_BASE = "/messages";

export const messageService = {
  /**
   * Gửi tin nhắn (REST API - fallback)
   */
  sendMessage: async (data: CreationMessageRequest, userId: string) => {
    const response = await apiClient.post<ApiResponse<MessageResponse>>(
      `${API_BASE}/send`,
      data,
      {
        headers: {
          "user-id": userId,
        },
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
          "user-id": userId,
        },
      }
    );
    return response;
  },

  /**
   * Lấy cuộc trò chuyện
   */
  getConversation: async (
    otherUserId: string,
    userId: string,
    page: number = 0,
    pageSize: number = 50
  ) => {
    const response = await apiClient.get<
      ApiResponse<PageResponse<MessageResponse>>
    >(`${API_BASE}/conversation/${otherUserId}`, {
      params: { page, pageSize },
      headers: {
        "user-id": userId,
      },
    });
    return response;
  },

  /**
   * Đánh dấu conversation đã đọc
   */
  markConversationAsRead: async (otherUserId: string, userId: string) => {
    const response = await apiClient.put<ApiResponse<number>>(
      `${API_BASE}/conversation/${otherUserId}/mark-read`,
      {},
      {
        headers: {
          "user-id": userId,
        },
      }
    );
    return response;
  },

  /**
   * Đếm tin nhắn chưa đọc
   */
  getUnreadCount: async (userId: string) => {
    const response = await apiClient.get<ApiResponse<number>>(
      `${API_BASE}/unread-count`,
      {
        headers: {
          "user-id": userId,
        },
      }
    );
    return response;
  },

  /**
   * Lấy danh sách conversations
   */
  getRecentConversations: async (
    userId: string,
    page: number = 0,
    pageSize: number = 20
  ) => {
    const response = await apiClient.get<
      ApiResponse<PageResponse<MessageResponse>>
    >(`${API_BASE}/conversations`, {
      params: { page, pageSize },
      headers: {
        "user-id": userId,
      },
    });
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
          "user-id": userId,
        },
      }
    );
    return response;
  },
};

