import React, { useState, useEffect } from 'react';
import { messageService } from '../../service/messageService';
import type { MessageResponse } from '../../types/message.types';
import { notify } from '../admin/common/Toast';
interface MessageListProps {
  userId: string;
  onSelectConversation: (otherUserId: string, otherUserName: string) => void;
}
interface Conversation {
  otherUserId: string;
  otherUserName: string;
  lastMessage?: MessageResponse;
  unreadCount: number;
}
export function MessageList({ userId, onSelectConversation }: MessageListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadConversations();
  }, [userId]);
  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await messageService.getAllMessages(userId, 0, 100);
      if (response?.data?.success && response?.data?.data?.content) {
        // Group messages by conversation
        const messagesByUser = new Map<string, Conversation>();
        response.data.data.content.forEach((msg: MessageResponse) => {
          const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
          const otherUserName = msg.senderId === userId ? msg.receiverName : msg.senderName;
          if (!messagesByUser.has(otherUserId)) {
            messagesByUser.set(otherUserId, {
              otherUserId,
              otherUserName,
              lastMessage: msg,
              unreadCount: msg.receiverId === userId ? 1 : 0
            });
          } else {
            const conv = messagesByUser.get(otherUserId)!;
            // Update if this is a newer message
            if (new Date(msg.sentAt) > new Date(conv.lastMessage?.sentAt || '')) {
              conv.lastMessage = msg;
            }
            // Count unread
            if (msg.receiverId === userId && !msg.isRead) {
              conv.unreadCount++;
            }
          }
        });
        setConversations(Array.from(messagesByUser.values()));
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      notify.error('Không thể tải danh sách cuộc trò chuyện');
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }
  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Chưa có cuộc trò chuyện nào</div>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {conversations.map((conv) => (
        <div
          key={conv.otherUserId}
          onClick={() => onSelectConversation(conv.otherUserId, conv.otherUserName)}
          className="p-4 cursor-pointer hover:bg-gray-100 border-b border-gray-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-semibold text-gray-900">
                {conv.otherUserName}
              </div>
              {conv.lastMessage && (
                <div className="text-sm text-gray-600 mt-1 truncate">
                  {conv.lastMessage.content}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end ml-2">
              {conv.lastMessage && (
                <div className="text-xs text-gray-500">
                  {new Date(conv.lastMessage.sentAt).toLocaleTimeString()}
                </div>
              )}
              {conv.unreadCount > 0 && (
                <div className="mt-1 bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {conv.unreadCount}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
