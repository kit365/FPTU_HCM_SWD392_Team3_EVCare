import React, { useState, useEffect } from 'react';
import { messageService } from '../../service/messageService';
import type { MessageResponse } from '../../types/message.types';
import { notify } from '../admin/common/Toast';
interface MessageListProps {
  userId: string;
  onSelectConversation: (otherUserId: string, otherUserName: string) => void;
  refreshTrigger?: number; // Trigger to refresh the list
}
interface Conversation {
  otherUserId: string;
  otherUserName: string;
  lastMessage?: MessageResponse;
  unreadCount: number;
}
export function MessageList({ userId, onSelectConversation, refreshTrigger }: MessageListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load from localStorage on mount
  useEffect(() => {
    if (userId) {
      const stored = localStorage.getItem(`conversations_${userId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setConversations(parsed);
          setLoading(false);
          console.log('📦 MessageList - Restored from localStorage:', parsed.length);
        } catch (error) {
          console.error('Error parsing stored conversations:', error);
        }
      }
    }
  }, [userId]);
  
  // Save to localStorage whenever conversations change
  useEffect(() => {
    if (userId && conversations.length > 0) {
      localStorage.setItem(`conversations_${userId}`, JSON.stringify(conversations));
      console.log('💾 MessageList - Saved to localStorage:', conversations.length);
    }
  }, [conversations, userId]);
  
  useEffect(() => {
    loadConversations();
  }, [userId, refreshTrigger]); // Add refreshTrigger to dependencies
  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await messageService.getAllMessages(userId, 0, 100);
      
      if (response?.data?.success) {
        // ApiResponse structure: { success, data: PageResponse<T> }
        // PageResponse structure: { data: MessageResponse[], page, size, totalElements, totalPages, last }
        const data = response.data.data;
        
        // Check if data is directly an array or wrapped in PageResponse
        let messages: MessageResponse[] = [];
        if (Array.isArray(data)) {
          messages = data;
        } else if (data?.data && Array.isArray(data.data)) {
          // PageResponse structure
          messages = data.data;
        }
        
        console.log('📨 MessageList - Loaded messages:', messages.length);
        
        // Group messages by conversation
        const messagesByUser = new Map<string, Conversation>();
        messages.forEach((msg: MessageResponse) => {
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
