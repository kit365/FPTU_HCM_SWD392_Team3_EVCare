import { useState, useEffect, useCallback } from 'react';
import { MessageOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useWebSocket } from '../../../hooks/useWebSocket';
import type { MessageResponse } from '../../../types/message.types';
import { messageService } from '../../../service/messageService';
import { notify } from '../../../components/admin/common/Toast';
import { useAuthContext } from '../../../context/useAuthContext';
import { ChatWindowWithWebSocket } from '../../../components/message/ChatWindowWithWebSocket';

interface Conversation {
  otherUserId: string;
  otherUserName: string;
  lastMessage?: MessageResponse;
  unreadCount: number;
}

export function AdminMessagePage() {
  const { user } = useAuthContext();
  const userId = user?.userId || '';
  const [selectedOtherUserId, setSelectedOtherUserId] = useState<string>('');
  const [selectedOtherUserName, setSelectedOtherUserName] = useState<string>('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestMessage, setLatestMessage] = useState<MessageResponse | null>(null);

  // Create stable callbacks using useCallback
  const handleWebSocketMessage = useCallback((message: MessageResponse) => {
    
    // Set latest message to trigger ChatWindow update
    setLatestMessage(message);
    
    // Update conversations list immediately WITHOUT reload
    setConversations(prev => {
        const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
        const otherUserName = message.senderId === userId ? message.receiverName : message.senderName;
        
        // Check if conversation already exists
        const existingIndex = prev.findIndex(c => c.otherUserId === otherUserId);
        
        if (existingIndex >= 0) {
          // Update existing conversation
          const updated = [...prev];
          const conv = updated[existingIndex];
          
          // Update last message if this is newer
          if (!conv.lastMessage || new Date(message.sentAt) > new Date(conv.lastMessage.sentAt)) {
            conv.lastMessage = message;
          }
          
          // Update unread count
          if (message.receiverId === userId && !message.isRead) {
            conv.unreadCount++;
          }
          
          // Move to top
          updated.splice(existingIndex, 1);
          updated.unshift(conv);
          
          return updated;
        } else {
          // Add new conversation
          const newConv: Conversation = {
            otherUserId,
            otherUserName,
            lastMessage: message,
            unreadCount: message.receiverId === userId && !message.isRead ? 1 : 0
          };
          
          return [newConv, ...prev];
        }
      });
      
    // Show notification for new message
    if (message.senderId !== userId) {
      notify.info(`Tin nhắn mới từ ${message.senderName}`);
    }
  }, [userId, selectedOtherUserId]);
  
  const handleUnreadCountUpdate = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);
  
  const handleConnected = useCallback(() => {
  }, []);
  
  const handleDisconnected = useCallback(() => {
  }, []);
  
  const handleWebSocketError = useCallback((error: string) => {
    console.error('WebSocket error:', error);
  }, []);

  // WebSocket connection
  const { markAsRead, sendMessage, isConnected } = useWebSocket({
    userId,
    onMessage: handleWebSocketMessage,
    onUnreadCountUpdate: handleUnreadCountUpdate,
    onConnected: handleConnected,
    onDisconnected: handleDisconnected,
    onError: handleWebSocketError
  });

  useEffect(() => {
    if (userId) {
      loadConversations();
      loadUnreadCount();
    }
    // Cleanup function is not needed for this case
  }, [userId]);

  // Load conversations from localStorage on mount if userId is the same
  useEffect(() => {
    if (userId) {
      const storedConversations = localStorage.getItem(`conversations_${userId}`);
      if (storedConversations) {
        try {
          const parsed = JSON.parse(storedConversations);
          setConversations(parsed);
          setLoading(false);
          console.log('📦 Restored conversations from localStorage:', parsed.length);
        } catch (error) {
          console.error('Error parsing stored conversations:', error);
        }
      }
    }
  }, []); // Only run once on mount

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (userId && conversations.length > 0) {
      localStorage.setItem(`conversations_${userId}`, JSON.stringify(conversations));
      console.log('💾 Saved conversations to localStorage:', conversations.length);
    }
  }, [conversations, userId]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await messageService.getAllMessages(userId, 0, 100);
      console.log('📦 Load Conversations Response:', response);
      console.log('📦 Data structure:', response?.data);
      
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
        
        console.log('📨 Messages array:', messages);
        console.log('📨 Messages count:', messages.length);
        
        if (messages && messages.length > 0) {
          const messagesByUser = new Map<string, Conversation>();
          messages.forEach((msg: MessageResponse) => {
            const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
            const otherUserName = msg.senderId === userId ? msg.receiverName : msg.senderName;
            
            console.log('Processing message:', { otherUserId, otherUserName, msg });
            
            if (!messagesByUser.has(otherUserId)) {
              messagesByUser.set(otherUserId, {
                otherUserId,
                otherUserName,
                lastMessage: msg,
                unreadCount: 0
              });
            } else {
              const conv = messagesByUser.get(otherUserId)!;
              if (new Date(msg.sentAt) > new Date(conv.lastMessage?.sentAt || '')) {
                conv.lastMessage = msg;
              }
              if (msg.receiverId === userId && !msg.isRead) {
                conv.unreadCount++;
              }
            }
          });
          
          const sortedConversations = Array.from(messagesByUser.values())
            .sort((a, b) => {
              const timeA = new Date(a.lastMessage?.sentAt || 0).getTime();
              const timeB = new Date(b.lastMessage?.sentAt || 0).getTime();
              return timeB - timeA;
            });
          
          console.log('💬 Processed conversations:', sortedConversations);
          setConversations(sortedConversations);
        } else {
          console.log('No messages found');
          setConversations([]);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      notify.error('Không thể tải danh sách cuộc trò chuyện');
    } finally {
      setLoading(false);
    }
  };

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

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Vui lòng đăng nhập</div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-gray-50">
      {/* Sidebar - Messenger Style */}
      <div className={`border-r border-gray-200 bg-white flex flex-col ${selectedOtherUserId ? 'hidden lg:flex w-80' : 'flex w-full lg:w-96'}`}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">Tin nhắn</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-sm font-semibold rounded-full px-2.5 py-1">
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex flex-col p-3 space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-3 animate-pulse p-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <UserOutlined className="text-2xl text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">Chưa có cuộc trò chuyện</p>
                <p className="text-sm text-gray-400 mt-1">Các cuộc trò chuyện sẽ hiển thị ở đây</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-y-auto">
              {conversations.map((conv) => (
                <div
                  key={conv.otherUserId}
                  onClick={() => handleSelectConversation(conv.otherUserId, conv.otherUserName)}
                  className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${
                    selectedOtherUserId === conv.otherUserId
                      ? 'bg-blue-50 border-blue-500'
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        {conv.otherUserName.charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-0.5">
                        <div className="font-semibold text-gray-900 text-sm truncate">
                          {conv.otherUserName}
                        </div>
                        {conv.lastMessage && (
                          <div className="text-xs text-gray-400 ml-2 flex-shrink-0">
                            {new Date(conv.lastMessage.sentAt).toLocaleTimeString('vi-VN', { 
                              hour: '2-digit', 
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <div className="text-sm text-gray-600 truncate">
                          {conv.lastMessage.content}
                        </div>
                      )}
                      {conv.unreadCount > 0 && (
                        <div className="flex justify-end mt-1">
                          <span className="text-xs font-semibold bg-blue-500 text-white rounded-full px-2 py-0.5">
                            {conv.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      {selectedOtherUserId ? (
        <div className="flex-1 flex flex-col bg-gray-50 relative">
          <div className="absolute lg:hidden top-3 left-3 z-10">
            <button
              onClick={() => setSelectedOtherUserId('')}
              className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftOutlined className="text-gray-700" />
            </button>
          </div>
          <ChatWindowWithWebSocket
            currentUserId={userId}
            otherUserId={selectedOtherUserId}
            otherUserName={selectedOtherUserName}
            sendMessage={sendMessage}
            markAsRead={markAsRead}
            isConnected={isConnected}
            onWebSocketMessage={latestMessage}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center hidden lg:flex">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <MessageOutlined className="text-4xl text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-1">Chọn cuộc trò chuyện</h3>
            <p className="text-gray-500 text-sm">Chọn một khách hàng để xem tin nhắn</p>
          </div>
        </div>
      )}
    </div>
  );
}
