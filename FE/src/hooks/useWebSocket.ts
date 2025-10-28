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
  const isCleaningUpRef = useRef(false);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;
  
  // Store callbacks in refs to keep stable references
  const onMessageRef = useRef(onMessage);
  const onUnreadCountUpdateRef = useRef(onUnreadCountUpdate);
  const onErrorRef = useRef(onError);
  const onConnectedRef = useRef(onConnected);
  const onDisconnectedRef = useRef(onDisconnected);
  
  // Update refs when callbacks change
  useEffect(() => {
    onMessageRef.current = onMessage;
    onUnreadCountUpdateRef.current = onUnreadCountUpdate;
    onErrorRef.current = onError;
    onConnectedRef.current = onConnected;
    onDisconnectedRef.current = onDisconnected;
  }, [onMessage, onUnreadCountUpdate, onError, onConnected, onDisconnected]);

  const connect = useCallback(() => {
    if (!userId) {
      console.warn('Cannot connect WebSocket: userId is empty');
      return;
    }
    
    // Prevent duplicate connections
    if (clientRef.current && clientRef.current.active) {
      console.log('WebSocket already connected, skipping...');
      return;
    }

    try {
      // ✅ Add userId as query parameter for backend to identify user session
      const baseWsUrl = import.meta.env.PROD
        ? 'https://localhost:8080/ws'
        : 'http://localhost:8080/ws';
      
      const wsUrl = `${baseWsUrl}?userId=${userId}`;

      console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);

      const client = new Client({
        brokerURL: undefined, // Disable native WebSocket, use SockJS only
        webSocketFactory: () => {
          console.log('🔌 Creating SockJS connection to:', wsUrl);
          console.log('🔌 User ID:', userId);
          
          const sock = new SockJS(wsUrl);
          
          sock.onopen = () => {
            console.log('✅ SockJS connection opened for user:', userId);
          };
          
          sock.onclose = (event) => {
            console.log('❌ SockJS connection closed:', event.code, event.reason);
          };
          
          sock.onerror = (error) => {
            console.error('❌ SockJS connection error:', error);
          };
          
          sock.onmessage = (event) => {
            console.log('📨 SockJS raw message:', event.data);
          };
          
          return sock as any;
        },
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
          console.log('📡 Setting up message subscription for user:', userId);
          const messageDestination = `/user/${userId}/queue/messages`;
          console.log('📡 Subscribing to:', messageDestination);
          console.log('📡 STOMP user principal should be:', userId);

          const messageSubscription = client.subscribe(messageDestination, (message) => {
            console.log('🔥 ====== RAW MESSAGE RECEIVED ======');
            console.log('🔥 User ID:', userId);
            console.log('🔥 Subscribed destination:', messageDestination);
            console.log('🔥 Message destination:', message.headers.destination);
            console.log('🔥 Raw message body:', message.body);
            console.log('🔥 All message headers:', message.headers);
            console.log('🔥 Message type:', typeof message.body);
            console.log('🔥 Full message object:', message);
            console.log('🔥 Message headers:', message.headers);

            try {
              const data = JSON.parse(message.body) as MessageResponse;
              console.log('✅ Parsed message data:', data);
              console.log('✅ Message senderId:', data.senderId);
              console.log('✅ Message receiverId:', data.receiverId);
              console.log('✅ Message content:', data.content);

              // Call the callback
              console.log('📞 Calling onMessage callback...');
              onMessageRef.current?.(data);
              console.log('✅ onMessage callback completed');
            } catch (e) {
              console.error('❌ Error parsing message:', e);
              console.error('❌ Raw body that failed to parse:', message.body);
            }
          });

          console.log('✅ Message subscription completed for user:', userId);

          // Test send a message to verify subscription works
          console.log('🧪 Testing subscription - sending test message to self...');
          setTimeout(() => {
            console.log('🧪 Test timeout reached, subscription should be active now');
          }, 1000);

          // Subscribe to unread count updates
          client.subscribe(`/user/${userId}/queue/unread-count`, (message) => {
            try {
              const count = Number(message.body);
              console.log('🔔 Unread count update:', count);
              onUnreadCountUpdateRef.current?.(count);
            } catch (e) {
              console.error('Error parsing unread count:', e);
            }
          });

          onConnectedRef.current?.();
        },
        onDisconnect: () => {
          console.log('🔌 WebSocket disconnected');
          setIsConnected(false);
          onDisconnectedRef.current?.();

          // Only attempt to reconnect if not cleaning up
          if (!isCleaningUpRef.current && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current++;
            console.log(`Reconnecting... Attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}`);
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, RECONNECT_DELAY);
          } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
            console.error('Max reconnection attempts reached');
            setError('Failed to reconnect after multiple attempts');
          }
        },
        onStompError: (frame) => {
          console.error('❌ STOMP error:', frame);
          setError('WebSocket connection error');
          onErrorRef.current?.('WebSocket connection error');
        },
      });

      clientRef.current = client;
      client.activate();
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError('Failed to create WebSocket connection');
      onErrorRef.current?.('Failed to create WebSocket connection');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const disconnect = useCallback(() => {
    isCleaningUpRef.current = true;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.deactivate();
      console.log('Disconnected from STOMP');
    }
    setIsConnected(false);
    isCleaningUpRef.current = false;
  }, []);

  const sendMessage = useCallback((request: WebSocketMessageRequest) => {
    if (!clientRef.current || !isConnected) {
      console.error('Cannot send message: WebSocket is not connected');
      console.error('clientRef.current:', clientRef.current);
      console.error('isConnected:', isConnected);
      return;
    }
    try {
      console.log('🔄 Preparing to send WebSocket message...');
      console.log('🔄 Destination:', '/app/message/send');
      console.log('🔄 Request object:', request);
      console.log('🔄 JSON body:', JSON.stringify(request));

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

  const sendDebugMessage = useCallback((targetUserId: string) => {
    if (!clientRef.current || !isConnected) {
      console.error('Cannot send debug message: WebSocket is not connected');
      return;
    }
    try {
      console.log('🧪 Sending debug message to user:', targetUserId);

      const debugRequest = {
        senderId: userId,
        receiverId: targetUserId,
        content: "Debug test message"
      };

      clientRef.current.publish({
        destination: '/app/debug/user-message',
        body: JSON.stringify(debugRequest),
      });
      console.log('🧪 Debug message sent to:', targetUserId);
    } catch (err) {
      console.error('Error sending debug message:', err);
    }
  }, [isConnected, userId]);

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
    sendDebugMessage,
    markAsRead,
    connect,
    disconnect,
  };
}
