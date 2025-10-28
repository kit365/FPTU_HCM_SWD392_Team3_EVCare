package com.fpt.evcare.util;

import jakarta.servlet.http.HttpServletRequest;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;

public class VnpayUtil {
    
    public static String createHash(String secretKey, Map<String, String> params) {
        // Sắp xếp params theo key
        TreeMap<String, String> sortedParams = new TreeMap<>(params);
        
        // Tạo chuỗi query string
        StringBuilder queryString = new StringBuilder();
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            if (key != null && value != null && !key.isEmpty() && !value.isEmpty()) {
                if (!queryString.isEmpty()) {
                    queryString.append("&");
                }
                queryString.append(key).append("=").append(value);
            }
        }
        
        // Thêm secret key vào cuối
        queryString.append("&").append(secretKey);
        
        // Tạo SHA-512 hash
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-512");
            byte[] hashBytes = md.digest(queryString.toString().getBytes(StandardCharsets.UTF_8));
            
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error creating hash", e);
        }
    }
    
    public static String verifyHash(String secretKey, Map<String, String> params, String vnp_SecureHash) {
        String hash = createHash(secretKey, params);
        return hash.equals(vnp_SecureHash) ? "00" : "07";
    }
    
    public static String getIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("X-Real-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        
        // Xử lý trường hợp có nhiều IP
        if (ipAddress != null && ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0].trim();
        }
        
        return ipAddress;
    }
    
    public static String buildQueryUrl(Map<String, String> params) {
        TreeMap<String, String> sortedParams = new TreeMap<>(params);
        
        StringBuilder queryString = new StringBuilder();
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            if (key != null && value != null && !key.isEmpty() && !value.isEmpty()) {
                if (!queryString.isEmpty()) {
                    queryString.append("&");
                }
                try {
                    queryString.append(key).append("=").append(java.net.URLEncoder.encode(value, StandardCharsets.UTF_8));
                } catch (Exception e) {
                    queryString.append(key).append("=").append(value);
                }
            }
        }
        return queryString.toString();
    }
}
