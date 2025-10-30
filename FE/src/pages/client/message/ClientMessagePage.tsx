import { useState, useEffect } from 'react';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { ChatWindow } from '../../../components/message/ChatWindow';
import type { MessageResponse, MessageAssignmentResponse } from '../../../types/message.types';
import { messageAssignmentService } from '../../../service/messageAssignmentService';
import { notify } from '../../../components/admin/common/Toast';
import { useAuthContext } from '../../../context/useAuthContext';
import { Card, Alert } from 'antd';
import { MessageOutlined, CustomerServiceOutlined } from '@ant-design/icons';

export const ClientMessagePage = () => {
  const { user } = useAuthContext();
  const userId = user?.userId || '';
  const [assignment, setAssignment] = useState<MessageAssignmentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [latestMessage, setLatestMessage] = useState<MessageResponse | null>(null);

  // WebSocket connection
  const { isConnected, sendMessage } = useWebSocket({
    userId,
    onMessage: (message: MessageResponse) => {
      console.log('📨 ClientMessagePage: Received message:', message);
      console.log('📨 Message details:', {
        from: message.senderId,
        to: message.receiverId,
        content: message.content,
        currentUserId: userId
      });
      setLatestMessage({ ...message, _timestamp: Date.now() } as MessageResponse);
      loadAssignment(); // Reload assignment to update unread count
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
    loadAssignment();
  }, [userId]);

  const loadAssignment = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await messageAssignmentService.getAssignmentByCustomerId(userId);
      if (response?.data?.success) {
        setAssignment(response.data.data);
      }
    } catch (error: any) {
      console.error('Error loading assignment:', error);
      if (error?.response?.status === 404) {
        // Customer not assigned yet
        setAssignment(null);
      } else {
        notify.error('Không thể tải thông tin hỗ trợ');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-500 text-center">
          <MessageOutlined className="text-6xl mb-4" />
          <p>Vui lòng đăng nhập</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-500 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 p-6">
        <Card className="max-w-md text-center shadow-lg">
          <div className="p-8">
            <CustomerServiceOutlined className="text-6xl text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Chức năng hỗ trợ</h2>
            <Alert
              message="Chưa được phân công nhân viên hỗ trợ"
              description="Vui lòng liên hệ quản trị viên để được phân công nhân viên hỗ trợ qua tin nhắn."
              type="info"
              showIcon
              className="text-left"
            />
            <div className="mt-6 text-sm text-gray-500">
              <p>Hoặc bạn có thể liên hệ:</p>
              <p className="mt-2 font-semibold text-blue-600">Hotline: 1900 xxxx</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto h-full">
        <div className="h-full bg-white shadow-xl">
          <ChatWindow
            currentUserId={userId}
            otherUserId={assignment.assignedStaffId}
            otherUserName={assignment.assignedStaffName}
            otherUserAvatar={assignment.assignedStaffAvatarUrl}
            sendMessage={sendMessage}
            isConnected={isConnected}
            onWebSocketMessage={latestMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientMessagePage;

