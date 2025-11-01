package com.fpt.evcare.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

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

    @Value("${spring.application.url:http://localhost:8080}")
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
     */
    public String getReturnUrl() {
        // Replace {baseUrl} với actual baseUrl từ config
        if (returnUrlTemplate.contains("{baseUrl}")) {
            return returnUrlTemplate.replace("{baseUrl}", baseUrl);
        }
        return returnUrlTemplate;
    }
}
