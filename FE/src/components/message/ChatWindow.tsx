import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input, Button, Spin, Empty } from 'antd';
import { SendOutlined, CheckOutlined } from '@ant-design/icons';
import type { MessageResponse, WebSocketMessageRequest } from '../../types/message.types';
import { messageService } from '../../service/messageService';
import { notify } from '../admin/common/Toast';

interface ChatWindowProps {
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  sendMessage: (request: WebSocketMessageRequest) => boolean;
  isConnected: boolean;
  onWebSocketMessage?: MessageResponse | null;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  currentUserId,
  otherUserId,
  otherUserName,
  otherUserAvatar,
  sendMessage,
  isConnected,
  onWebSocketMessage,
}) => {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // Load conversation history
  useEffect(() => {
    if (otherUserId) {
      setMessages([]);
      lastMessageIdRef.current = null;
      loadConversation();
    }
  }, [currentUserId, otherUserId]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!onWebSocketMessage) {
      return;
    }
    
    const messageId = onWebSocketMessage.messageId;
    
    // Skip if already processed - CHECK AND MARK IN ONE OPERATION
    if (lastMessageIdRef.current === messageId) {
      console.log('⚠️ [ChatWindow] Duplicate prevented:', messageId.substring(0, 8));
      return;
    }
    
    // IMMEDIATELY mark as processed to prevent race condition
    lastMessageIdRef.current = messageId;
    console.log('✅ [ChatWindow] Processing message:', onWebSocketMessage.content.substring(0, 30));

    const isFromSelectedUser =
      onWebSocketMessage.senderId === otherUserId &&
      onWebSocketMessage.receiverId === currentUserId;
    const isToSelectedUser =
      onWebSocketMessage.senderId === currentUserId &&
      onWebSocketMessage.receiverId === otherUserId;

    if (!isFromSelectedUser && !isToSelectedUser) {
      return;
    }

    // Check if this is OWN message (echo from server)
    const isOwnMessage = onWebSocketMessage.senderId === currentUserId;

    if (isOwnMessage) {
      // Own message echo → ONLY replace temp, DO NOT add new
      console.log('🔄 [ChatWindow] Own message echo - replacing temp only');
      setMessages((prev) => {
        // Check if already exists (real message already added)
        if (prev.some((m) => m.messageId === onWebSocketMessage.messageId)) {
          return prev;
        }

        // Find and replace temp message
        const tempIndex = prev.findIndex(
          (m) =>
            m.messageId.startsWith('temp-') &&
            m.content === onWebSocketMessage.content &&
            Math.abs(
              new Date(m.sentAt).getTime() -
                new Date(onWebSocketMessage.sentAt).getTime()
            ) < 5000
        );

        if (tempIndex !== -1) {
          const updated = [...prev];
          updated[tempIndex] = onWebSocketMessage;
          console.log('✅ [ChatWindow] Replaced temp message');
          return updated;
        }

        // No temp found → don't add (already displayed)
        console.log('⚠️ [ChatWindow] No temp message found, skipping add');
        return prev;
      });
      return;
    }

    // Message from other user → ADD new message
    console.log('📨 [ChatWindow] Message from other user - adding new');
    setMessages((prev) => {
      // Check if already exists
      if (prev.some((m) => m.messageId === onWebSocketMessage.messageId)) {
        return prev;
      }

      // Final safety check
      const messageIds = new Set(prev.map(m => m.messageId));
      if (messageIds.has(onWebSocketMessage.messageId)) {
        return prev;
      }

      return [...prev, onWebSocketMessage];
    });

  }, [onWebSocketMessage, currentUserId, otherUserId]);

  const loadConversation = async () => {
    console.log('🔍 [ChatWindow] loadConversation called with:', {
      otherUserId,
      currentUserId,
      isOtherUserIdUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(otherUserId),
      isCurrentUserIdUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUserId)
    });
    
    setLoading(true);
    try {
      const response = await messageService.getConversation(
        otherUserId,
        currentUserId,
        0,
        100
      );
      console.log('✅ [ChatWindow] API Response:', response);
      
      if (response?.data?.success) {
        const data = response.data.data;
        console.log('📦 [ChatWindow] Response data:', data);
        
        let conversationMessages: MessageResponse[] = [];
        if (Array.isArray(data)) {
          conversationMessages = data;
        } else if (data?.data && Array.isArray(data.data)) {
          conversationMessages = data.data;
        }

        console.log('💬 [ChatWindow] Parsed messages count:', conversationMessages.length);
        const sortedMessages = conversationMessages.reverse();
        setMessages(sortedMessages);

        if (sortedMessages.length > 0) {
          lastMessageIdRef.current =
            sortedMessages[sortedMessages.length - 1].messageId;
          console.log('✅ [ChatWindow] Loaded', sortedMessages.length, 'messages');
        } else {
          console.log('⚠️ [ChatWindow] No messages in conversation');
        }
      } else {
        console.error('❌ [ChatWindow] API response not successful:', response?.data);
      }
    } catch (error) {
      console.error('❌ [ChatWindow] Error loading conversation:', error);
      if (error?.response) {
        console.error('❌ [ChatWindow] Error response:', error.response.status, error.response.data);
      }
      notify.error('Không thể tải lịch sử tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || sending || !isConnected) return;

      setSending(true);
    const messageContent = inputMessage.trim();
    setInputMessage('');

    // Add temp message
    const tempMessage: MessageResponse = {
      messageId: `temp-${Date.now()}`,
      senderId: currentUserId,
      senderName: 'You',
      receiverId: otherUserId,
      receiverName: otherUserName,
      content: messageContent,
      status: 'SENT',
      sentAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    // Send via WebSocket
    const success = sendMessage({
      senderId: currentUserId,
        receiverId: otherUserId,
      content: messageContent,
    });

    if (!success) {
      // Fallback to REST API
      try {
        await messageService.sendMessage(
          {
            receiverId: otherUserId,
            content: messageContent,
          },
          currentUserId
        );
      } catch (error) {
        notify.error('Không thể gửi tin nhắn');
        // Remove temp message
        setMessages((prev) => prev.filter((m) => m.messageId !== tempMessage.messageId));
      }
      }

      setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessageStatus = (message: MessageResponse) => {
    if (message.senderId !== currentUserId) return null;

    // READ: Double checkmark blue (✓✓)
    if (message.status === 'READ') {
      return (
        <div className="flex items-center space-x-[-2px]">
          <CheckOutlined className="text-blue-500" style={{ fontSize: '12px' }} />
          <CheckOutlined className="text-blue-500" style={{ fontSize: '12px' }} />
        </div>
      );
    } 
    // DELIVERED: Double checkmark gray (✓✓)
    else if (message.status === 'DELIVERED') {
      return (
        <div className="flex items-center space-x-[-2px]">
          <CheckOutlined className="text-gray-400" style={{ fontSize: '12px' }} />
          <CheckOutlined className="text-gray-400" style={{ fontSize: '12px' }} />
        </div>
      );
    }
    // SENT: Single checkmark gray (✓)
    return <CheckOutlined className="text-gray-400" style={{ fontSize: '12px' }} />;
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-600">Đang kết nối...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden min-h-0">
      {/* Header - Messenger Style */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          {otherUserAvatar ? (
            <img
              src={otherUserAvatar}
              alt={otherUserName}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold ${otherUserAvatar ? 'hidden' : ''}`}>
            {otherUserName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{otherUserName}</h3>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              {isConnected ? (
                <>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 font-medium">Đang hoạt động</span>
                </>
              ) : (
                <>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span>Ngoại tuyến</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages - Messenger Style - Scrollable area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-white custom-scrollbar min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spin size="large" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Empty
              description="Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
      </div>
        ) : (
          messages.map((message, index) => {
          const isOwn = message.senderId === currentUserId;
            const showTime = index === 0 || 
              (new Date(message.sentAt).getTime() - new Date(messages[index - 1].sentAt).getTime() > 60000);
            
          return (
              <div key={message.messageId}>
                {showTime && (
                  <div className="text-center text-xs text-gray-400 my-3">
                    {new Date(message.sentAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                )}
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end mb-0.5 group hover:bg-gray-50/50 transition-colors px-2 py-0.5 -mx-2 rounded`}>
                  {!isOwn && (
                    <div className="relative flex-shrink-0 mr-2" style={{ width: '28px', visibility: (index === messages.length - 1 || messages[index + 1].senderId !== message.senderId) ? 'visible' : 'hidden' }}>
                      {message.senderAvatarUrl ? (
                        <img
                          src={message.senderAvatarUrl}
                          alt={message.senderName}
                          className="w-7 h-7 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold ${message.senderAvatarUrl ? 'hidden' : ''}`}>
                        {message.senderName?.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                  <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[65%]`}>
                    <div
                      className={`px-3 py-2 text-[15px] leading-[1.35] shadow-sm ${
                  isOwn
                          ? 'bg-[#0084FF] text-white rounded-[18px] rounded-br-[4px]'
                          : 'bg-[#E4E6EB] text-gray-900 rounded-[18px] rounded-bl-[4px]'
                      }`}
                      style={{ wordBreak: 'break-word' }}
                    >
                      {message.content}
                    </div>
                    {isOwn && (index === messages.length - 1 || messages[index + 1].senderId !== message.senderId) && (
                      <div className="flex items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {renderMessageStatus(message)}
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

      {/* Input - Messenger Style - Always visible at bottom */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 bg-white">
        <div className="flex items-end space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <div className="flex-1 bg-[#F0F2F5] rounded-[20px] px-3 py-2 flex items-center">
          <input
              ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
              placeholder="Aa"
              disabled={sending || !isConnected}
              className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500"
              style={{ border: 'none' }}
            />
            <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
              <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || sending || !isConnected}
            className={`p-2 rounded-full transition-all flex-shrink-0 ${
              inputMessage.trim() && !sending && isConnected
                ? 'bg-[#0084FF] text-white hover:bg-[#0073E6]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <span className="animate-spin text-lg">⏳</span>
            ) : (
              <SendOutlined style={{ fontSize: '16px' }} />
            )}
          </button>
        </div>
        {!isConnected && (
          <div className="text-red-500 text-xs mt-2 text-center">⚠️ Mất kết nối. Đang thử kết nối lại...</div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        /* Custom Scrollbar - Messenger Style */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

