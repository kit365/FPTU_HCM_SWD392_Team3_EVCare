package com.fpt.evcare.service;


import com.fpt.evcare.dto.request.EmailRequestDTO;
import jakarta.mail.MessagingException;
import org.springframework.stereotype.Service;

@Service
public interface EmailService {

    void sendEmailTemplate(EmailRequestDTO emailDetail) throws MessagingException;
}
