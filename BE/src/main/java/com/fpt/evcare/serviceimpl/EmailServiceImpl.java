package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.dto.request.EmailRequestDTO;
import com.fpt.evcare.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.UnsupportedEncodingException;

@Slf4j
@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    // Lấy config từ application.yml
    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${spring.mail.properties.mail.from-name:EVcare Support}")
    private String fromName;

    @Override
    @Async
    public void sendEmailTemplate(EmailRequestDTO emailDetail) throws MessagingException {

        try {
            // Tạo MimeMessage
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            // Thiết lập các trường email
            helper.setFrom(fromEmail, fromName);
            helper.setTo(emailDetail.getTo());
            helper.setSubject(emailDetail.getSubject());

            // Chuẩn bị nội dung Thymeleaf
            Context context = new Context();
            context.setVariable("subject", emailDetail.getSubject());
            context.setVariable("fullName", emailDetail.getFullName() != null ? emailDetail.getFullName() : "Người dùng");
            context.setVariable("body", emailDetail.getText());
            context.setVariable("code", emailDetail.getCode() != null ? emailDetail.getCode() : "");

            // Xử lý template Thymeleaf
            String htmlContent = templateEngine.process("email-template", context);
            helper.setText(htmlContent, true); // true: nội dung HTML

            // Gửi email
            mailSender.send(mimeMessage);
            log.info("Gửi email thành công tới {}", emailDetail.getTo());
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }
}
