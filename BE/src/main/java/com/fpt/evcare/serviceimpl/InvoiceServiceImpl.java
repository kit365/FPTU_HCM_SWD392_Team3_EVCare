package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.InvoiceConstants;
import com.fpt.evcare.dto.request.EmailRequestDTO;
import com.fpt.evcare.dto.request.PaymentRequest;
import com.fpt.evcare.dto.request.invoice.CreationInvoiceRequest;
import com.fpt.evcare.dto.request.invoice.UpdationInvoiceRequest;
import com.fpt.evcare.dto.response.*;
import com.fpt.evcare.entity.*;
import com.fpt.evcare.enums.AppointmentStatusEnum;
import com.fpt.evcare.enums.InvoiceStatusEnum;
import com.fpt.evcare.enums.MethodTypeEnum;
import com.fpt.evcare.exception.EntityValidationException;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.mapper.InvoiceMapper;
import com.fpt.evcare.repository.AppointmentRepository;
import com.fpt.evcare.repository.InvoiceRepository;
import com.fpt.evcare.repository.MaintenanceManagementRepository;
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
    MaintenanceManagementRepository maintenanceManagementRepository;
    EmailService emailService;
//
//    @Override
//    @Transactional
//    public InvoiceResponse getInvoiceById(UUID id) {
//        log.info(InvoiceConstants.LOG_INFO_SHOWING_INVOICE, id);
//        InvoiceEntity invoiceEntity = invoiceRepository.findByInvoiceIdAndIsDeletedFalse(id);
//        if (invoiceEntity == null) {
//            log.warn(InvoiceConstants.LOG_ERR_INVOICE_NOT_FOUND, id);
//            throw new ResourceNotFoundException(InvoiceConstants.MESSAGE_ERR_INVOICE_NOT_FOUND);
//        }
//
//        InvoiceResponse response = invoiceMapper.toResponse(invoiceEntity);
//
//        log.info(InvoiceConstants.LOG_SUCCESS_SHOWING_INVOICE, id);
//        return response;
//    }
//
    @Override
    public InvoiceResponse getInvoiceByAppointmentId(UUID appointmentId) {
        log.info("Getting invoice for appointment: {}", appointmentId);

        AppointmentEntity appointment = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(appointmentId);
        if (appointment == null) {
            log.warn("Appointment not found: {}", appointmentId);
            throw new ResourceNotFoundException("Không tìm thấy appointment");
        }

        // Kiểm tra appointment phải ở trạng thái PENDING_PAYMENT hoặc COMPLETED
        if (appointment.getStatus() != AppointmentStatusEnum.PENDING_PAYMENT &&
            appointment.getStatus() != AppointmentStatusEnum.COMPLETED) {
            log.warn("Appointment {} is not in PENDING_PAYMENT or COMPLETED status", appointmentId);
            throw new IllegalStateException("Appointment chưa sẵn sàng để thanh toán. Trạng thái hiện tại: " + appointment.getStatus());
        }

        java.util.List<InvoiceEntity> invoices = invoiceRepository.findByAppointmentAndIsDeletedFalse(appointment);
        if (invoices.isEmpty()) {
            log.warn("No invoice found for appointment: {}", appointmentId);
            throw new ResourceNotFoundException("Không tìm thấy hóa đơn cho appointment này");
        }

        InvoiceEntity invoice = invoices.get(0); // Lấy invoice đầu tiên (mỗi appointment chỉ có 1 invoice)
        InvoiceResponse response = invoiceMapper.toResponse(invoice);

        // Populate appointment details
        if (appointment.getVehicleNumberPlate() != null) {
            response.setVehicleNumberPlate(appointment.getVehicleNumberPlate());
        }
        if (appointment.getVehicleTypeEntity() != null) {
            response.setVehicleTypeName(appointment.getVehicleTypeEntity().getVehicleTypeName());
            response.setVehicleManufacturer(appointment.getVehicleTypeEntity().getManufacturer());
        }
        if (appointment.getServiceMode() != null) {
            response.setServiceMode(appointment.getServiceMode().name());
        }
        response.setScheduledAt(appointment.getScheduledAt());

        // Populate maintenance management details (services + parts used)
        java.util.List<com.fpt.evcare.entity.MaintenanceManagementEntity> maintenanceList = 
            maintenanceManagementRepository.findByAppointmentIdAndIsDeletedFalse(appointmentId);
        
        java.util.List<InvoiceResponse.MaintenanceManagementSummary> maintenanceDetails = maintenanceList.stream()
            .map(mm -> {
                java.util.List<InvoiceResponse.PartUsed> partsUsed = mm.getMaintenanceRecords().stream()
                    .filter(record -> !record.getIsDeleted())
                    .map(record -> InvoiceResponse.PartUsed.builder()
                        .partName(record.getVehiclePart() != null ? record.getVehiclePart().getVehiclePartName() : "N/A")
                        .quantity(record.getQuantityUsed())
                        .unitPrice(record.getVehiclePart() != null ? record.getVehiclePart().getUnitPrice() : BigDecimal.ZERO)
                        .totalPrice(BigDecimal.valueOf(record.getQuantityUsed())
                            .multiply(record.getVehiclePart() != null ? record.getVehiclePart().getUnitPrice() : BigDecimal.ZERO))
                        .build())
                    .toList();

                return InvoiceResponse.MaintenanceManagementSummary.builder()
                    .serviceName(mm.getServiceType() != null ? mm.getServiceType().getServiceName() : "N/A")
                    .serviceCost(mm.getTotalCost() != null ? mm.getTotalCost() : BigDecimal.ZERO)
                    .partsUsed(partsUsed)
                    .build();
            })
            .toList();

        response.setMaintenanceDetails(maintenanceDetails);

        log.info("Successfully retrieved invoice for appointment: {}", appointmentId);
        return response;
    }
