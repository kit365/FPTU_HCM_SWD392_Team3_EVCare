import { useEffect, useRef, useState, useCallback } from "react";
import { 
  initWebSocketClient, 
  subscribe, 
  publish, 
  disconnectWebSocket,
  isWebSocketConnected
} from "../service/wsClient";
import type { MessageResponse, WebSocketMessageRequest } from "../types/message.types";

interface UseWebSocketOptions {
  userId: string;
  onMessage?: (message: MessageResponse) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
}


export function useWebSocket(options: UseWebSocketOptions) {
  const { userId, onMessage, onConnect, onDisconnect, onError } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const onMessageRef = useRef(onMessage);
  const hasInitialized = useRef(false);
  const pendingConnection = useRef(false);

  // Update callback ref when it changes
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);


  const connect = useCallback(() => {
    if (!userId) {
      console.warn("⚠️ Cannot connect: userId is required");
      return;
    }

    // Only check hasInitialized (pendingConnection được clear trong cleanup)
    if (hasInitialized.current) {
      console.log("⚠️ WebSocket already initialized, skipping reconnect");
      return;
    }

    console.log("🔌 [useWebSocket] Initializing connection...");
    hasInitialized.current = true;
    pendingConnection.current = false;  // Clear pending flag

    initWebSocketClient({
      userId,
      onConnect: () => {
        setIsConnected(true);
        onConnect?.();

        // Subscribe to personal message queue
        // Spring auto-routes to /user/{userId}/queue/messages based on session principal
        const destination = `/user/queue/messages`;
        subscribe(destination, (stompMessage) => {
          try {
            const data: MessageResponse = JSON.parse(stompMessage.body);
            console.log("📨 Received message from:", data.senderName);
            
            // Call the latest callback via ref (avoid stale closure)
            onMessageRef.current?.(data);
          } catch (error) {
            console.error("❌ Error parsing message:", error);
          }
        });
      },
      onDisconnect: () => {
        console.log("🔌 [useWebSocket] Server disconnected");
        setIsConnected(false);
        hasInitialized.current = false;
        onDisconnect?.();
      },
      onError: (error) => {
        console.error("❌ WebSocket error:", error);
        onError?.(error);
      },
    });
  }, [userId, onConnect, onDisconnect, onError]);

  /**
   * Send message via WebSocket
   */
  const sendMessage = useCallback((request: WebSocketMessageRequest): boolean => {
    if (!isWebSocketConnected()) {
      console.error("❌ Cannot send: WebSocket not connected");
      return false;
    }

    const success = publish("/app/message/send", JSON.stringify(request));
    if (success) {
      console.log("✅ Message sent");
    }
    return success;
  }, []);

  /**
   * Disconnect WebSocket
   */
  const disconnect = useCallback(() => {
    disconnectWebSocket();
    setIsConnected(false);
    hasInitialized.current = false;
    console.log("🔌 WebSocket disconnected via hook");
  }, []);

  // Auto-connect on mount, cleanup on unmount
  useEffect(() => {
    if (!userId || hasInitialized.current || pendingConnection.current) {
      return;
    }

    pendingConnection.current = true;

    // Delay connection to avoid React Strict Mode double-mount issues
    const timer = setTimeout(() => {
      connect();
    }, 100);

    return () => {
      clearTimeout(timer);
      pendingConnection.current = false;
      
      if (hasInitialized.current) {
        disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // Only re-run if userId changes

  return {
    isConnected,
    sendMessage,
    disconnect,
  };
}
