import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { MessageResponse, WebSocketMessageRequest, WebSocketMarkReadRequest } from '../types/message.types';

interface UseWebSocketOptions {
  userId: string;
  onMessage?: (message: MessageResponse) => void;
  onUnreadCountUpdate?: (count: number) => void;
  onError?: (error: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const { userId, onMessage, onUnreadCountUpdate, onError, onConnected, onDisconnected } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;

  const connect = useCallback(() => {
    if (!userId) {
      console.warn('Cannot connect WebSocket: userId is empty');
      return;
    }

    try {
      const wsUrl = import.meta.env.PROD
        ? 'https://localhost:8080/ws'
        : 'http://localhost:8080/ws';

      console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);

      const client = new Client({
        webSocketFactory: () => new SockJS(wsUrl) as any,
        reconnectDelay: RECONNECT_DELAY,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        onConnect: () => {
          console.log('✅ STOMP WebSocket connected');
          setIsConnected(true);
          setError(null);
          reconnectAttemptsRef.current = 0;

          // Subscribe to messages
          client.subscribe(`/user/${userId}/queue/messages`, (message) => {
            try {
              const data = JSON.parse(message.body) as MessageResponse;
              console.log('📨 Received message:', data);
              onMessage?.(data);
            } catch (e) {
              console.error('Error parsing message:', e);
            }
          });

          // Subscribe to unread count updates
          client.subscribe(`/user/${userId}/queue/unread-count`, (message) => {
            try {
              const count = Number(message.body);
              console.log('🔔 Unread count update:', count);
              onUnreadCountUpdate?.(count);
            } catch (e) {
              console.error('Error parsing unread count:', e);
            }
          });

          onConnected?.();
        },
        onDisconnect: () => {
          console.log('🔌 WebSocket disconnected');
          setIsConnected(false);
          onDisconnected?.();

          // Attempt to reconnect
          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current++;
            console.log(`Reconnecting... Attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}`);
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, RECONNECT_DELAY);
          } else {
            console.error('Max reconnection attempts reached');
            setError('Failed to reconnect after multiple attempts');
          }
        },
        onStompError: (frame) => {
          console.error('❌ STOMP error:', frame);
          setError('WebSocket connection error');
          onError?.('WebSocket connection error');
        },
      });

      clientRef.current = client;
      client.activate();
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError('Failed to create WebSocket connection');
      onError?.('Failed to create WebSocket connection');
    }
  }, [userId, onMessage, onUnreadCountUpdate, onError, onConnected, onDisconnected]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.deactivate();
      console.log('Disconnected from STOMP');
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((request: WebSocketMessageRequest) => {
    if (!clientRef.current || !isConnected) {
      console.error('Cannot send message: WebSocket is not connected');
      return;
    }
    try {
      clientRef.current.publish({
        destination: '/app/message/send',
        body: JSON.stringify(request),
      });
      console.log('📤 Sent message via WebSocket:', request);
    } catch (err) {
      console.error('Error sending message:', err);
      onError?.('Failed to send message');
    }
  }, [isConnected, onError]);

  const markAsRead = useCallback((request: WebSocketMarkReadRequest) => {
    if (!clientRef.current || !isConnected) {
      console.error('Cannot mark as read: WebSocket is not connected');
      return;
    }
    try {
      clientRef.current.publish({
        destination: '/app/message/mark-read',
        body: JSON.stringify(request),
      });
      console.log('✅ Marked message as read via WebSocket:', request.messageId);
    } catch (err) {
      console.error('Error marking message as read:', err);
      onError?.('Failed to mark message as read');
    }
  }, [isConnected, onError]);
  useEffect(() => {
    if (userId) {
      console.log('🔌 useWebSocket: Attempting to connect for userId:', userId);
      connect();
    }
    
    return () => {
      console.log('🔌 useWebSocket: Cleaning up connection for userId:', userId);
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // Removed connect and disconnect from dependencies to prevent re-connection loop
  return {
    isConnected,
    error,
    sendMessage,
    markAsRead,
    connect,
    disconnect,
  };
}