//
//    @Override
//    @Transactional
//    public PageResponse<InvoiceResponse> searchInvoice(String keyword, Pageable pageable) {
//        log.info(InvoiceConstants.LOG_INFO_SHOWING_INVOICE_LIST);
//        Page<InvoiceEntity> invoiceEntityPage;
//
//        if (keyword == null || keyword.isEmpty()) {
//            invoiceEntityPage = invoiceRepository.findByIsDeletedFalse(pageable);
//        } else {
//            invoiceEntityPage = invoiceRepository.findBySearchContainingIgnoreCaseAndIsDeletedFalse(keyword, pageable);
//        }
//
//        return buildPageResponse(invoiceEntityPage);
//    }
//
//    @Override
//    @Transactional
//    public PageResponse<InvoiceResponse> getInvoicesByCustomerId(UUID customerId, String keyword, Pageable pageable) {
//        log.info(InvoiceConstants.LOG_INFO_SHOWING_CUSTOMER_INVOICES, customerId);
//        Page<InvoiceEntity> invoiceEntityPage;
//
//        if (keyword == null || keyword.isEmpty()) {
//            invoiceEntityPage = invoiceRepository.findInvoicesByCustomerAndKeyword(customerId, "", pageable);
//        } else {
//            invoiceEntityPage = invoiceRepository.findInvoicesByCustomerAndKeyword(customerId, keyword, pageable);
//        }
//
//        return buildPageResponse(invoiceEntityPage);
//    }
//
//    @Override
//    @Transactional
//    public InvoiceResponse addInvoice(CreationInvoiceRequest request) {
//        log.info(InvoiceConstants.LOG_INFO_CREATING_INVOICE);
//        // Validate appointment
//        AppointmentEntity appointment = null;
//        if (request.getAppointmentId() != null) {
//            appointment = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(request.getAppointmentId());
//            if (appointment == null) {
//                log.warn(InvoiceConstants.LOG_ERR_APPOINTMENT_NOT_FOUND, request.getAppointmentId());
//                throw new ResourceNotFoundException(InvoiceConstants.MESSAGE_ERR_APPOINTMENT_NOT_FOUND);
//            }
//        }
//
//        // Validate payment method
//        PaymentMethodEntity paymentMethod = paymentMethodRepository.findByPaymentMethodIdAndIsDeletedFalse(request.getPaymentMethodId());
//        if (paymentMethod == null) {
//            log.warn(InvoiceConstants.LOG_ERR_PAYMENT_METHOD_NOT_FOUND, request.getPaymentMethodId());
//            throw new ResourceNotFoundException(InvoiceConstants.MESSAGE_ERR_PAYMENT_METHOD_NOT_FOUND);
//        }
//
//        InvoiceEntity invoiceEntity = invoiceMapper.toEntity(request);
//        invoiceEntity.setAppointment(appointment);
//        invoiceEntity.setPaymentMethod(paymentMethod);
//        invoiceEntity.setInvoiceDate(LocalDateTime.now());
//
//        // Build search field
//        String search = buildSearchField(invoiceEntity);
//        invoiceEntity.setSearch(search);
//
//        // Set status
//        if (request.getStatus() != null) {
//            invoiceEntity.setStatus(InvoiceStatusEnum.valueOf(request.getStatus().toUpperCase()));
//        }
//
//        InvoiceEntity savedInvoice = invoiceRepository.save(invoiceEntity);
//
//        InvoiceResponse response = invoiceMapper.toResponse(savedInvoice);
//        response.setAppointment(mapToAppointmentResponse(savedInvoice.getAppointment()));
//        response.setPaymentMethod(mapToPaymentMethodResponse(savedInvoice.getPaymentMethod()));
//
//        log.info(InvoiceConstants.LOG_SUCCESS_CREATING_INVOICE, savedInvoice.getInvoiceId());
//        return response;
//    }
//
//    @Override
//    @Transactional
//    public boolean updateInvoice(UUID id, UpdationInvoiceRequest request) {
//        log.info(InvoiceConstants.LOG_INFO_UPDATING_INVOICE, id);
//        InvoiceEntity invoiceEntity = invoiceRepository.findByInvoiceIdAndIsDeletedFalse(id);
//        if (invoiceEntity == null) {
//            log.warn(InvoiceConstants.LOG_ERR_INVOICE_NOT_FOUND, id);
//            throw new ResourceNotFoundException(InvoiceConstants.MESSAGE_ERR_INVOICE_NOT_FOUND);
//        }
//
//        // Update payment method if provided
//        if (request.getPaymentMethodId() != null) {
//            PaymentMethodEntity paymentMethod = paymentMethodRepository.findByPaymentMethodIdAndIsDeletedFalse(request.getPaymentMethodId());
//            if (paymentMethod == null) {
//                log.warn(InvoiceConstants.LOG_ERR_PAYMENT_METHOD_NOT_FOUND, request.getPaymentMethodId());
//                throw new ResourceNotFoundException(InvoiceConstants.MESSAGE_ERR_PAYMENT_METHOD_NOT_FOUND);
//            }
//            invoiceEntity.setPaymentMethod(paymentMethod);
//        }
//
//        // Update status if provided
//        if (request.getStatus() != null) {
//            invoiceEntity.setStatus(InvoiceStatusEnum.valueOf(request.getStatus().toUpperCase()));
//        }
//
//        // Lưu paid_amount và status trước khi update
//        java.math.BigDecimal oldPaidAmount = invoiceEntity.getPaidAmount();
//        InvoiceStatusEnum oldStatus = invoiceEntity.getStatus();
//
//        invoiceMapper.toUpdate(invoiceEntity, request);
//
//        // Validate paid_amount không được vượt quá total_amount
//        if (invoiceEntity.getPaidAmount() != null && invoiceEntity.getTotalAmount() != null) {
//            if (invoiceEntity.getPaidAmount().compareTo(invoiceEntity.getTotalAmount()) > 0) {
//                log.warn(InvoiceConstants.LOG_ERR_INVALID_PAID_AMOUNT_EXCEEDS_TOTAL,
//                        invoiceEntity.getPaidAmount(), invoiceEntity.getTotalAmount());
//                throw new ResourceNotFoundException(InvoiceConstants.MESSAGE_ERR_PAID_AMOUNT_EXCEEDS_TOTAL);
//            }
//        }
//
//        // Auto-update invoice status: Nếu paid_amount == total_amount thì chuyển sang PAID
//        if (invoiceEntity.getPaidAmount() != null && invoiceEntity.getTotalAmount() != null) {
//            if (invoiceEntity.getPaidAmount().compareTo(invoiceEntity.getTotalAmount()) >= 0) {
//                invoiceEntity.setStatus(InvoiceStatusEnum.PAID);
//                // Update payment method last_used_at nếu có
//                if (invoiceEntity.getPaymentMethod() != null) {
//                    PaymentMethodEntity paymentMethod = invoiceEntity.getPaymentMethod();
//                    paymentMethod.setLastUsedAt(LocalDateTime.now());
//                    paymentMethodRepository.save(paymentMethod);
//                    log.info(InvoiceConstants.LOG_INFO_UPDATED_PAYMENT_METHOD_LAST_USED, paymentMethod.getPaymentMethodId());
//                }
//            } else if (invoiceEntity.getPaidAmount().compareTo(BigDecimal.ZERO) == 0) {
//                invoiceEntity.setStatus(InvoiceStatusEnum.PENDING);
//            }
//        }
//
//        // Rebuild search field
//        String search = buildSearchField(invoiceEntity);
//        invoiceEntity.setSearch(search);
//
//        invoiceRepository.save(invoiceEntity);
//
//        // Gửi email nếu invoice chuyển sang PAID
//        if (oldStatus != InvoiceStatusEnum.PAID && invoiceEntity.getStatus() == InvoiceStatusEnum.PAID) {
//            sendPaymentConfirmationEmail(invoiceEntity);
//        }
//
//        log.info(InvoiceConstants.LOG_SUCCESS_UPDATING_INVOICE, id);
//        return true;
//    }
//
//    @Override
//    @Transactional
//    public boolean processCashPayment(UUID id, BigDecimal paidAmount) {
//        log.info(InvoiceConstants.LOG_INFO_PROCESSING_CASH_PAYMENT, id);
//        InvoiceEntity invoiceEntity = invoiceRepository.findByInvoiceIdAndIsDeletedFalse(id);
//        if (invoiceEntity == null) {
//            log.warn(InvoiceConstants.LOG_ERR_INVOICE_NOT_FOUND, id);
//            throw new ResourceNotFoundException(InvoiceConstants.MESSAGE_ERR_INVOICE_NOT_FOUND);
//        }
//
//        // Validate paid amount
//        if (paidAmount == null || paidAmount.compareTo(BigDecimal.ZERO) <= 0) {
//            throw new ResourceNotFoundException(InvoiceConstants.MESSAGE_ERR_PAYMENT_AMOUNT_MUST_BE_POSITIVE);
//        }
//
//        if (paidAmount.compareTo(invoiceEntity.getTotalAmount()) > 0) {
//            log.warn(InvoiceConstants.LOG_ERR_INVALID_PAID_AMOUNT_EXCEEDS_TOTAL, paidAmount, invoiceEntity.getTotalAmount());
//            throw new ResourceNotFoundException(InvoiceConstants.MESSAGE_ERR_PAID_AMOUNT_EXCEEDS_TOTAL);
//        }
//
//        // Lưu status cũ
//        InvoiceStatusEnum oldStatus = invoiceEntity.getStatus();
//
//        // Cập nhật paid_amount
//        invoiceEntity.setPaidAmount(paidAmount);
//
//        // Auto-update status
//        if (paidAmount.compareTo(invoiceEntity.getTotalAmount()) >= 0) {
//            invoiceEntity.setStatus(InvoiceStatusEnum.PAID);
//            log.info(InvoiceConstants.LOG_INFO_INVOICE_FULLY_PAID, id);
//        } else {
//            invoiceEntity.setStatus(InvoiceStatusEnum.PENDING);
//        }
//
//        invoiceRepository.save(invoiceEntity);
//
//        // Gửi email nếu invoice chuyển sang PAID
//        if (oldStatus != InvoiceStatusEnum.PAID && invoiceEntity.getStatus() == InvoiceStatusEnum.PAID) {
//            sendPaymentConfirmationEmail(invoiceEntity);
//        }
//
//        log.info(InvoiceConstants.LOG_INFO_CASH_PAYMENT_PROCESSED, id);
//        return true;
//    }

    @Override
    @Transactional
    public boolean payCash(UUID invoiceId, PaymentRequest paymentRequest) {
        log.info("Processing CASH payment for invoice: {}", invoiceId);

        InvoiceEntity invoice = invoiceRepository.findByInvoiceIdAndIsDeletedFalse(invoiceId);
        if (invoice == null) {
            log.warn("Invoice not found: {}", invoiceId);
            throw new ResourceNotFoundException("Không tìm thấy hóa đơn");
        }

        // Kiểm tra invoice phải ở trạng thái PENDING
        if (invoice.getStatus() != InvoiceStatusEnum.PENDING) {
            log.warn("Invoice {} is not in PENDING status", invoiceId);
            throw new IllegalStateException("Hóa đơn đã được thanh toán hoặc đã hủy");
        }

        AppointmentEntity appointment = invoice.getAppointment();
        if (appointment == null || appointment.getStatus() != AppointmentStatusEnum.PENDING_PAYMENT) {
            log.warn("Appointment is not in PENDING_PAYMENT status");
            throw new IllegalStateException("Appointment không ở trạng thái chờ thanh toán");
        }

        // Validate paidAmount - phải thanh toán đủ số tiền
        BigDecimal paidAmount = paymentRequest.getPaidAmount() != null ? 
                paymentRequest.getPaidAmount() : invoice.getTotalAmount();
        
        if (paidAmount == null || paidAmount.compareTo(BigDecimal.ZERO) <= 0) {
            log.warn("Invalid paid amount: {}", paidAmount);
            throw new EntityValidationException("Số tiền thanh toán không hợp lệ");
        }
        
        if (paidAmount.compareTo(invoice.getTotalAmount()) < 0) {
            log.warn("Paid amount {} is less than total amount {}", paidAmount, invoice.getTotalAmount());
            throw new EntityValidationException("Số tiền thanh toán phải bằng tổng tiền hóa đơn");
        }

        // Tìm payment method CASH (hoặc tạo mới nếu chưa có)
        PaymentMethodEntity cashPaymentMethod = paymentMethodRepository
                .findByMethodTypeAndIsDeletedFalse(MethodTypeEnum.CASH)
                .orElseGet(() -> {
                    PaymentMethodEntity newCash = new PaymentMethodEntity();
                    newCash.setMethodType(MethodTypeEnum.CASH);
                    newCash.setProvider("Tiền mặt");
                    newCash.setIsActive(true);
                    newCash.setIsDeleted(false);
                    return paymentMethodRepository.save(newCash);
                });

        // Cập nhật invoice
        invoice.setPaymentMethod(cashPaymentMethod);
        invoice.setPaidAmount(paidAmount);
        invoice.setStatus(InvoiceStatusEnum.PAID);
        
        if (paymentRequest.getNotes() != null && !paymentRequest.getNotes().isEmpty()) {
            invoice.setNotes(paymentRequest.getNotes());
        }

        invoiceRepository.save(invoice);
        log.info("Invoice {} marked as PAID", invoiceId);

        // Cập nhật appointment sang COMPLETED
        appointment.setStatus(AppointmentStatusEnum.COMPLETED);
        appointmentRepository.save(appointment);
        log.info("Appointment {} marked as COMPLETED", appointment.getAppointmentId());

        return true;
    }

