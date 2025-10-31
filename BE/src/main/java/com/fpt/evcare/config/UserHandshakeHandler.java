package com.fpt.evcare.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

/**
 * Custom HandshakeHandler to assign a Principal (userId) to each WebSocket session.
 * This allows Spring to route messages to specific users via /user/{userId}/queue/...
 */
@Slf4j
public class UserHandshakeHandler extends DefaultHandshakeHandler {

    @Override
    protected Principal determineUser(
            ServerHttpRequest request,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes
    ) {
        // Extract userId from query parameter or header
        String userId = extractUserId(request);
        
        if (userId != null && !userId.isEmpty()) {
            log.info("🔐 WebSocket connected: {}", userId);
            return new StompPrincipal(userId);
        }
        
        // Fallback: generate a random session ID
        String randomId = UUID.randomUUID().toString();
        log.warn("⚠️ WebSocket connected without userId");
        return new StompPrincipal(randomId);
    }

    /**
     * Extract userId from request (query param or header)
     */
    private String extractUserId(ServerHttpRequest request) {
        // Try query parameter first: /ws?userId=xxx
        String query = request.getURI().getQuery();
        if (query != null && query.contains("userId=")) {
            String[] params = query.split("&");
            for (String param : params) {
                if (param.startsWith("userId=")) {
                    return param.substring("userId=".length());
                }
            }
        }
        
        // Try header: user-id
        if (request.getHeaders().containsKey("user-id")) {
            return request.getHeaders().getFirst("user-id");
        }
        
        return null;
    }

    /**
     * Simple Principal implementation for STOMP
     */
    private static class StompPrincipal implements Principal {
        private final String name;

        public StompPrincipal(String name) {
            this.name = name;
        }

        @Override
        public String getName() {
            return name;
        }
    }
}

