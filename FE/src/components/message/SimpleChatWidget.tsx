import { useState, useEffect, useCallback } from 'react';
import { MessageOutlined, CloseOutlined, SendOutlined } from '@ant-design/icons';
import { useAuthContext } from '../../context/useAuthContext';
import { messageService } from '../../service/messageService';
import { useWebSocket } from '../../hooks/useWebSocket';
import type { MessageResponse } from '../../types/message.types';
import { MessageStatusEnum } from '../../types/message.types';
import type { UserResponse } from '../../types/user.types';

export function SimpleChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [availableStaff, setAvailableStaff] = useState<UserResponse[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<UserResponse | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [staffMessages, setStaffMessages] = useState<Record<string, MessageResponse>>({});
  const { user } = useAuthContext();


  // Create stable callbacks using useCallback
  const handleWebSocketMessage = useCallback((message: MessageResponse) => {
    console.log('📨 ====== NEW MESSAGE RECEIVED ======');
    console.log('📨 Full message:', JSON.stringify(message, null, 2));
    console.log('📨 Current selectedStaff ID:', selectedStaff?.userId);
    console.log('📨 Current user ID:', user?.userId);
    console.log('📨 Message senderId:', message.senderId);
    console.log('📨 Message receiverId:', message.receiverId);
    
    // Update last message for the relevant staff
    const otherUserId = message.senderId === user?.userId ? message.receiverId : message.senderId;
    setStaffMessages(prev => ({
      ...prev,
      [otherUserId]: message
    }));
    
    setMessages(prev => {
      console.log('📨 Previous messages count:', prev.length);
      
      // Check if this is a real message replacing a temporary one
      // If we sent a temp message and now receive the real one, replace it
      const tempMessageIndex = prev.findIndex(m => 
        m.messageId.startsWith('temp-') && 
        m.senderId === message.senderId && 
        m.content === message.content
      );
      
      if (tempMessageIndex !== -1) {
        console.log('✅ Found temporary message to replace at index:', tempMessageIndex);
        const newMessages = [...prev];
        newMessages[tempMessageIndex] = message;
        console.log('✅ Replaced temporary message with real message');
        return newMessages;
      }
      
      // Check if message already exists (by real messageId)
      const exists = prev.some(m => !m.messageId.startsWith('temp-') && m.messageId === message.messageId);
      if (exists) {
        console.log('⚠️ Message already exists, skipping duplicate');
        return prev;
      }
      
      // Add message if it's part of the currently selected conversation
      const isFromSelectedStaff = selectedStaff && message.senderId === selectedStaff.userId && message.receiverId === user?.userId;
      const isToSelectedStaff = selectedStaff && message.senderId === user?.userId && message.receiverId === selectedStaff.userId;
      
      console.log('📨 isFromSelectedStaff:', isFromSelectedStaff);
      console.log('📨 isToSelectedStaff:', isToSelectedStaff);
      
      if (selectedStaff && (isFromSelectedStaff || isToSelectedStaff)) {
        console.log('✅ Adding new message to conversation');
        const newMessages = [...prev, message];
        console.log('📨 New messages count:', newMessages.length);
        return newMessages;
      } else {
        console.log('⚠️ Message not for current conversation');
        return prev;
      }
    });
  }, [selectedStaff, user?.userId]);

  const handleUnreadCountUpdate = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);

  const handleConnected = useCallback(() => {
  }, []);

  const handleDisconnected = useCallback(() => {
  }, []);

  const handleError = useCallback((error: string) => {
    console.error('❌ WebSocket error in SimpleChatWidget:', error);
  }, []);

  // WebSocket connection
  const { markAsRead: _markAsRead, sendMessage } = useWebSocket({
    userId: user?.userId || '',
    onMessage: handleWebSocketMessage,
    onUnreadCountUpdate: handleUnreadCountUpdate,
    onConnected: handleConnected,
    onDisconnected: handleDisconnected,
    onError: handleError
  });

  const loadUnreadCount = useCallback(async () => {
    if (!user?.userId) return;
    try {
      const response = await messageService.getUnreadCount(user.userId);
      if (response?.data?.success) {
        setUnreadCount(response.data.data || 0);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }, [user?.userId]);

  const loadAvailableStaff = async () => {
    if (!user?.userId) return;
    try {
      const response = await messageService.getAvailableStaff();
      if (response?.data?.success && response.data.data) {
        setAvailableStaff(response.data.data);
      }
    } catch (error) {
      console.error('Error loading available staff:', error);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      loadUnreadCount();
      loadAvailableStaff();
    }
  }, [user?.userId, loadUnreadCount]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    console.log('🔄 useEffect [messages] triggered');
    console.log('🔄 messages.length:', messages.length);
    console.log('🔄 messages:', messages);
    
    if (messages.length > 0) {
      console.log('🔄 Scrolling to bottom for', messages.length, 'messages...');
      setTimeout(() => {
        const chatContainer = document.getElementById('chat-messages-container');
        if (chatContainer) {
          console.log('🔄 Found chat container, scrolling...');
          chatContainer.scrollTop = chatContainer.scrollHeight;
          console.log('✅ Scrolled to bottom. Height:', chatContainer.scrollHeight, 'Scroll:', chatContainer.scrollTop);
        } else {
          console.log('⚠️ Chat container not found');
        }
      }, 200);
    } else {
      console.log('⚠️ No messages to scroll');
    }
  }, [messages]);

  const handleSelectStaff = async (staff: UserResponse) => {
    console.log('📋 handleSelectStaff called:', staff);
    setSelectedStaff(staff);
    setMessages([]);
    
    if (!user?.userId) {
      console.warn('⚠️ No user.userId, returning early');
      return;
    }
    
    try {
      console.log('📡 ====== LOADING CONVERSATION ======');
      console.log('📡 Current user ID:', user.userId);
      console.log('📡 Staff user ID:', staff.userId);
      console.log('📡 Loading conversation from API...');
      
      const response = await messageService.getConversation(user.userId, staff.userId, 0, 100);
      console.log('📡 API Response received:', response);
      
      if (response?.data?.success) {
        const data = response.data.data;
        console.log('📡 Response data:', data);
        console.log('📡 data type:', typeof data, 'isArray:', Array.isArray(data));
        
        let conversationMessages: MessageResponse[] = [];
        
        // Backend PageResponse structure: { data: [], page, size, totalElements, totalPages, last }
        if (Array.isArray(data)) {
          console.log('✅ Setting messages (direct array):', data.length, 'messages');
          conversationMessages = data;
        } else if (data?.data && Array.isArray(data.data)) {
          // PageResponse structure: { data: [], page, size, totalElements, totalPages, last }
          console.log('✅ Setting messages (data.data):', data.data.length, 'messages');
          conversationMessages = data.data;
        } else {
          console.log('⚠️ No messages found, setting empty array');
          console.log('⚠️ Data structure:', JSON.stringify(data, null, 2));
        }
        
        // Reverse messages so newest is at bottom (chronological order)
        const sortedMessages = conversationMessages.reverse();
        setMessages(sortedMessages);
        
        // Update last message for this staff
        if (conversationMessages.length > 0) {
          const lastMessage = conversationMessages[conversationMessages.length - 1];
          setStaffMessages(prev => ({
            ...prev,
            [staff.userId]: lastMessage
          }));
        }
      } else {
        console.warn('⚠️ API success=false:', response);
      }
    } catch (error: any) {
      console.error('❌ Error loading messages:', error);
      if (error?.code === 'ERR_NETWORK') {
        console.warn('⚠️ Backend không chạy hoặc không thể kết nối. Vui lòng khởi động backend server.');
      }
      setMessages([]);
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || !selectedStaff || !user?.userId || sending) return;
    
    try {
      setSending(true);
      
      const messageContent = inputMessage.trim();
      
      // Gửi qua WebSocket thay vì REST API
      const wsPayload = {
        senderId: user.userId,
        receiverId: selectedStaff.userId,
        content: messageContent,
        attachmentUrl: undefined
      };
      
      // Temporarily add message to UI immediately for better UX
      const tempMessage: MessageResponse = {
        messageId: `temp-${Date.now()}`,
        senderId: user.userId,
        senderName: user.fullName || user.username || 'You',
        receiverId: selectedStaff.userId,
        receiverName: selectedStaff.fullName || selectedStaff.username || '',
        content: messageContent,
        isRead: false,
        sentAt: new Date().toISOString(),
        status: MessageStatusEnum.SENT,
        attachmentUrl: undefined
      };
      
      console.log('📤 Adding temporary message to UI:', tempMessage);
      setMessages(prev => [...prev, tempMessage]);
      
      // Update last message for this staff
      setStaffMessages(prev => ({
        ...prev,
        [selectedStaff.userId]: tempMessage
      }));
      
      // Clear input
      setInputMessage('');
      
      // Gửi qua WebSocket
      sendMessage(wsPayload);
      
      
    } catch (error: any) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (!user?.userId) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (isOpen) {
              setSelectedStaff(null);
              setMessages([]);
            }
          }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 relative"
          style={{ width: '64px', height: '64px' }}
        >
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center animate-bounce">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          {isOpen ? <CloseOutlined className="text-xl" /> : <MessageOutlined className="text-xl" />}
        </button>
      </div>

      {/* Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-28 right-6 z-40" style={{ width: '900px', height: '700px', maxWidth: '95vw', maxHeight: '90vh' }}>
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex border border-gray-100 h-full">
            {/* Left: Staff List - Messenger Style */}
            <div className="w-80 bg-gradient-to-b from-white to-gray-50 flex flex-col border-r border-gray-200">
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-bold text-gray-900">Tin nhắn</h3>
                  {unreadCount > 0 && (
                    <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full px-2.5 py-1.5 shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">Đội ngũ hỗ trợ chuyên nghiệp</p>
              </div>

              {/* Staff List */}
              <div className="flex-1 overflow-y-auto">
                {availableStaff.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400 text-sm">Không có nhân viên</p>
                  </div>
                ) : (
                  <div>
                    {availableStaff.map((staff) => (
                      <button
                        key={staff.userId}
                        onClick={() => handleSelectStaff(staff)}
                        className={`w-full flex items-center gap-3 px-5 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 text-left border-l-4 ${
                          selectedStaff?.userId === staff.userId
                            ? 'bg-gradient-to-r from-blue-50 to-transparent border-blue-500 shadow-sm'
                            : 'border-transparent'
                        }`}
                      >
                        <div className="relative">
                          <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm ${
                            selectedStaff?.userId === staff.userId ? 'ring-2 ring-blue-300' : ''
                          }`}>
                            {(staff.fullName || staff.username || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-bold truncate ${
                            selectedStaff?.userId === staff.userId ? 'text-blue-600' : 'text-gray-900'
                          }`} style={{ fontSize: '15px' }}>
                            {staff.fullName || staff.username}
                          </div>
                          <div className={`text-sm truncate ${
                            staffMessages[staff.userId] ? 'text-gray-600' : 'text-blue-500 font-medium'
                          }`}>
                            {staffMessages[staff.userId] 
                              ? (() => {
                                  const msg = staffMessages[staff.userId];
                                  const isOwn = msg.senderId === user?.userId;
                                  const preview = msg.content.length > 25 ? msg.content.substring(0, 25) + '...' : msg.content;
                                  return `${isOwn ? 'Bạn: ' : ''}${preview}`;
                                })()
                              : '• Sẵn sàng hỗ trợ'
                            }
                          </div>
                        </div>
                        {staffMessages[staff.userId] && (
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <div className={`text-xs font-medium ${
                              selectedStaff?.userId === staff.userId ? 'text-blue-600' : 'text-gray-400'
                            }`}>
                              {new Date(staffMessages[staff.userId].sentAt).toLocaleTimeString('vi-VN', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                            {!staffMessages[staff.userId].isRead && staffMessages[staff.userId].receiverId === user?.userId && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedStaff(null);
                    setMessages([]);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
                >
                  <CloseOutlined className="text-base" />
                  <span>Đóng</span>
                </button>
              </div>
            </div>

            {/* Right: Chat Area - Modern Chat Style */}
            <div className="flex-1 flex flex-col bg-gray-50">
              {!selectedStaff ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-4">
                      <MessageOutlined className="text-4xl text-blue-500" />
                    </div>
                    <p className="text-gray-600 text-lg font-medium">Chọn nhân viên để bắt đầu cuộc trò chuyện</p>
                    <p className="text-gray-400 text-sm mt-2">Hỗ trợ 24/7 từ đội ngũ EvCare</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="px-5 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        {(selectedStaff.fullName || selectedStaff.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-base">
                          {selectedStaff.fullName || selectedStaff.username}
                        </div>
                        <div className="text-xs text-gray-500">Đang hoạt động</div>
                      </div>
                    </div>
                  </div>

                  {/* Messages Container */}
                  <div id="chat-messages-container" className="flex-1 overflow-y-auto px-5 py-6 space-y-4 scroll-smooth">
                    {Array.isArray(messages) && messages.length > 0 ? (
                      messages.map((message) => {
                        const isOwn = message.senderId === user.userId;
                        return (
                          <div
                            key={message.messageId}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                              isOwn
                                ? 'bg-blue-500 text-white rounded-br-md'
                                : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
                            }`}>
                              <div className={isOwn ? 'text-white' : 'text-gray-800'} style={{ fontSize: '15px', lineHeight: '1.5' }}>
                                {message.content}
                              </div>
                              <div className={`mt-1.5 text-right ${isOwn ? 'text-blue-100' : 'text-gray-400'}`} style={{ fontSize: '11px' }}>
                                {new Date(message.sentAt).toLocaleTimeString('vi-VN', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <p className="text-gray-400 text-sm">Bắt đầu cuộc trò chuyện với {selectedStaff.fullName || selectedStaff.username}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="px-5 py-4 border-t border-gray-200 bg-white">
                    <div className="flex items-end gap-3">
                      <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 border-2 border-transparent focus-within:border-blue-500 focus-within:bg-white transition-colors">
                        <textarea
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSend();
                            }
                          }}
                          placeholder="Nhập tin nhắn..."
                          rows={1}
                          className="w-full resize-none outline-none bg-transparent text-gray-800 placeholder-gray-400"
                          style={{ fontSize: '15px', maxHeight: '120px' }}
                          disabled={sending}
                        />
                      </div>
                      <button
                        onClick={handleSend}
                        disabled={!inputMessage.trim() || sending}
                        className="w-11 h-11 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
                      >
                        {sending ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <SendOutlined className="text-lg" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2 px-1">
                      <span className="text-xs text-gray-400">Nhấn Enter để gửi, Shift+Enter để xuống dòng</span>
                      <span className="text-xs text-gray-400">{inputMessage.length}/500</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}


