package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.InvoiceConstants;
import com.fpt.evcare.dto.request.EmailRequestDTO;
import com.fpt.evcare.dto.request.invoice.CreationInvoiceRequest;
import com.fpt.evcare.dto.request.invoice.UpdationInvoiceRequest;
import com.fpt.evcare.dto.response.*;
import com.fpt.evcare.entity.*;
import com.fpt.evcare.enums.InvoiceStatusEnum;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.mapper.InvoiceMapper;
import com.fpt.evcare.repository.AppointmentRepository;
import com.fpt.evcare.repository.InvoiceRepository;
import com.fpt.evcare.repository.PaymentMethodRepository;
import com.fpt.evcare.service.EmailService;
import com.fpt.evcare.service.InvoiceService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
public class InvoiceServiceImpl implements InvoiceService {

    InvoiceRepository invoiceRepository;
    InvoiceMapper invoiceMapper;
    AppointmentRepository appointmentRepository;
    PaymentMethodRepository paymentMethodRepository;
    EmailService emailService;

    @Override
    @Transactional
    public InvoiceResponse getInvoiceById(UUID id) {
        log.info(InvoiceConstants.LOG_INFO_SHOWING_INVOICE, id);
        InvoiceEntity invoiceEntity = invoiceRepository.findByInvoiceIdAndIsDeletedFalse(id);
        if (invoiceEntity == null) {
            log.warn(InvoiceConstants.LOG_ERR_INVOICE_NOT_FOUND, id);
            throw new ResourceNotFoundException(InvoiceConstants.MESSAGE_ERR_INVOICE_NOT_FOUND);
        }
        
        InvoiceResponse response = invoiceMapper.toResponse(invoiceEntity);
        
        // Map appointment
        if (invoiceEntity.getAppointment() != null) {
            response.setAppointment(mapToAppointmentResponse(invoiceEntity.getAppointment()));
        }
        
        // Map payment method
        if (invoiceEntity.getPaymentMethod() != null) {
            response.setPaymentMethod(mapToPaymentMethodResponse(invoiceEntity.getPaymentMethod()));
        }
        
        log.info(InvoiceConstants.LOG_SUCCESS_SHOWING_INVOICE, id);
        return response;
    }

    @Override
    @Transactional
    public PageResponse<InvoiceResponse> searchInvoice(String keyword, Pageable pageable) {
        log.info(InvoiceConstants.LOG_INFO_SHOWING_INVOICE_LIST);
        Page<InvoiceEntity> invoiceEntityPage;
        
        if (keyword == null || keyword.isEmpty()) {
            invoiceEntityPage = invoiceRepository.findByIsDeletedFalse(pageable);
        } else {
            invoiceEntityPage = invoiceRepository.findBySearchContainingIgnoreCaseAndIsDeletedFalse(keyword, pageable);
        }
        
        return buildPageResponse(invoiceEntityPage);
    }

    @Override
    @Transactional
    public PageResponse<InvoiceResponse> getInvoicesByCustomerId(UUID customerId, String keyword, Pageable pageable) {
        log.info(InvoiceConstants.LOG_INFO_SHOWING_CUSTOMER_INVOICES, customerId);
        Page<InvoiceEntity> invoiceEntityPage;
        
        if (keyword == null || keyword.isEmpty()) {
            invoiceEntityPage = invoiceRepository.findInvoicesByCustomerAndKeyword(customerId, "", pageable);
        } else {
            invoiceEntityPage = invoiceRepository.findInvoicesByCustomerAndKeyword(customerId, keyword, pageable);
        }
        
        return buildPageResponse(invoiceEntityPage);
    }

