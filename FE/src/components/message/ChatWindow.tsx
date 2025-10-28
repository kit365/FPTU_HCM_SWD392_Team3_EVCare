import React, { useState, useEffect, useRef } from 'react';
import { messageService } from '../../service/messageService';
import type { MessageResponse } from '../../types/message.types';
import { notify } from '../admin/common/Toast';
interface ChatWindowProps {
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
  onNewMessage?: (message: MessageResponse) => void;
}
export function ChatWindow({
  currentUserId,
  otherUserId,
  otherUserName,
  onNewMessage
}: ChatWindowProps) {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    loadMessages();
  }, [otherUserId]);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messageService.getConversation(
        currentUserId,
        otherUserId,
        0,
        50
      );
      if (response?.data?.success && response?.data?.data?.content) {
        setMessages(response.data.data.content);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      notify.error('Không thể tải tin nhắn');
    } finally {
      setLoading(false);
    }
  };
  const handleSend = async () => {
    if (!inputMessage.trim() || sending) return;
    try {
      setSending(true);
      const response = await messageService.sendMessage(currentUserId, {
        receiverId: otherUserId,
        content: inputMessage.trim(),
      });
      if (response?.data?.success && response?.data?.data) {
        const newMessage = response.data.data;
        setMessages(prev => [...prev, newMessage]);
        setInputMessage('');
        onNewMessage?.(newMessage);
      } else {
        notify.error('Không thể gửi tin nhắn');
      }
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
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Đang tải tin nhắn...</div>
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
        {messages.map((message) => {
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
        })}
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
      </div>
    </div>
  );
}