//    @Override
//    @Transactional
//    public boolean deleteInvoice(UUID id) {
//        log.info(InvoiceConstants.LOG_INFO_DELETING_INVOICE, id);
//        InvoiceEntity invoiceEntity = invoiceRepository.findByInvoiceIdAndIsDeletedFalse(id);
//        if (invoiceEntity == null) {
//            log.warn(InvoiceConstants.LOG_ERR_INVOICE_NOT_FOUND, id);
//            throw new ResourceNotFoundException(InvoiceConstants.MESSAGE_ERR_INVOICE_NOT_FOUND);
//        }
//        invoiceEntity.setIsDeleted(true);
//        invoiceRepository.save(invoiceEntity);
//        log.info(InvoiceConstants.LOG_SUCCESS_DELETING_INVOICE, id);
//        return true;
//    }

//    @Override
//    @Transactional
//    public boolean restoreInvoice(UUID id) {
//        log.info(InvoiceConstants.LOG_INFO_RESTORING_INVOICE, id);
//        InvoiceEntity invoiceEntity = invoiceRepository.findByInvoiceIdAndIsDeletedTrue(id);
//        if (invoiceEntity == null) {
//            log.warn(InvoiceConstants.LOG_ERR_INVOICE_NOT_FOUND, id);
//            throw new ResourceNotFoundException(InvoiceConstants.MESSAGE_ERR_INVOICE_NOT_FOUND);
//        }
//        invoiceEntity.setIsDeleted(false);
//        invoiceRepository.save(invoiceEntity);
//        log.info(InvoiceConstants.LOG_SUCCESS_RESTORING_INVOICE, id);
//        return true;
//    }
    
