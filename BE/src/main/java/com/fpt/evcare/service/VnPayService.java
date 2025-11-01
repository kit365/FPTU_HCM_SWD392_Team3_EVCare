package com.fpt.evcare.service;

import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

public interface VnPayService {
    String createPayment(String id, String source, HttpServletRequest ipAddr);
    String handleIPN(Map<String, String> params);
    String getIpAddress(HttpServletRequest request);
    String getRandomNumber(int len);
    String hmacSHA512(String key, String data);
    String getSourceFromTransaction(String transactionReference);
    String getAppointmentIdFromTransaction(String transactionReference);
}
