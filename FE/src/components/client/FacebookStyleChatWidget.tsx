import { useState, useEffect, useRef, useCallback } from 'react';
import { Badge, Modal } from 'antd';
import { 
  MessageOutlined, 
  CloseOutlined, 
  SendOutlined,
  MinusOutlined,
  WarningOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { useAuthContext } from '../../context/useAuthContext';
import { messageService } from '../../service/messageService';
import { messageAssignmentService } from '../../service/messageAssignmentService';
import { useWebSocket } from '../../hooks/useWebSocket';
import type { MessageResponse } from '../../types/message.types';
import { notify } from '../admin/common/Toast';

export const FacebookStyleChatWidget = () => {
  const { user } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [assignedStaffId, setAssignedStaffId] = useState<string | null>(null);
  const [assignedStaffName, setAssignedStaffName] = useState<string>('Hỗ trợ');
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasAssignment, setHasAssignment] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  const handleMessage = useCallback((message: MessageResponse) => {
    // Check if message is for this conversation
    const isFromStaff = message.senderId === assignedStaffId && message.receiverId === user?.userId;
    const isToStaff = message.senderId === user?.userId && message.receiverId === assignedStaffId;

    if (!isFromStaff && !isToStaff) {
      return;
    }
    
    // Skip if already processed
    if (lastMessageIdRef.current === message.messageId) {
      console.log('⚠️ [Widget] Duplicate prevented');
      return;
    }

    lastMessageIdRef.current = message.messageId;
    console.log('✅ [Widget] Processing:', message.content.substring(0, 30));
    
    // Check if this is OWN message (echo from server)
    const isOwnMessage = message.senderId === user?.userId;

    if (isOwnMessage) {
      // Own message echo → ONLY replace temp, DO NOT add new
      console.log('🔄 [Widget] Own message echo - replacing temp only');
      setMessages((prev) => {
        // Check if already exists
        if (prev.some(m => m.messageId === message.messageId)) {
          return prev;
        }

        // Find and replace temp message
        const tempIndex = prev.findIndex(
          m => m.messageId.startsWith('temp-') && 
               m.content === message.content &&
               Math.abs(new Date(m.sentAt).getTime() - new Date(message.sentAt).getTime()) < 5000
        );
        
        if (tempIndex !== -1) {
          const updated = [...prev];
          updated[tempIndex] = message;
          console.log('✅ [Widget] Replaced temp message');
          return updated;
        }
        
        // No temp found → don't add
        console.log('⚠️ [Widget] No temp found, skipping add');
        return prev;
      });
      return;
    }

    // Message from staff → ADD new message
    console.log('📨 [Widget] Message from staff - adding new');
    setMessages((prev) => {
      // Check duplicate
      if (prev.some(m => m.messageId === message.messageId)) {
        return prev;
      }
      
      return [...prev, message];
    });
    
    if (!isOpen && message.receiverId === user?.userId) {
      setUnreadCount((prev) => prev + 1);
    }
  }, [user?.userId, assignedStaffId, isOpen]);

  const {
    isConnected,
    sendMessage: wsSendMessage,
  } = useWebSocket({
    userId: user?.userId || '',
    onMessage: handleMessage,
  });

  // Load assignment
  useEffect(() => {
    if (user?.userId) {
      loadAssignment();
      loadUnreadCount();
    }
  }, [user?.userId]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      lastMessageIdRef.current = null;
      console.log('🧹 [FacebookStyleChatWidget] Cleaned up');
    };
  }, []);

  // Load messages when opening
  const hasLoadedRef = useRef(false);
  
  useEffect(() => {
    if (isOpen && assignedStaffId && user?.userId) {
      if (!hasLoadedRef.current) {
        // First time opening - load conversation
        loadConversation();
        hasLoadedRef.current = true;
      }
      // Mark as read every time widget opens
      setUnreadCount(0);
      markConversationAsRead();
    }
  }, [isOpen, assignedStaffId, user?.userId]);

  // Auto scroll
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadAssignment = async () => {
    if (!user?.userId) return;
    try {
      // Try auto-assign first (will keep existing assignment if staff online)
      const response = await messageAssignmentService.autoAssignStaff(user.userId);
      if (response?.data?.success) {
        const assignment = response.data.data;
        setAssignedStaffId(assignment.assignedStaffId);
        setAssignedStaffName(assignment.assignedStaffName);
        setHasAssignment(true);
        console.log('✅ Auto-assigned to staff:', assignment.assignedStaffName);
      }
    } catch (error: any) {
      console.log('❌ Auto-assign failed:', error?.response?.data?.message || 'No staff available');
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

  const loadConversation = async () => {
    if (!user?.userId || !assignedStaffId) return;
    try {
      const response = await messageService.getConversation(
        assignedStaffId,
        user.userId,
        0,
        50
      );
      if (response?.data?.success) {
        const data = response.data.data;
        let conversationMessages: MessageResponse[] = [];
        if (Array.isArray(data)) {
          conversationMessages = data;
        } else if (data?.data && Array.isArray(data.data)) {
          conversationMessages = data.data;
        }
        
        // Merge with existing messages and remove duplicates
        setMessages((prev) => {
          const reversed = conversationMessages.reverse();
          const allMessages = [...reversed, ...prev];
          
          // Remove duplicates by messageId
          const uniqueMessages = allMessages.filter((msg, index, self) =>
            index === self.findIndex((m) => m.messageId === msg.messageId)
          );
          
          // Sort by sentAt
          return uniqueMessages.sort((a, b) => 
            new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
          );
        });
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
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

  const handleSend = async () => {
    if (!inputMessage.trim() || sending || !assignedStaffId || !user?.userId) return;

    setSending(true);
    const messageContent = inputMessage.trim();
    setInputMessage('');

    // Add temp message
    const tempMessage: MessageResponse = {
      messageId: `temp-${Date.now()}`,
      senderId: user.userId,
      senderName: user.fullName || 'You',
      receiverId: assignedStaffId,
      receiverName: assignedStaffName,
      content: messageContent,
      status: 'SENT',
      sentAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    // Send via WebSocket
    const success = wsSendMessage({
      senderId: user.userId,
      receiverId: assignedStaffId,
      content: messageContent,
    });

    if (!success) {
      // Fallback to REST API
      try {
        await messageService.sendMessage(
          {
            receiverId: assignedStaffId,
            content: messageContent,
          },
          user.userId
        );
      } catch (error) {
        notify.error('Không thể gửi tin nhắn');
        setMessages((prev) => prev.filter((m) => m.messageId !== tempMessage.messageId));
      }
    }

    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) {
    return null;
  }
  
  if (!hasAssignment) {
    // Show active chat button but display message when clicked
    return (
      <>
        {/* Floating Button - Disabled State */}
        <div className="fixed bottom-5 right-5 z-50">
          <div 
            className="w-[60px] h-[60px] rounded-full bg-gray-400 flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-all"
            onClick={() => {
              Modal.warning({
                title: 'Chưa có nhân viên hỗ trợ',
                icon: <WarningOutlined className="text-orange-500" />,
                content: (
                  <div className="mt-4">
                    <p className="mb-2">Bạn chưa được phân công nhân viên hỗ trợ.</p>
                    <p className="mb-2">Vui lòng liên hệ:</p>
                    <ul className="list-disc ml-5 text-gray-600">
                      <li>Hotline: <strong>1900-xxxx</strong></li>
                      <li>Email: <strong>support@evcare.com</strong></li>
                    </ul>
                  </div>
                ),
                okText: 'Đã hiểu',
                centered: true,
              });
            }}
            title="Click để xem thông tin liên hệ"
          >
            <MessageOutlined className="text-white" style={{ fontSize: '28px' }} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Floating Button - Facebook Blue */}
      {!isOpen && (
        <div 
          className="fixed bottom-5 right-5 z-50 cursor-pointer transition-transform hover:scale-105"
          onClick={() => setIsOpen(true)}
        >
          <Badge count={unreadCount} offset={[-8, 8]} style={{ backgroundColor: '#FF3E4D' }}>
            <div className="w-[60px] h-[60px] rounded-full bg-[#0084FF] flex items-center justify-center shadow-lg hover:shadow-2xl transition-shadow">
              <MessageOutlined className="text-white" style={{ fontSize: '28px' }} />
            </div>
          </Badge>
        </div>
      )}

      {/* Chat Window - Facebook Style */}
      {isOpen && (
        <div className="fixed bottom-0 right-6 z-50 w-[328px] bg-white rounded-t-lg shadow-2xl flex flex-col" style={{ height: isMinimized ? '48px' : '455px' }}>
          {/* Header - Facebook Blue */}
          <div className="bg-[#0084FF] px-3 py-2 flex items-center justify-between rounded-t-lg cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
            <div className="flex items-center space-x-2 text-white flex-1">
              {/* Staff Avatar */}
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white flex-shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {assignedStaffName.charAt(0).toUpperCase()}
                </div>
              </div>
            <div className="flex-1">
              <div className="font-semibold text-sm leading-tight">{assignedStaffName}</div>
              <div className="flex items-center space-x-1 text-xs opacity-90 leading-tight">
                {isConnected ? (
                  <>
                    <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></div>
                    <span>Đang hoạt động</span>
                  </>
                ) : (
                  <>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                    <span>Đang kết nối...</span>
                  </>
                )}
              </div>
            </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(!isMinimized);
                }}
              >
                <MinusOutlined style={{ fontSize: '12px' }} />
              </button>
              <button
                className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              >
                <CloseOutlined style={{ fontSize: '12px' }} />
              </button>
            </div>
          </div>

          {/* Messages - Facebook Style */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto px-3 py-2 bg-white">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <MessageOutlined style={{ fontSize: '48px' }} className="mb-3 opacity-30" />
                    <p className="text-sm">Bắt đầu cuộc trò chuyện</p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isOwn = message.senderId === user.userId;
                    const showTime = index === 0 || 
                      (new Date(message.sentAt).getTime() - new Date(messages[index - 1].sentAt).getTime() > 60000);
                    
                    return (
                      <div key={message.messageId}>
                        {showTime && (
                          <div className="text-center text-xs text-gray-400 my-2">
                            {new Date(message.sentAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        )}
                        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end mb-0.5`}>
                          {!isOwn && (
                            <div 
                              className="w-5 h-5 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-[10px] font-semibold text-white mr-1.5 flex-shrink-0"
                              style={{ 
                                visibility: (index === messages.length - 1 || messages[index + 1].senderId !== message.senderId) ? 'visible' : 'hidden' 
                              }}
                            >
                              {assignedStaffName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%]`}>
                            <div
                              className={`px-3 py-1.5 text-[13px] leading-[1.4] ${
                                isOwn
                                  ? 'bg-[#0084FF] text-white rounded-[18px] rounded-br-[4px]'
                                  : 'bg-[#E4E6EB] text-gray-900 rounded-[18px] rounded-bl-[4px]'
                              }`}
                              style={{ wordBreak: 'break-word' }}
                            >
                              {message.content}
                            </div>
                            {isOwn && (index === messages.length - 1 || messages[index + 1].senderId !== message.senderId) && (
                              <div className="flex items-center space-x-1 mt-0.5 px-0.5">
                                {message.status === 'READ' ? (
                                  <div className="flex items-center" style={{ marginLeft: '-2px' }}>
                                    <CheckOutlined className="text-blue-500" style={{ fontSize: '9px' }} />
                                    <CheckOutlined className="text-blue-500" style={{ fontSize: '9px', marginLeft: '-4px' }} />
                                  </div>
                                ) : message.status === 'DELIVERED' ? (
                                  <div className="flex items-center" style={{ marginLeft: '-2px' }}>
                                    <CheckOutlined className="text-gray-400" style={{ fontSize: '9px' }} />
                                    <CheckOutlined className="text-gray-400" style={{ fontSize: '9px', marginLeft: '-4px' }} />
                                  </div>
                                ) : (
                                  <CheckOutlined className="text-gray-400" style={{ fontSize: '9px' }} />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input - Facebook Style */}
              <div className="px-2 py-2 bg-white border-t border-gray-100">
                <div className="flex items-center space-x-2 bg-[#F0F2F5] rounded-[20px] px-3 py-1.5 hover:bg-[#E4E6EB] transition-colors">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Aa"
                    disabled={sending || !isConnected}
                    className="flex-1 bg-transparent outline-none text-[13px] placeholder-gray-500"
                    style={{ border: 'none' }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputMessage.trim() || sending || !isConnected}
                    className="flex-shrink-0 transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
                  >
                    {sending ? (
                      <span className="animate-spin text-base">⏳</span>
                    ) : (
                      <SendOutlined 
                        className={inputMessage.trim() && isConnected ? 'text-[#0084FF]' : 'text-gray-400'} 
                        style={{ fontSize: '16px' }} 
                      />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