//    private String buildSearchField(InvoiceEntity invoice) {
//        StringBuilder search = new StringBuilder();
//        if (invoice.getInvoiceId() != null) {
//            search.append(invoice.getInvoiceId().toString().toLowerCase()).append(" ");
//        }
//        if (invoice.getNotes() != null) {
//            search.append(invoice.getNotes().toLowerCase()).append(" ");
//        }
//        if (invoice.getStatus() != null) {
//            search.append(invoice.getStatus().toString().toLowerCase()).append(" ");
//        }
//        return search.toString().trim();
//    }
    
//    private PageResponse<InvoiceResponse> buildPageResponse(Page<InvoiceEntity> invoiceEntityPage) {
//        java.util.List<InvoiceResponse> invoiceResponses = invoiceEntityPage.map(invoice -> {
//            InvoiceResponse response = invoiceMapper.toResponse(invoice);
//            if (invoice.getAppointment() != null) {
//                response.setAppointment(mapToAppointmentResponse(invoice.getAppointment()));
//            }
//            if (invoice.getPaymentMethod() != null) {
//                response.setPaymentMethod(mapToPaymentMethodResponse(invoice.getPaymentMethod()));
//            }
//            return response;
//        }).getContent();
//
//        return PageResponse.<InvoiceResponse>builder()
//                .data(invoiceResponses)
//                .page(invoiceEntityPage.getNumber())
//                .totalElements(invoiceEntityPage.getTotalElements())
//                .totalPages(invoiceEntityPage.getTotalPages())
//                .build();
//    }
    