    @Override
    @Transactional
    public InvoiceResponse addInvoice(CreationInvoiceRequest request) {
        log.info(InvoiceConstants.LOG_INFO_CREATING_INVOICE);
        // Validate appointment
        AppointmentEntity appointment = null;
        if (request.getAppointmentId() != null) {
            appointment = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(request.getAppointmentId());
            if (appointment == null) {
                log.warn(InvoiceConstants.LOG_ERR_APPOINTMENT_NOT_FOUND, request.getAppointmentId());
                throw new ResourceNotFoundException(InvoiceConstants.MESSAGE_ERR_APPOINTMENT_NOT_FOUND);
            }
        }
        
        // Validate payment method
        PaymentMethodEntity paymentMethod = paymentMethodRepository.findByPaymentMethodIdAndIsDeletedFalse(request.getPaymentMethodId());
        if (paymentMethod == null) {
            log.warn(InvoiceConstants.LOG_ERR_PAYMENT_METHOD_NOT_FOUND, request.getPaymentMethodId());
            throw new ResourceNotFoundException(InvoiceConstants.MESSAGE_ERR_PAYMENT_METHOD_NOT_FOUND);
        }
        
        InvoiceEntity invoiceEntity = invoiceMapper.toEntity(request);
        invoiceEntity.setAppointment(appointment);
        invoiceEntity.setPaymentMethod(paymentMethod);
        invoiceEntity.setInvoiceDate(LocalDateTime.now());
        
        // Build search field
        String search = buildSearchField(invoiceEntity);
        invoiceEntity.setSearch(search);
        
        // Set status
        if (request.getStatus() != null) {
            invoiceEntity.setStatus(InvoiceStatusEnum.valueOf(request.getStatus().toUpperCase()));
        }
        
        InvoiceEntity savedInvoice = invoiceRepository.save(invoiceEntity);
        
        InvoiceResponse response = invoiceMapper.toResponse(savedInvoice);
        response.setAppointment(mapToAppointmentResponse(savedInvoice.getAppointment()));
        response.setPaymentMethod(mapToPaymentMethodResponse(savedInvoice.getPaymentMethod()));
        
        log.info(InvoiceConstants.LOG_SUCCESS_CREATING_INVOICE, savedInvoice.getInvoiceId());
        return response;
    }

    @Override
    @Transactional
    public boolean updateInvoice(UUID id, UpdationInvoiceRequest request) {
        log.info(InvoiceConstants.LOG_INFO_UPDATING_INVOICE, id);
        InvoiceEntity invoiceEntity = invoiceRepository.findByInvoiceIdAndIsDeletedFalse(id);
        if (invoiceEntity == null) {
            log.warn(InvoiceConstants.LOG_ERR_INVOICE_NOT_FOUND, id);
            throw new ResourceNotFoundException(InvoiceConstants.MESSAGE_ERR_INVOICE_NOT_FOUND);
        }
        
        // Update payment method if provided
        if (request.getPaymentMethodId() != null) {
            PaymentMethodEntity paymentMethod = paymentMethodRepository.findByPaymentMethodIdAndIsDeletedFalse(request.getPaymentMethodId());
            if (paymentMethod == null) {
                log.warn(InvoiceConstants.LOG_ERR_PAYMENT_METHOD_NOT_FOUND, request.getPaymentMethodId());
                throw new ResourceNotFoundException(InvoiceConstants.MESSAGE_ERR_PAYMENT_METHOD_NOT_FOUND);
            }
            invoiceEntity.setPaymentMethod(paymentMethod);
        }
        
        // Update status if provided
        if (request.getStatus() != null) {
            invoiceEntity.setStatus(InvoiceStatusEnum.valueOf(request.getStatus().toUpperCase()));
        }
        
        // Lưu paid_amount và status trước khi update
        java.math.BigDecimal oldPaidAmount = invoiceEntity.getPaidAmount();
        InvoiceStatusEnum oldStatus = invoiceEntity.getStatus();
        
        invoiceMapper.toUpdate(invoiceEntity, request);
        
        // Validate paid_amount không được vượt quá total_amount
        if (invoiceEntity.getPaidAmount() != null && invoiceEntity.getTotalAmount() != null) {
            if (invoiceEntity.getPaidAmount().compareTo(invoiceEntity.getTotalAmount()) > 0) {
                log.warn(InvoiceConstants.LOG_ERR_INVALID_PAID_AMOUNT_EXCEEDS_TOTAL, 
                        invoiceEntity.getPaidAmount(), invoiceEntity.getTotalAmount());
                throw new ResourceNotFoundException(InvoiceConstants.MESSAGE_ERR_PAID_AMOUNT_EXCEEDS_TOTAL);
            }
        }
        
        // Auto-update invoice status: Nếu paid_amount == total_amount thì chuyển sang PAID
        if (invoiceEntity.getPaidAmount() != null && invoiceEntity.getTotalAmount() != null) {
            if (invoiceEntity.getPaidAmount().compareTo(invoiceEntity.getTotalAmount()) >= 0) {
                invoiceEntity.setStatus(InvoiceStatusEnum.PAID);
                // Update payment method last_used_at nếu có
                if (invoiceEntity.getPaymentMethod() != null) {
                    PaymentMethodEntity paymentMethod = invoiceEntity.getPaymentMethod();
                    paymentMethod.setLastUsedAt(LocalDateTime.now());
                    paymentMethodRepository.save(paymentMethod);
                    log.info(InvoiceConstants.LOG_INFO_UPDATED_PAYMENT_METHOD_LAST_USED, paymentMethod.getPaymentMethodId());
                }
            } else if (invoiceEntity.getPaidAmount().compareTo(BigDecimal.ZERO) == 0) {
                invoiceEntity.setStatus(InvoiceStatusEnum.PENDING);
            }
        }
        
        // Rebuild search field
        String search = buildSearchField(invoiceEntity);
        invoiceEntity.setSearch(search);
        
        invoiceRepository.save(invoiceEntity);
        
        // Gửi email nếu invoice chuyển sang PAID
        if (oldStatus != InvoiceStatusEnum.PAID && invoiceEntity.getStatus() == InvoiceStatusEnum.PAID) {
            sendPaymentConfirmationEmail(invoiceEntity);
        }
        
        log.info(InvoiceConstants.LOG_SUCCESS_UPDATING_INVOICE, id);
        return true;
    }

