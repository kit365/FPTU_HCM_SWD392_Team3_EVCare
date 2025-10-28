package com.fpt.evcare.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Slf4j
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Bean(name = "websocketHeartbeatTaskScheduler")
    public TaskScheduler websocketHeartbeatTaskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("wss-heartbeat-");
        scheduler.initialize();
        return scheduler;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue")
              .setHeartbeatValue(new long[]{10000, 10000})
              .setTaskScheduler(websocketHeartbeatTaskScheduler());
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
        log.info("WebSocket Message Broker configured with topics: /topic, /queue");
        log.info("User destination prefix: /user");
        log.info("Heartbeat enabled with TaskScheduler");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // SockJS endpoint with custom handshake handler to set user principal
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .setAllowedOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:5000", 
                                  "http://127.0.0.1:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5000")
                .setHandshakeHandler(new UserHandshakeHandler()) // ✅ Use custom handler
                .withSockJS()
                .setStreamBytesLimit(512 * 1024)
                .setHttpMessageCacheSize(1000)
                .setDisconnectDelay(30 * 1000);
        
        // Also add native WebSocket without SockJS
        registry.addEndpoint("/ws-native")
                .setAllowedOriginPatterns("*")
                .setHandshakeHandler(new UserHandshakeHandler()); // ✅ Use custom handler
        
        log.info("WebSocket endpoints registered: /ws (with SockJS) and /ws-native (native)");
        log.info("Allowed origins: http://localhost:5173, http://localhost:3000, http://localhost:5000");
        log.info("Custom UserHandshakeHandler enabled for user principal mapping");
    }

}
