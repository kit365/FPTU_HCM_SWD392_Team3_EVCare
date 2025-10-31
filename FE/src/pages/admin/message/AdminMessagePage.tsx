import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { ChatWindow } from '../../../components/message/ChatWindow';
import type { MessageResponse, MessageAssignmentResponse } from '../../../types/message.types';
import { messageAssignmentService } from '../../../service/messageAssignmentService';
import { notify } from '../../../components/admin/common/Toast';
import { useAuthContext } from '../../../context/useAuthContext';
import { MessageOutlined } from '@ant-design/icons';

export const AdminMessagePage = () => {
  const { user } = useAuthContext();
  const userId = user?.userId || '';
  const [assignments, setAssignments] = useState<MessageAssignmentResponse[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [selectedUserAvatar, setSelectedUserAvatar] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [latestMessage, setLatestMessage] = useState<MessageResponse | null>(null);

  // Load assignments - memoized to prevent infinite loop
  const loadAssignments = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await messageAssignmentService.getAssignmentsByStaffId(userId, 0, 100);
      if (response?.data?.success) {
        const assignmentsData = response.data.data.data;
        console.log('📋 [AdminMessagePage] Loaded assignments:', assignmentsData);
        console.log('📋 [AdminMessagePage] First assignment customerId:', assignmentsData[0]?.customerId);
        setAssignments(assignmentsData);
      }
    } catch (error: any) {
      console.error('Error loading assignments:', error);
      notify.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // WebSocket connection
  const { isConnected, sendMessage } = useWebSocket({
    userId,
    onMessage: (message: MessageResponse) => {
      console.log('========================================');
      console.log('📨 [AdminMessagePage] CALLBACK TRIGGERED!');
      console.log('📨 [AdminMessagePage] Received message:', message);
      console.log('📨 [AdminMessagePage] Message details:', {
        messageId: message.messageId,
        from: message.senderId,
        to: message.receiverId,
        content: message.content,
        currentUserId: userId,
        timestamp: Date.now()
      });
      console.log('📨 [AdminMessagePage] About to call setLatestMessage...');
      
      // Set latest message (will trigger ChatWindow update)
      setLatestMessage(message);
      
      console.log('✅ [AdminMessagePage] setLatestMessage called');
      console.log('📨 [AdminMessagePage] About to loadAssignments...');
      
      // Refresh assignments to update unread count
      loadAssignments();
      
      console.log('✅ [AdminMessagePage] Callback completed!');
      console.log('========================================');
    },
    onConnect: () => {
      console.log('✅ WebSocket connected for userId:', userId);
    },
    onDisconnect: () => {
      console.log('❌ WebSocket disconnected');
    },
    onError: (error: string) => {
      console.error('❌ WebSocket error:', error);
      notify.error('Lỗi kết nối WebSocket');
    },
  });

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const handleSelectConversation = (customerId: string, customerName: string, customerAvatar?: string) => {
    console.log('👤 [AdminMessagePage] Selected conversation:', {
      customerId,
      customerName,
      isUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(customerId)
    });
    setSelectedUserId(customerId);
    setSelectedUserName(customerName);
    setSelectedUserAvatar(customerAvatar || '');
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500 text-center">
          <MessageOutlined className="text-6xl mb-4" />
          <p>Vui lòng đăng nhập</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
      {/* Sidebar - Messenger Style */}
      <div className={`w-[360px] bg-white border-r border-gray-200 flex flex-col ${selectedUserId ? 'hidden lg:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-gray-900">Đoạn chat</h1>
            {/* WebSocket Status */}
            <div className="flex items-center text-xs">
              <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400 animate-pulse'}`}></span>
              <span className={isConnected ? 'text-green-600 font-medium' : 'text-gray-500'}>
                {isConnected ? 'Online' : 'Đang kết nối...'}
              </span>
            </div>
          </div>
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm trong Messenger"
              className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm outline-none focus:bg-gray-200 transition-colors"
            />
            <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <MessageOutlined className="text-5xl text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">Chưa có khách hàng nào</p>
            </div>
          ) : (
            assignments.map((assignment) => (
              <div
                key={assignment.customerId}
                onClick={() => handleSelectConversation(assignment.customerId, assignment.customerName, assignment.customerAvatarUrl)}
                className={`flex items-center px-3 py-3 cursor-pointer transition-colors hover:bg-gray-100 ${
                  selectedUserId === assignment.customerId ? 'bg-blue-50' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0 mr-3">
                  {assignment.customerAvatarUrl ? (
                    <img
                      src={assignment.customerAvatarUrl}
                      alt={assignment.customerName}
                      className="w-14 h-14 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg ${assignment.customerAvatarUrl ? 'hidden' : ''}`}>
                    {assignment.customerName.charAt(0).toUpperCase()}
                  </div>
                  {/* Online Status */}
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      {assignment.customerName}
                    </h3>
                    {assignment.lastMessageAt && (
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(assignment.lastMessageAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 truncate">
                      {assignment.customerEmail}
                    </p>
                    {(assignment.unreadMessageCount || 0) > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full">
                        {assignment.unreadMessageCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Window - Messenger Style */}
      {selectedUserId ? (
        <ChatWindow
          currentUserId={userId}
          otherUserId={selectedUserId}
          otherUserName={selectedUserName}
          otherUserAvatar={selectedUserAvatar}
          sendMessage={sendMessage}
          isConnected={isConnected}
          onWebSocketMessage={latestMessage}
        />
      ) : (
        <div className="flex-1 items-center justify-center bg-white hidden lg:flex">
          <div className="text-center px-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
              <MessageOutlined className="text-5xl text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Messenger của bạn</h2>
            <p className="text-gray-500 max-w-sm mx-auto">
              {assignments.length === 0
                ? 'Bạn chưa được phân công khách hàng nào. Liên hệ admin để được hỗ trợ.'
                : `Chọn một trong ${assignments.length} khách hàng để bắt đầu trò chuyện`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessagePage;