    @Override
    @Transactional
    public boolean processCashPayment(UUID id, BigDecimal paidAmount) {
        log.info(InvoiceConstants.LOG_INFO_PROCESSING_CASH_PAYMENT, id);
        InvoiceEntity invoiceEntity = invoiceRepository.findByInvoiceIdAndIsDeletedFalse(id);
        if (invoiceEntity == null) {
            log.warn(InvoiceConstants.LOG_ERR_INVOICE_NOT_FOUND, id);
            throw new ResourceNotFoundException(InvoiceConstants.MESSAGE_ERR_INVOICE_NOT_FOUND);
        }
        
        // Validate paid amount
        if (paidAmount == null || paidAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResourceNotFoundException(InvoiceConstants.MESSAGE_ERR_PAYMENT_AMOUNT_MUST_BE_POSITIVE);
        }
        
        if (paidAmount.compareTo(invoiceEntity.getTotalAmount()) > 0) {
            log.warn(InvoiceConstants.LOG_ERR_INVALID_PAID_AMOUNT_EXCEEDS_TOTAL, paidAmount, invoiceEntity.getTotalAmount());
            throw new ResourceNotFoundException(InvoiceConstants.MESSAGE_ERR_PAID_AMOUNT_EXCEEDS_TOTAL);
        }
        
        // Lưu status cũ
        InvoiceStatusEnum oldStatus = invoiceEntity.getStatus();
        
        // Cập nhật paid_amount
        invoiceEntity.setPaidAmount(paidAmount);
        
        // Auto-update status
        if (paidAmount.compareTo(invoiceEntity.getTotalAmount()) >= 0) {
            invoiceEntity.setStatus(InvoiceStatusEnum.PAID);
            log.info(InvoiceConstants.LOG_INFO_INVOICE_FULLY_PAID, id);
        } else {
            invoiceEntity.setStatus(InvoiceStatusEnum.PENDING);
        }
        
        invoiceRepository.save(invoiceEntity);
        
        // Gửi email nếu invoice chuyển sang PAID
        if (oldStatus != InvoiceStatusEnum.PAID && invoiceEntity.getStatus() == InvoiceStatusEnum.PAID) {
            sendPaymentConfirmationEmail(invoiceEntity);
        }
        
        log.info(InvoiceConstants.LOG_INFO_CASH_PAYMENT_PROCESSED, id);
        return true;
    }

    @Override
    @Transactional
    public boolean deleteInvoice(UUID id) {
        log.info(InvoiceConstants.LOG_INFO_DELETING_INVOICE, id);
        InvoiceEntity invoiceEntity = invoiceRepository.findByInvoiceIdAndIsDeletedFalse(id);
        if (invoiceEntity == null) {
            log.warn(InvoiceConstants.LOG_ERR_INVOICE_NOT_FOUND, id);
            throw new ResourceNotFoundException(InvoiceConstants.MESSAGE_ERR_INVOICE_NOT_FOUND);
        }
        invoiceEntity.setIsDeleted(true);
        invoiceRepository.save(invoiceEntity);
        log.info(InvoiceConstants.LOG_SUCCESS_DELETING_INVOICE, id);
        return true;
    }

    @Override
    @Transactional
    public boolean restoreInvoice(UUID id) {
        log.info(InvoiceConstants.LOG_INFO_RESTORING_INVOICE, id);
        InvoiceEntity invoiceEntity = invoiceRepository.findByInvoiceIdAndIsDeletedTrue(id);
        if (invoiceEntity == null) {
            log.warn(InvoiceConstants.LOG_ERR_INVOICE_NOT_FOUND, id);
            throw new ResourceNotFoundException(InvoiceConstants.MESSAGE_ERR_INVOICE_NOT_FOUND);
        }
        invoiceEntity.setIsDeleted(false);
        invoiceRepository.save(invoiceEntity);
        log.info(InvoiceConstants.LOG_SUCCESS_RESTORING_INVOICE, id);
        return true;
    }
    
