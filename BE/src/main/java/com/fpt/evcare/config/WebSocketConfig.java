package com.fpt.evcare.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Slf4j
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
        log.info("WebSocket Message Broker configured with topics: /topic, /queue");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Enable native WebSocket support (for Postman testing)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .setHandshakeHandler(new org.springframework.web.socket.server.support.DefaultHandshakeHandler())
                .withSockJS(); // SockJS fallback cho browsers
        
        // Also add native WebSocket without SockJS
        registry.addEndpoint("/ws-native")
                .setAllowedOriginPatterns("*");
        
        log.info("WebSocket endpoints registered: /ws (with SockJS) and /ws-native (native)");
    }

}
