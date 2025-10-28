import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { MessageList } from '../../components/message/MessageList';
import { ChatWindowWithWebSocket } from '../../components/message/ChatWindowWithWebSocket';
import type { MessageResponse } from '../../types/message.types';
import { messageService } from '../../service/messageService';
import { notify } from '../../components/admin/common/Toast';
import { useAuthContext } from '../../context/useAuthContext';
export function MessagePage() {
  const { user } = useAuthContext();
  const userId = user?.userId || '';
  const [selectedOtherUserId, setSelectedOtherUserId] = useState<string>('');
  const [selectedOtherUserName, setSelectedOtherUserName] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isWebSocketReady, setIsWebSocketReady] = useState(false);
  // WebSocket connection
  const { isConnected, error, sendMessage, markAsRead } = useWebSocket({
    userId,
    onMessage: (message: MessageResponse) => {
      console.log('New message received:', message);
      // Handle real-time message updates
      if (message.receiverId === userId) {
        // Mark as read if it's the current conversation
        if (message.senderId === selectedOtherUserId) {
          markAsRead({
            messageId: message.messageId,
            userId
          });
        }
      }
    },
    onUnreadCountUpdate: (count: number) => {
      setUnreadCount(count);
    },
    onConnected: () => {
      console.log('WebSocket connected');
      setIsWebSocketReady(true);
    },
    onDisconnected: () => {
      console.log('WebSocket disconnected');
      setIsWebSocketReady(false);
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
      notify.error('Lỗi kết nối WebSocket');
    }
  });
  useEffect(() => {
    loadUnreadCount();
  }, [userId]);
  const loadUnreadCount = async () => {
    try {
      const response = await messageService.getUnreadCount(userId);
      if (response?.data?.success) {
        setUnreadCount(response.data.data);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };
  const handleSelectConversation = (otherUserId: string, otherUserName: string) => {
    setSelectedOtherUserId(otherUserId);
    setSelectedOtherUserName(otherUserName);
  };
  const handleBack = () => {
    setSelectedOtherUserId('');
    setSelectedOtherUserName('');
  };
  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Vui lòng đăng nhập</div>
      </div>
    );
  }
  return (
    <div className="flex h-full w-full">
      {/* Sidebar with message list */}
      <div className={`w-80 border-r border-gray-300 bg-white flex flex-col ${selectedOtherUserId ? 'hidden md:flex' : 'flex'}`}>
        <div className="bg-blue-600 text-white p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Tin nhắn</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center mt-2 space-x-2">
            {isConnected ? (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs">Đã kết nối</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-xs">Đang kết nối...</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <MessageList userId={userId} onSelectConversation={handleSelectConversation} />
        </div>
      </div>
      {/* Chat window */}
      {selectedOtherUserId ? (
        <div className="flex-1 flex flex-col">
          <ChatWindowWithWebSocket
            currentUserId={userId}
            otherUserId={selectedOtherUserId}
            otherUserName={selectedOtherUserName}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-100 hidden md:flex">
          <div className="text-center text-gray-500">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="mt-4 text-lg">Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        </div>
      )}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