//    private AppointmentResponse mapToAppointmentResponse(AppointmentEntity appointment) {
//        AppointmentResponse response = new AppointmentResponse();
//        response.setAppointmentId(appointment.getAppointmentId());
//        response.setCustomerFullName(appointment.getCustomerFullName());
//        response.setCustomerEmail(appointment.getCustomerEmail());
//        response.setCustomerPhoneNumber(appointment.getCustomerPhoneNumber());
//        return response;
//    }
//
//    private PaymentMethodResponse mapToPaymentMethodResponse(PaymentMethodEntity paymentMethod) {
//        PaymentMethodResponse response = new PaymentMethodResponse();
//        response.setPaymentMethodId(paymentMethod.getPaymentMethodId());
//        response.setMethodType(paymentMethod.getMethodType());
//        response.setProvider(paymentMethod.getProvider());
//        response.setAccountNumber(paymentMethod.getAccountNumber());
//        return response;
//    }

    /**
     * Gửi email xác nhận thanh toán thành công
     */
//    private void sendPaymentConfirmationEmail(InvoiceEntity invoice) {
//        if (invoice.getAppointment() == null || invoice.getAppointment().getCustomerEmail() == null ||
//            invoice.getAppointment().getCustomerEmail().isEmpty()) {
//            log.warn(InvoiceConstants.LOG_ERR_CUSTOMER_EMAIL_NULL_OR_EMPTY);
//            return;
//        }
//
//        try {
//            String emailSubject = InvoiceConstants.EMAIL_SUBJECT_PAYMENT_CONFIRMATION;
//            String emailBody = String.format(
//                InvoiceConstants.EMAIL_BODY_PAYMENT_CONFIRMATION_GREETING +
//                InvoiceConstants.EMAIL_BODY_PAYMENT_CONFIRMATION_CONTENT +
//                InvoiceConstants.EMAIL_BODY_PAYMENT_CONFIRMATION_INVOICE_INFO +
//                InvoiceConstants.EMAIL_BODY_PAYMENT_CONFIRMATION_INVOICE_ID +
//                InvoiceConstants.EMAIL_BODY_PAYMENT_CONFIRMATION_AMOUNT +
//                InvoiceConstants.EMAIL_BODY_PAYMENT_CONFIRMATION_DATE +
//                InvoiceConstants.EMAIL_BODY_PAYMENT_CONFIRMATION_FOOTER,
//                invoice.getAppointment().getCustomerFullName(),
//                invoice.getInvoiceId(),
//                invoice.getTotalAmount().toString(),
//                LocalDateTime.now().toString()
//            );
//
//            EmailRequestDTO emailRequest = EmailRequestDTO.builder()
//                    .to(invoice.getAppointment().getCustomerEmail())
//                    .subject(emailSubject)
//                    .text(emailBody)
//                    .fullName(invoice.getAppointment().getCustomerFullName())
//                    .code(null)
//                    .build();
//
//            emailService.sendEmailTemplate(emailRequest);
//            log.info(InvoiceConstants.LOG_INFO_SENT_PAYMENT_CONFIRMATION_EMAIL, invoice.getAppointment().getCustomerEmail());
//        } catch (Exception e) {
//            log.error(InvoiceConstants.LOG_ERR_FAILED_SEND_PAYMENT_CONFIRMATION_EMAIL, e.getMessage());
//        }
//    }
}
