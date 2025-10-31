export interface MessageResponse {
  messageId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string;
  receiverId: string;
  receiverName: string;
  receiverAvatarUrl?: string;
  content: string;
  imageUrl?: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
}

export interface MessageAssignmentResponse {
  assignmentId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAvatarUrl?: string;
  customerIsActive?: boolean; // Trạng thái online/offline của customer
  assignedStaffId: string;
  assignedStaffName: string;
  assignedStaffEmail: string;
  assignedStaffAvatarUrl?: string;
  assignedStaffIsActive?: boolean; // Trạng thái online/offline của staff
  assignedByName: string;
  assignedAt: string;
  isActive: boolean;
  notes?: string;
  unreadMessageCount?: number;
  lastMessageAt?: string;
}

export interface CreationMessageRequest {
  senderId?: string;
  receiverId: string;
  content: string;
  imageUrl?: string;
}

export interface MessageAssignmentRequest {
  customerId: string;
  staffId: string;
  notes?: string;
}

export interface WebSocketMessageRequest {
  senderId: string;
  receiverId: string;
  content: string;
  imageUrl?: string;
}

export interface PageResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

