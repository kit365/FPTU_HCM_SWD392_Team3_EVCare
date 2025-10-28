import { useState, useEffect, useCallback } from "react";
import { notificationService } from "../service/notificationService";
import type { NotificationResponse } from "../types/notification.types";

interface UseNotificationReturn {
  notifications: NotificationResponse[];
  unreadNotifications: NotificationResponse[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

/**
 * Custom hook để quản lý notifications
 */
export function useNotification(userId: string): UseNotificationReturn {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load tất cả notifications
   */
  const refreshNotifications = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await notificationService.getAllNotifications(userId);
      if (response.data.success && response.data.data) {
        setNotifications(response.data.data.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể tải danh sách thông báo");
      console.error("Error loading notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * Load unread notifications
   */
  const refreshUnreadNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await notificationService.getUnreadNotifications(userId);
      if (response.data.success && response.data.data) {
        setUnreadNotifications(response.data.data.data || []);
      }
    } catch (err: any) {
      console.error("Error loading unread notifications:", err);
    }
  }, [userId]);

  /**
   * Refresh unread count
   */
  const refreshUnreadCount = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await notificationService.getUnreadCount(userId);
      if (response.data.success) {
        setUnreadCount(response.data.data || 0);
      }
    } catch (err: any) {
      console.error("Error loading unread count:", err);
    }
  }, [userId]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userId) return;

    try {
      await notificationService.markAsRead(notificationId, userId);
      await refreshUnreadCount();
      await refreshNotifications();
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể đánh dấu đã đọc");
      console.error("Error marking as read:", err);
    }
  }, [userId, refreshUnreadCount, refreshNotifications]);

  /**
   * Mark all as read
   */
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      await notificationService.markAllAsRead(userId);
      await refreshUnreadCount();
      await refreshNotifications();
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể đánh dấu tất cả đã đọc");
      console.error("Error marking all as read:", err);
    }
  }, [userId, refreshUnreadCount, refreshNotifications]);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!userId) return;

    try {
      await notificationService.deleteNotification(notificationId, userId);
      await refreshNotifications();
      await refreshUnreadCount();
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể xóa thông báo");
      console.error("Error deleting notification:", err);
    }
  }, [userId, refreshNotifications, refreshUnreadCount]);

  // Load data on mount
  useEffect(() => {
    if (userId) {
      refreshNotifications();
      refreshUnreadCount();
    }
  }, [userId, refreshNotifications, refreshUnreadCount]);

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    isLoading,
    error,
    refreshNotifications,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
}

