import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import type { MessageResponse, WebSocketMessageRequest } from '../../types/message.types';
import { notify } from '../admin/common/Toast';
interface ChatWindowProps {
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
}
export function ChatWindowWithWebSocket({
  currentUserId,
  otherUserId,
  otherUserName,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isConnected, sendMessage, markAsRead } = useWebSocket({
    userId: currentUserId,
    onMessage: (message: MessageResponse) => {
      console.log('📨 New message received:', message);
      // Only add if it's part of current conversation
      if (
        (message.senderId === otherUserId && message.receiverId === currentUserId) ||
        (message.senderId === currentUserId && message.receiverId === otherUserId)
      ) {
        setMessages(prev => {
          // Check if message already exists
          const exists = prev.some(m => m.messageId === message.messageId);
          if (exists) return prev;
          return [...prev, message];
        });
        // Mark as read if I'm the receiver
        if (message.receiverId === currentUserId && !message.isRead) {
          markAsRead({
            messageId: message.messageId,
            userId: currentUserId
          });
        }
      }
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
      notify.error(error);
    }
  });
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleSend = async () => {
    if (!inputMessage.trim() || sending || !isConnected) return;
    try {
      setSending(true);
      // Send via WebSocket
      const request: WebSocketMessageRequest = {
        senderId: currentUserId,
        receiverId: otherUserId,
        content: inputMessage.trim(),
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
