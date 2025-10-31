// Notification Type Enum
export const NotificationTypeEnum = {
  REMINDER: "REMINDER",
  ALERT: "ALERT",
  UPDATE: "UPDATE",
  SYSTEM: "SYSTEM"
} as const;

export type NotificationTypeEnum = typeof NotificationTypeEnum[keyof typeof NotificationTypeEnum];

// Notification Response from API
export interface NotificationResponse {
  notificationId: string;
  userId: string;
  appointmentId?: string;
  messageId?: string;
  maintenanceManagementId?: string;
  invoiceId?: string;
  notificationType: NotificationTypeEnum;
  title: string;
  content: string;
  isRead: boolean;
  sentAt: string;
}

// WebSocket Notification DTO (from backend)
export interface WebSocketNotification {
  notificationId: string;
  title: string;
  content: string;
  notificationType: string; // "REMINDER" | "ALERT" | "UPDATE" | "SYSTEM"
  unreadCount: number;
  sentAt: string;
  appointmentId?: string;
  messageId?: string;
  maintenanceManagementId?: string;
  invoiceId?: string;
}

// Creation Notification Request (optional, for creating notifications from FE)
export interface CreationNotificationRequest {
  userId: string;
  appointmentId?: string;
  messageId?: string;
  maintenanceManagementId?: string;
  invoiceId?: string;
  notificationType: NotificationTypeEnum;
  title: string;
  content: string;
}

