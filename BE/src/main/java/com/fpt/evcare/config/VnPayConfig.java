package com.fpt.evcare.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class VnPayConfig {

    @Value("${payment.vnpay.tmn-code}")
    private String tmnCode;

    @Value("${payment.vnpay.hash-secret}")
    private String hashSecret;

    @Value("${payment.vnpay.url}")
    private String payUrl;

    @Value("${payment.vnpay.return-url}")
    private String returnUrlTemplate;

    @Value("${spring.application.url:}")
    private String baseUrl;

    public String getTmnCode() {
        return tmnCode;
    }

    public String getHashSecret() {
        return hashSecret;
    }

    public String getPayUrl() {
        return payUrl;
    }

    /**
     * Build return URL từ baseUrl (giống Google OAuth pattern)
     * Tự động detect baseUrl từ HttpServletRequest nếu có, fallback về config
     */
    public String getReturnUrl(HttpServletRequest request) {
        String actualBaseUrl = getBaseUrl(request);
        if (returnUrlTemplate.contains("{baseUrl}")) {
            return returnUrlTemplate.replace("{baseUrl}", actualBaseUrl);
        }
        return returnUrlTemplate;
    }

    /**
     * Lấy baseUrl từ request (giống Spring Security OAuth2)
     * Hỗ trợ X-Forwarded-Host và X-Forwarded-Proto cho reverse proxy
     */
    private String getBaseUrl(HttpServletRequest request) {
        if (request != null) {
            String scheme = request.getScheme();
            String host = request.getHeader("X-Forwarded-Host");
            
            if (host == null) {
                host = request.getHeader("Host");
            }
            
            if (host == null) {
                host = request.getServerName();
                int port = request.getServerPort();
                if (port != 80 && port != 443) {
                    host += ":" + port;
                }
            }
            
            String forwardedProto = request.getHeader("X-Forwarded-Proto");
            if (forwardedProto != null) {
                scheme = forwardedProto;
            }
            
            return UriComponentsBuilder.newInstance()
                    .scheme(scheme)
                    .host(host.split(":")[0]) // Remove port if present in X-Forwarded-Host
                    .port(extractPort(host, scheme))
                    .build()
                    .toUriString();
        }
        
        // Fallback về config nếu không có request
        if (baseUrl != null && !baseUrl.isEmpty()) {
            return baseUrl;
        }
        
        return "http://localhost:8080";
    }
    
    private int extractPort(String host, String scheme) {
        if (host.contains(":")) {
            return Integer.parseInt(host.split(":")[1]);
        }
        return "https".equals(scheme) ? 443 : 80;
    }
}