    private String buildSearchField(InvoiceEntity invoice) {
        StringBuilder search = new StringBuilder();
        if (invoice.getInvoiceId() != null) {
            search.append(invoice.getInvoiceId().toString().toLowerCase()).append(" ");
        }
        if (invoice.getNotes() != null) {
            search.append(invoice.getNotes().toLowerCase()).append(" ");
        }
        if (invoice.getStatus() != null) {
            search.append(invoice.getStatus().toString().toLowerCase()).append(" ");
        }
        return search.toString().trim();
    }
    
    private PageResponse<InvoiceResponse> buildPageResponse(Page<InvoiceEntity> invoiceEntityPage) {
        java.util.List<InvoiceResponse> invoiceResponses = invoiceEntityPage.map(invoice -> {
            InvoiceResponse response = invoiceMapper.toResponse(invoice);
            if (invoice.getAppointment() != null) {
                response.setAppointment(mapToAppointmentResponse(invoice.getAppointment()));
            }
            if (invoice.getPaymentMethod() != null) {
                response.setPaymentMethod(mapToPaymentMethodResponse(invoice.getPaymentMethod()));
            }
            return response;
        }).getContent();
        
        return PageResponse.<InvoiceResponse>builder()
                .data(invoiceResponses)
                .page(invoiceEntityPage.getNumber())
                .totalElements(invoiceEntityPage.getTotalElements())
                .totalPages(invoiceEntityPage.getTotalPages())
                .build();
    }
    
    private AppointmentResponse mapToAppointmentResponse(AppointmentEntity appointment) {
        AppointmentResponse response = new AppointmentResponse();
        response.setAppointmentId(appointment.getAppointmentId());
        response.setCustomerFullName(appointment.getCustomerFullName());
        response.setCustomerEmail(appointment.getCustomerEmail());
        response.setCustomerPhoneNumber(appointment.getCustomerPhoneNumber());
        return response;
    }
    
    private PaymentMethodResponse mapToPaymentMethodResponse(PaymentMethodEntity paymentMethod) {
        PaymentMethodResponse response = new PaymentMethodResponse();
        response.setPaymentMethodId(paymentMethod.getPaymentMethodId());
        response.setMethodType(paymentMethod.getMethodType());
        response.setProvider(paymentMethod.getProvider());
        response.setAccountNumber(paymentMethod.getAccountNumber());
        return response;
    }

    /**
     * Gửi email xác nhận thanh toán thành công
     */
    private void sendPaymentConfirmationEmail(InvoiceEntity invoice) {
        if (invoice.getAppointment() == null || invoice.getAppointment().getCustomerEmail() == null || 
            invoice.getAppointment().getCustomerEmail().isEmpty()) {
            log.warn(InvoiceConstants.LOG_ERR_CUSTOMER_EMAIL_NULL_OR_EMPTY);
            return;
        }

        try {
            String emailSubject = InvoiceConstants.EMAIL_SUBJECT_PAYMENT_CONFIRMATION;
            String emailBody = String.format(
                InvoiceConstants.EMAIL_BODY_PAYMENT_CONFIRMATION_GREETING +
                InvoiceConstants.EMAIL_BODY_PAYMENT_CONFIRMATION_CONTENT +
                InvoiceConstants.EMAIL_BODY_PAYMENT_CONFIRMATION_INVOICE_INFO +
                InvoiceConstants.EMAIL_BODY_PAYMENT_CONFIRMATION_INVOICE_ID +
                InvoiceConstants.EMAIL_BODY_PAYMENT_CONFIRMATION_AMOUNT +
                InvoiceConstants.EMAIL_BODY_PAYMENT_CONFIRMATION_DATE +
                InvoiceConstants.EMAIL_BODY_PAYMENT_CONFIRMATION_FOOTER,
                invoice.getAppointment().getCustomerFullName(),
                invoice.getInvoiceId(),
                invoice.getTotalAmount().toString(),
                LocalDateTime.now().toString()
            );

            EmailRequestDTO emailRequest = EmailRequestDTO.builder()
                    .to(invoice.getAppointment().getCustomerEmail())
                    .subject(emailSubject)
                    .text(emailBody)
                    .fullName(invoice.getAppointment().getCustomerFullName())
                    .code(null)
                    .build();

            emailService.sendEmailTemplate(emailRequest);
            log.info(InvoiceConstants.LOG_INFO_SENT_PAYMENT_CONFIRMATION_EMAIL, invoice.getAppointment().getCustomerEmail());
        } catch (Exception e) {
            log.error(InvoiceConstants.LOG_ERR_FAILED_SEND_PAYMENT_CONFIRMATION_EMAIL, e.getMessage());
        }
    }
}
