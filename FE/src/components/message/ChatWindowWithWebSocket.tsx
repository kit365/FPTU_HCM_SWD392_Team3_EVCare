import React, { useState, useEffect, useRef } from 'react';
import type { MessageResponse, WebSocketMessageRequest } from '../../types/message.types';
import { messageService } from '../../service/messageService';
import { notify } from '../admin/common/Toast';

interface ChatWindowProps {
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
  sendMessage?: (request: WebSocketMessageRequest) => void;
  markAsRead?: (request: { messageId: string; userId: string }) => void;
  isConnected?: boolean;
  onWebSocketMessage?: MessageResponse | null;
}
export function ChatWindowWithWebSocket({
  currentUserId,
  otherUserId,
  otherUserName,
  sendMessage,
  markAsRead,
  isConnected = false,
  onWebSocketMessage,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Load conversation history when conversation changes
  useEffect(() => {
    if (otherUserId) {
      loadConversationHistory();
    }
  }, [currentUserId, otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for new messages from parent component's WebSocket
  useEffect(() => {
    if (onWebSocketMessage) {
      console.log('📨 ====== ChatWindow: Received new message from WebSocket ======');
      console.log('📨 Full message:', JSON.stringify(onWebSocketMessage, null, 2));
      console.log('📨 Current userId:', currentUserId);
      console.log('📨 Other userId:', otherUserId);
      console.log('📨 Message senderId:', onWebSocketMessage.senderId);
      console.log('📨 Message receiverId:', onWebSocketMessage.receiverId);
      
      // Check if message is part of current conversation
      const isFromSelectedUser = onWebSocketMessage.senderId === otherUserId && onWebSocketMessage.receiverId === currentUserId;
      const isToSelectedUser = onWebSocketMessage.senderId === currentUserId && onWebSocketMessage.receiverId === otherUserId;
      
      console.log('📨 isFromSelectedUser:', isFromSelectedUser);
      console.log('📨 isToSelectedUser:', isToSelectedUser);
      
      if (isFromSelectedUser || isToSelectedUser) {
        setMessages(prev => {
          // Check if this is a real message replacing a temporary one
          const tempMessageIndex = prev.findIndex(m => 
            m.messageId.startsWith('temp-') && 
            m.senderId === onWebSocketMessage.senderId && 
            m.content === onWebSocketMessage.content
          );
          
          if (tempMessageIndex !== -1) {
            console.log('✅ Found temporary message to replace at index:', tempMessageIndex);
            const newMessages = [...prev];
            newMessages[tempMessageIndex] = onWebSocketMessage;
            console.log('✅ Replaced temporary message with real message');
            return newMessages;
          }
          
          // Check if message already exists (by real messageId)
          const exists = prev.some(m => !m.messageId.startsWith('temp-') && m.messageId === onWebSocketMessage.messageId);
          if (exists) {
            console.log('⚠️ Message already exists, skipping duplicate');
            return prev;
          }
          console.log('✅ Adding new message to conversation');
          return [...prev, onWebSocketMessage];
        });
        
        // Mark as read if I'm the receiver
        if (onWebSocketMessage.receiverId === currentUserId && !onWebSocketMessage.isRead && markAsRead) {
          markAsRead({
            messageId: onWebSocketMessage.messageId,
            userId: currentUserId
          });
        }
      }
    }
  }, [onWebSocketMessage, currentUserId, otherUserId, markAsRead]);

  const loadConversationHistory = async () => {
    try {
      setLoadingMessages(true);
      const response = await messageService.getConversation(currentUserId, otherUserId, 0, 100);
      console.log('📦 ChatWindow - Load conversation response:', response);
      
      if (response?.data?.success) {
        const data = response.data.data;
        
        // Check if data is directly an array or wrapped in PageResponse
        let conversationMessages: MessageResponse[] = [];
        if (Array.isArray(data)) {
          conversationMessages = data;
        } else if (data?.data && Array.isArray(data.data)) {
          conversationMessages = data.data;
        }
        
        console.log('📨 ChatWindow - Loaded messages:', conversationMessages.length);
        
        // Reverse messages so newest is at bottom (chronological order)
        const sortedMessages = conversationMessages.reverse();
        setMessages(sortedMessages);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
      notify.error('Không thể tải lịch sử tin nhắn');
    } finally {
      setLoadingMessages(false);
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleSend = async () => {
    if (!inputMessage.trim() || sending || !isConnected || !sendMessage) return;
    try {
      setSending(true);
      
      const messageContent = inputMessage.trim();
      
      // Add temporary message to UI immediately for better UX
      const tempMessage: MessageResponse = {
        messageId: `temp-${Date.now()}`,
        senderId: currentUserId,
        senderName: 'You',
        receiverId: otherUserId,
        receiverName: otherUserName,
        content: messageContent,
        isRead: false,
        sentAt: new Date().toISOString(),
        status: 'SENT' as any,
        attachmentUrl: undefined
      };
      
      console.log('📤 Adding temporary message to UI:', tempMessage);
      setMessages(prev => [...prev, tempMessage]);
      
      // Send via WebSocket
      const request: WebSocketMessageRequest = {
        senderId: currentUserId,
        receiverId: otherUserId,
        content: messageContent,
      };
      sendMessage(request);
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      notify.error('Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <div className="text-lg mb-2">Đang kết nối...</div>
          <div className="text-sm">Vui lòng đợi trong giây lát</div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <h3 className="font-semibold">{otherUserName}</h3>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
              <p className="mt-2">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            return (
              <div
                key={message.messageId}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    isOwn
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  {!isOwn && (
                    <div className="text-xs font-semibold mb-1">
                      {message.senderName}
                    </div>
                  )}
                  <div className="text-sm">{message.content}</div>
                  <div className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(message.sentAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <div className="border-t border-gray-300 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || sending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {sending ? 'Đang gửi...' : 'Gửi'}
          </button>
        </div>
        {!isConnected && (
          <div className="text-red-500 text-xs mt-2">
            ⚠️ Không kết nối được. Tin nhắn sẽ không gửi được.
          </div>
        )}
      </div>
    </div>
  );
}
