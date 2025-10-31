import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let client: Client | null = null;
let subscriptions: Map<string, StompSubscription> = new Map();

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
const WS_ENDPOINT = "/ws";

interface WebSocketClientConfig {
  userId: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
}

/**
 * Initialize WebSocket client with user ID
 */
export const initWebSocketClient = (config: WebSocketClientConfig): Client => {
  const { userId, onConnect, onDisconnect, onError } = config;

  // Return existing client if already connected
  if (client?.connected) {
    console.log("✅ WebSocket already connected");
    return client;
  }

  const wsUrl = `${BACKEND_URL}${WS_ENDPOINT}?userId=${userId}`;
  console.log(`🔌 Initializing WebSocket: ${wsUrl}`);

  const sockJSFactory = (): WebSocket => {
    return new SockJS(wsUrl) as WebSocket;
  };

  client = new Client({
    webSocketFactory: sockJSFactory,
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    debug: (_str: string) => {
      // Disabled for production
    },
    onConnect: () => {
      console.log("✅ WebSocket connected");
      onConnect?.();
    },
    onDisconnect: () => {
      console.log("🔌 WebSocket disconnected");
      subscriptions.clear();
      onDisconnect?.();
    },
    onStompError: (frame) => {
      console.error("❌ STOMP error:", frame.headers?.message || "Unknown error");
      onError?.(frame.headers?.message || "WebSocket error");
    },
  });

  client.activate();
  return client;
};

/**
 * Subscribe to a topic/queue
 */
export const subscribe = (
  destination: string,
  callback: (message: IMessage) => void
): StompSubscription | null => {
  if (!client?.connected) {
    console.error("❌ Cannot subscribe: WebSocket not connected");
    return null;
  }

  // Unsubscribe existing subscription for this destination
  const existingSub = subscriptions.get(destination);
  if (existingSub) {
    existingSub.unsubscribe();
  }

  const subscription = client.subscribe(destination, callback);
  subscriptions.set(destination, subscription);
  console.log(`🔔 Subscribed to: ${destination}`);
  
  return subscription;
};

/**
 * Publish message to destination
 */
export const publish = (destination: string, body: string): boolean => {
  if (!client?.connected) {
    console.error("❌ Cannot publish: WebSocket not connected");
    return false;
  }

  try {
    client.publish({ destination, body });
    console.log(`📤 Published to ${destination}`);
    return true;
  } catch (error) {
    console.error("❌ Error publishing message:", error);
    return false;
  }
};

/**
 * Disconnect WebSocket client
 */
export const disconnectWebSocket = (): void => {
  if (client) {
    subscriptions.forEach(sub => sub.unsubscribe());
    subscriptions.clear();
    client.deactivate();
    client = null;
    console.log("🔌 WebSocket disconnected and cleaned up");
  }
};

/**
 * Check if WebSocket is connected
 */
export const isWebSocketConnected = (): boolean => {
  return client?.connected || false;
};

/**
 * Get current client instance (for advanced usage)
 */
export const getWebSocketClient = (): Client | null => {
  return client;
};
