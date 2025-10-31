import { useState, useEffect } from 'react';
import { Button, Badge, Modal } from 'antd';
import { MessageOutlined, CloseOutlined } from '@ant-design/icons';
import { ChatWindow } from '../message/ChatWindow';
import { useAuthContext } from '../../context/useAuthContext';
import { messageService } from '../../service/messageService';
import { messageAssignmentService } from '../../service/messageAssignmentService';
import { useWebSocket } from '../../hooks/useWebSocket';
import type { MessageResponse, WebSocketMessageRequest } from '../../types/message.types';
import { notify } from '../admin/common/Toast';

export const ChatWidget = () => {
  const { user } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [assignedStaffId, setAssignedStaffId] = useState<string | null>(null);
  const [assignedStaffName, setAssignedStaffName] = useState<string>('Hỗ trợ');
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasAssignment, setHasAssignment] = useState(false);

  const [latestMessage, setLatestMessage] = useState<MessageResponse | null>(null);

  const {
    isConnected,
    sendMessage,
  } = useWebSocket({
    userId: user?.userId || '',
    onMessage: (message) => {
      console.log('📨 ChatWidget received message:', message);
      setLatestMessage(message);
    },
  });

  // Load assignment
  useEffect(() => {
    if (user?.userId) {
      loadAssignment();
      loadUnreadCount();
    }
  }, [user?.userId]);

  // Update unread count when new message arrives
  useEffect(() => {
    if (latestMessage && latestMessage.receiverId === user?.userId && !isOpen) {
      setUnreadCount((prev) => prev + 1);
    }
  }, [latestMessage, user?.userId, isOpen]);

  // Reset unread when opening chat
  useEffect(() => {
    if (isOpen && assignedStaffId && user?.userId) {
      setUnreadCount(0);
      markConversationAsRead();
    }
  }, [isOpen, assignedStaffId, user?.userId]);

  const loadAssignment = async () => {
    if (!user?.userId) return;
    try {
      const response = await messageAssignmentService.getAssignmentByCustomerId(user.userId);
      if (response?.data?.success) {
        const assignment = response.data.data;
        setAssignedStaffId(assignment.assignedStaffId);
        setAssignedStaffName(assignment.assignedStaffName);
        setHasAssignment(true);
      }
    } catch (error: any) {
      console.error('No assignment found:', error);
      setHasAssignment(false);
    }
  };

  const loadUnreadCount = async () => {
    if (!user?.userId) return;
    try {
      const response = await messageService.getUnreadCount(user.userId);
      if (response?.data?.success) {
        setUnreadCount(response.data.data);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const markConversationAsRead = async () => {
    if (!user?.userId || !assignedStaffId) return;
    try {
      await messageService.markConversationAsRead(assignedStaffId, user.userId);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendMessage = (request: WebSocketMessageRequest): boolean => {
    if (!assignedStaffId) {
      notify.error('Bạn chưa được phân công nhân viên hỗ trợ');
      return false;
    }
    return sendMessage(request);
  };

  if (!user || !hasAssignment) {
    return null; // Don't show widget if no assignment
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Badge count={unreadCount} offset={[-5, 5]}>
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<MessageOutlined style={{ fontSize: '24px' }} />}
            onClick={() => setIsOpen(true)}
            className="shadow-lg hover:shadow-xl transition-all duration-300"
            style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
            }}
          />
        </Badge>
      </div>

      {/* Chat Modal */}
      <Modal
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageOutlined className="text-blue-600" style={{ fontSize: '20px' }} />
              <span className="text-lg font-semibold">Chat với {assignedStaffName}</span>
            </div>
            <Button
              type="text"
              shape="circle"
              icon={<CloseOutlined />}
              onClick={() => setIsOpen(false)}
            />
          </div>
        }
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={null}
        width={500}
        closeIcon={null}
        bodyStyle={{ padding: 0, height: '600px' }}
        className="chat-widget-modal"
      >
        {assignedStaffId && user?.userId && (
          <ChatWindow
            currentUserId={user.userId}
            otherUserId={assignedStaffId}
            otherUserName={assignedStaffName}
            sendMessage={handleSendMessage}
            isConnected={isConnected}
            onWebSocketMessage={latestMessage}
          />
        )}
      </Modal>

      <style>{`
        .chat-widget-modal .ant-modal-content {
          border-radius: 16px;
          overflow: hidden;
        }
        
        .chat-widget-modal .ant-modal-header {
          border-bottom: 1px solid #e5e7eb;
          padding: 16px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .chat-widget-modal .ant-modal-title {
          color: white;
        }
        
        .chat-widget-modal .ant-modal-close {
          color: white;
        }
      `}</style>
    </>
  );
};

