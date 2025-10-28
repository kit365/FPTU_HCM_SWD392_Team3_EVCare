// Message Status Enum
export enum MessageStatusEnum {
  SENT = "SENT",
  DELIVERED = "DELIVERED",
  FAILED = "FAILED"
}
// Message Response
export interface MessageResponse {
  messageId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  isRead: boolean;
  sentAt: string;
  status: MessageStatusEnum;
  attachmentUrl?: string;
}
// Creation Message Request
export interface CreationMessageRequest {
  receiverId: string;
  content: string;
  attachmentUrl?: string;
}
// Conversation with user
export interface ConversationUser {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isOnline?: boolean;
}
// Chat message (for UI)
export interface ChatMessage {
  id: string;
  messageId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  isRead: boolean;
  isOwn: boolean;
  attachmentUrl?: string;
  status?: MessageStatusEnum;
}
// WebSocket Message Request
export interface WebSocketMessageRequest {
  senderId: string;
  receiverId: string;
  content: string;
  attachmentUrl?: string;
}
// WebSocket Mark Read Request
export interface WebSocketMarkReadRequest {
  messageId: string;
  userId: string;
}
// Page Response
export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
