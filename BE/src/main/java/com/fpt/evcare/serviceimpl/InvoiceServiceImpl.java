package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.InvoiceConstants;
import com.fpt.evcare.dto.request.EmailRequestDTO;
import com.fpt.evcare.dto.request.PaymentRequest;
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
    com.fpt.evcare.repository.ShiftRepository shiftRepository;
    com.fpt.evcare.repository.WarrantyPartRepository warrantyPartRepository;
    com.fpt.evcare.repository.CustomerWarrantyPartRepository customerWarrantyPartRepository;
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
    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceByAppointmentId(UUID appointmentId) {
        log.info(InvoiceConstants.LOG_INFO_GETTING_INVOICE_FOR_APPOINTMENT, appointmentId);

        AppointmentEntity appointment = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(appointmentId);
        if (appointment == null) {
            log.warn(InvoiceConstants.LOG_WARN_APPOINTMENT_NOT_FOUND, appointmentId);
            throw new ResourceNotFoundException(InvoiceConstants.MESSAGE_ERR_APPOINTMENT_NOT_FOUND);
        }

        // Force initialization of lazy-loaded relationships within transaction
        initializeAppointmentRelations(appointment);

        // Kiểm tra appointment phải ở trạng thái PENDING_PAYMENT hoặc COMPLETED
        if (appointment.getStatus() != AppointmentStatusEnum.PENDING_PAYMENT &&
            appointment.getStatus() != AppointmentStatusEnum.COMPLETED) {
            log.warn(InvoiceConstants.LOG_WARN_APPOINTMENT_NOT_READY_STATUS, appointmentId);
            throw new IllegalStateException(String.format(InvoiceConstants.MESSAGE_ERR_APPOINTMENT_NOT_READY_FOR_PAYMENT, appointment.getStatus()));
        }

        java.util.List<InvoiceEntity> invoices = invoiceRepository.findByAppointmentAndIsDeletedFalse(appointment);
        if (invoices.isEmpty()) {
            log.warn(InvoiceConstants.LOG_WARN_NO_INVOICE_FOUND_FOR_APPOINTMENT, appointmentId);
            throw new ResourceNotFoundException(InvoiceConstants.MESSAGE_ERR_NO_INVOICE_FOUND_FOR_APPOINTMENT);
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
                    .filter(record -> !record.getIsDeleted() && Boolean.TRUE.equals(record.getApprovedByUser()))
                    .map(record -> {
                        BigDecimal unitPrice = record.getVehiclePart() != null ? record.getVehiclePart().getUnitPrice() : BigDecimal.ZERO;
                        BigDecimal originalPrice = unitPrice.multiply(BigDecimal.valueOf(record.getQuantityUsed()));
                        
                        // Kiểm tra warranty cho phụ tùng này
                        UUID vehiclePartId = record.getVehiclePart() != null ? record.getVehiclePart().getVehiclePartId() : null;
                        com.fpt.evcare.entity.WarrantyPartEntity warrantyPart = null;
                        Boolean isUnderWarranty = false;
                        String warrantyDiscountType = null;
                        BigDecimal warrantyDiscountValue = null;
                        BigDecimal warrantyDiscountAmount = BigDecimal.ZERO;
                        BigDecimal totalPrice = originalPrice;
                        
                        if (vehiclePartId != null) {
                            // Kiểm tra warranty cho cả PENDING_PAYMENT và COMPLETED
                            warrantyPart = warrantyPartRepository
                                .findByVehiclePartVehiclePartIdAndIsDeletedFalseAndIsActiveTrue(vehiclePartId)
                                .orElse(null);
                            
                            if (warrantyPart != null) {
                                // ✅ CHỈ áp dụng warranty discount nếu appointment có isWarrantyAppointment = true
                                if (Boolean.TRUE.equals(appointment.getIsWarrantyAppointment())) {
                                    // Kiểm tra warranty dựa trên CustomerWarrantyPart (logic mới)
                                    UUID customerId = appointment.getCustomer() != null ? appointment.getCustomer().getUserId() : null;
                                    String customerEmail = appointment.getCustomerEmail();
                                    String customerPhoneNumber = appointment.getCustomerPhoneNumber();
                                    
                                    // Tìm CustomerWarrantyPart active cho customer và phụ tùng này
                                    // CHỈ áp dụng warranty nếu đã có appointment COMPLETED trước đó (không phải appointment hiện tại)
                                    com.fpt.evcare.entity.CustomerWarrantyPartEntity customerWarranty = customerWarrantyPartRepository
                                            .findActiveWarrantyByCustomerAndVehiclePart(
                                                    customerId,
                                                    customerEmail,
                                                    customerPhoneNumber,
                                                    vehiclePartId,
                                                    LocalDateTime.now()
                                            )
                                            .orElse(null);
                                    
                                    // Đảm bảo warranty đến từ appointment KHÁC appointment hiện tại
                                    // (Warranty chỉ được áp dụng từ appointment thứ 2 trở đi)
                                    if (customerWarranty != null && 
                                        customerWarranty.getAppointment() != null &&
                                        !customerWarranty.getAppointment().getAppointmentId().equals(appointment.getAppointmentId())) {
                                        
                                        // Customer có warranty active cho phụ tùng này từ appointment trước đó
                                        isUnderWarranty = true;
                                        warrantyDiscountType = warrantyPart.getDiscountType().name();
                                        
                                        if (warrantyPart.getDiscountType() == com.fpt.evcare.enums.WarrantyDiscountTypeEnum.PERCENTAGE) {
                                            warrantyDiscountValue = warrantyPart.getDiscountValue();
                                            warrantyDiscountAmount = originalPrice.multiply(warrantyDiscountValue)
                                                .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
                                            totalPrice = originalPrice.subtract(warrantyDiscountAmount);
                                        } else if (warrantyPart.getDiscountType() == com.fpt.evcare.enums.WarrantyDiscountTypeEnum.FREE) {
                                            warrantyDiscountAmount = originalPrice;
                                            totalPrice = BigDecimal.ZERO;
                                        }
                                    } else if (customerWarranty != null && 
                                               customerWarranty.getAppointment() != null &&
                                               customerWarranty.getAppointment().getAppointmentId().equals(appointment.getAppointmentId())) {
                                        // Warranty đến từ chính appointment hiện tại -> không áp dụng (đây là appointment đầu tiên)
                                        log.debug("⚠️ Skipping warranty discount - warranty from current appointment {} (first appointment, no discount applied)", 
                                                appointment.getAppointmentId());
                                    }
                                } else {
                                    log.debug("⚠️ Skipping warranty discount - appointment {} is not a warranty appointment (isWarrantyAppointment = false)", 
                                            appointment.getAppointmentId());
                                }
                            }
                        }
                        
                        return InvoiceResponse.PartUsed.builder()
                            .partName(record.getVehiclePart() != null ? record.getVehiclePart().getVehiclePartName() : "N/A")
                            .quantity(record.getQuantityUsed())
                            .unitPrice(unitPrice)
                            .totalPrice(totalPrice)
                            .originalPrice(originalPrice)
                            .isUnderWarranty(isUnderWarranty)
                            .warrantyDiscountType(warrantyDiscountType)
                            .warrantyDiscountValue(warrantyDiscountValue)
                            .warrantyDiscountAmount(warrantyDiscountAmount)
                            .build();
                    })
                    .toList();

                return InvoiceResponse.MaintenanceManagementSummary.builder()
                    .serviceName(mm.getServiceType() != null ? mm.getServiceType().getServiceName() : "N/A")
                    .serviceCost(mm.getTotalCost() != null ? mm.getTotalCost() : BigDecimal.ZERO)
                    .partsUsed(partsUsed)
                    .build();
            })
            .toList();

        response.setMaintenanceDetails(maintenanceDetails);

        // Tính lại totalAmount từ maintenanceDetails với warranty discount
        BigDecimal recalculatedTotalAmount = maintenanceDetails.stream()
            .flatMap(mm -> mm.getPartsUsed().stream())
            .map(part -> part.getTotalPrice()) // Sử dụng totalPrice đã có warranty discount
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Cập nhật totalAmount trong response để phản ánh warranty discount
        response.setTotalAmount(recalculatedTotalAmount);
        
        // Cập nhật totalAmount trong invoice entity nếu khác nhau
        if (invoice.getTotalAmount().compareTo(recalculatedTotalAmount) != 0) {
            log.info("📊 Updating invoice totalAmount from {} to {} (with warranty discount)", 
                    invoice.getTotalAmount(), recalculatedTotalAmount);
            invoice.setTotalAmount(recalculatedTotalAmount);
            invoiceRepository.save(invoice);
        }

        log.info(InvoiceConstants.LOG_INFO_SUCCESSFULLY_RETRIEVED_INVOICE, appointmentId);
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
        log.info(InvoiceConstants.LOG_INFO_PROCESSING_CASH_PAYMENT, invoiceId);

        InvoiceEntity invoice = invoiceRepository.findByInvoiceIdAndIsDeletedFalse(invoiceId);
        if (invoice == null) {
            log.warn(InvoiceConstants.LOG_ERR_INVOICE_NOT_FOUND, invoiceId);
            throw new ResourceNotFoundException(InvoiceConstants.MESSAGE_ERR_INVOICE_NOT_FOUND);
        }

        // Kiểm tra invoice phải ở trạng thái PENDING
        if (invoice.getStatus() != InvoiceStatusEnum.PENDING) {
            log.warn(InvoiceConstants.LOG_WARN_INVOICE_NOT_IN_PENDING_STATUS, invoiceId);
            // Gửi email thông báo thanh toán thất bại
            sendPaymentFailedEmail(invoice, InvoiceConstants.MESSAGE_ERR_INVOICE_ALREADY_PAID_OR_CANCELLED);
            throw new IllegalStateException(InvoiceConstants.MESSAGE_ERR_INVOICE_ALREADY_PAID_OR_CANCELLED);
        }

        AppointmentEntity appointment = invoice.getAppointment();
        if (appointment == null || appointment.getStatus() != AppointmentStatusEnum.PENDING_PAYMENT) {
            log.warn(InvoiceConstants.LOG_WARN_APPOINTMENT_NOT_PENDING_PAYMENT);
            // Gửi email thông báo thanh toán thất bại
            sendPaymentFailedEmail(invoice, InvoiceConstants.MESSAGE_ERR_APPOINTMENT_NOT_PENDING_PAYMENT);
            throw new IllegalStateException(InvoiceConstants.MESSAGE_ERR_APPOINTMENT_NOT_PENDING_PAYMENT);
        }

        // ✅ Nếu totalAmount = 0, tự động thanh toán và completed appointment
        if (invoice.getTotalAmount().compareTo(BigDecimal.ZERO) == 0) {
            log.info("💰 Invoice totalAmount is 0 - Auto-completing payment and appointment");
            
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
            invoice.setPaidAmount(BigDecimal.ZERO);
            invoice.setStatus(InvoiceStatusEnum.PAID);
            
            if (paymentRequest.getNotes() != null && !paymentRequest.getNotes().isEmpty()) {
                invoice.setNotes(paymentRequest.getNotes());
            }

            invoiceRepository.save(invoice);
            log.info(InvoiceConstants.LOG_INFO_INVOICE_MARKED_AS_PAID, invoiceId);

            // Cập nhật appointment sang COMPLETED
            appointment.setStatus(AppointmentStatusEnum.COMPLETED);
            appointmentRepository.save(appointment);
            appointmentRepository.flush();
            
            // Refresh appointment từ database
            UUID appointmentIdForRefresh = appointment.getAppointmentId();
            appointment = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(appointmentIdForRefresh);
            if (appointment != null) {
                initializeAppointmentRelations(appointment);
                log.info(InvoiceConstants.LOG_INFO_APPOINTMENT_MARKED_AS_COMPLETED, appointment.getAppointmentId());
            }
            
            // Tự động cập nhật shift status sang COMPLETED
            if (appointment != null) {
                updateShiftStatusWhenAppointmentCompleted(appointment.getAppointmentId());
            } else {
                updateShiftStatusWhenAppointmentCompleted(appointmentIdForRefresh);
            }

            // Reset warranty date cho các phụ tùng được sử dụng trong appointment
            if (appointment != null) {
                resetWarrantyDateForAppointment(appointment);
            } else {
                AppointmentEntity reloadedAppointment = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(appointmentIdForRefresh);
                if (reloadedAppointment != null) {
                    initializeAppointmentRelations(reloadedAppointment);
                    resetWarrantyDateForAppointment(reloadedAppointment);
                }
            }

            // Gửi email xác nhận thanh toán thành công
            sendPaymentConfirmationEmail(invoice);
            
            return true;
        }

        // Validate paidAmount - phải thanh toán đủ số tiền
        BigDecimal paidAmount = paymentRequest.getPaidAmount() != null ? 
                paymentRequest.getPaidAmount() : invoice.getTotalAmount();
        
        if (paidAmount == null || paidAmount.compareTo(BigDecimal.ZERO) <= 0) {
            log.warn(InvoiceConstants.LOG_WARN_INVALID_PAID_AMOUNT, paidAmount);
            sendPaymentFailedEmail(invoice, InvoiceConstants.MESSAGE_ERR_INVALID_PAYMENT_AMOUNT);
            throw new EntityValidationException(InvoiceConstants.MESSAGE_ERR_INVALID_PAYMENT_AMOUNT);
        }
        
        if (paidAmount.compareTo(invoice.getTotalAmount()) < 0) {
            log.warn(InvoiceConstants.LOG_WARN_PAID_AMOUNT_LESS_THAN_TOTAL, paidAmount, invoice.getTotalAmount());
            sendPaymentFailedEmail(invoice, InvoiceConstants.MESSAGE_ERR_PAID_AMOUNT_MUST_EQUAL_TOTAL);
            throw new EntityValidationException(InvoiceConstants.MESSAGE_ERR_PAID_AMOUNT_MUST_EQUAL_TOTAL);
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
        log.info(InvoiceConstants.LOG_INFO_INVOICE_MARKED_AS_PAID, invoiceId);

        // Cập nhật appointment sang COMPLETED
        appointment.setStatus(AppointmentStatusEnum.COMPLETED);
        appointmentRepository.save(appointment);
        appointmentRepository.flush(); // Flush để đảm bảo dữ liệu được ghi vào database ngay lập tức
        
        // Refresh appointment từ database để đảm bảo có dữ liệu mới nhất
        UUID appointmentIdForRefresh = appointment.getAppointmentId();
        appointment = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(appointmentIdForRefresh);
        if (appointment != null) {
            initializeAppointmentRelations(appointment);
            log.info(InvoiceConstants.LOG_INFO_APPOINTMENT_MARKED_AS_COMPLETED, appointment.getAppointmentId());
        } else {
            log.warn("⚠️ Could not refresh appointment after payment: {}", appointmentIdForRefresh);
            log.info(InvoiceConstants.LOG_INFO_APPOINTMENT_MARKED_AS_COMPLETED, appointmentIdForRefresh);
        }
        
        // Log appointment completed
        if (appointment != null) {
            log.info("✅ Appointment marked as COMPLETED - ID: {}, Status: {}", 
                    appointment.getAppointmentId(),
                    appointment.getStatus());
        }

        // ✅ Tự động cập nhật shift status sang COMPLETED khi appointment chuyển sang COMPLETED sau khi thanh toán
        // Để kỹ thuật viên thấy ca làm đã hoàn thành
        if (appointment != null) {
            updateShiftStatusWhenAppointmentCompleted(appointment.getAppointmentId());
        } else {
            updateShiftStatusWhenAppointmentCompleted(appointmentIdForRefresh);
        }

        // ✅ Reset warranty date cho các phụ tùng được sử dụng trong appointment
        if (appointment != null) {
            resetWarrantyDateForAppointment(appointment);
        } else {
            // Nếu appointment null, reload lại
            AppointmentEntity reloadedAppointment = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(appointmentIdForRefresh);
            if (reloadedAppointment != null) {
                initializeAppointmentRelations(reloadedAppointment);
                resetWarrantyDateForAppointment(reloadedAppointment);
            }
        }

        // Gửi email xác nhận thanh toán thành công
        sendPaymentConfirmationEmail(invoice);

        return true;
    }

    /**
     * Gửi email xác nhận thanh toán thành công với thông tin về warranty
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

    /**
     * Gửi email thông báo thanh toán thất bại
     */
    private void sendPaymentFailedEmail(InvoiceEntity invoice, String reason) {
        if (invoice.getAppointment() == null || invoice.getAppointment().getCustomerEmail() == null ||
            invoice.getAppointment().getCustomerEmail().isEmpty()) {
            log.warn(InvoiceConstants.LOG_ERR_CUSTOMER_EMAIL_NULL_OR_EMPTY);
            return;
        }

        try {
            String emailSubject = InvoiceConstants.EMAIL_SUBJECT_PAYMENT_FAILED;
            String emailBody = String.format(
                InvoiceConstants.EMAIL_BODY_PAYMENT_FAILED_GREETING +
                InvoiceConstants.EMAIL_BODY_PAYMENT_FAILED_CONTENT +
                InvoiceConstants.EMAIL_BODY_PAYMENT_FAILED_INVOICE_INFO +
                InvoiceConstants.EMAIL_BODY_PAYMENT_FAILED_INVOICE_ID +
                InvoiceConstants.EMAIL_BODY_PAYMENT_FAILED_AMOUNT +
                InvoiceConstants.EMAIL_BODY_PAYMENT_FAILED_REASON +
                InvoiceConstants.EMAIL_BODY_PAYMENT_FAILED_FOOTER,
                invoice.getAppointment().getCustomerFullName(),
                invoice.getInvoiceId(),
                invoice.getTotalAmount().toString(),
                reason
            );

            EmailRequestDTO emailRequest = EmailRequestDTO.builder()
                    .to(invoice.getAppointment().getCustomerEmail())
                    .subject(emailSubject)
                    .text(emailBody)
                    .fullName(invoice.getAppointment().getCustomerFullName())
                    .code(null)
                    .build();

            emailService.sendEmailTemplate(emailRequest);
            log.info(InvoiceConstants.LOG_INFO_SENT_PAYMENT_FAILED_EMAIL, invoice.getAppointment().getCustomerEmail());
        } catch (Exception e) {
            log.error(InvoiceConstants.LOG_ERR_FAILED_SEND_PAYMENT_FAILED_EMAIL, e.getMessage());
        }
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

    /**
     * Helper method to force initialization of lazy-loaded appointment relationships
     * This must be called within an active transaction
     */
    private void initializeAppointmentRelations(AppointmentEntity appointment) {
        if (appointment == null) {
            return;
        }
        
        // Initialize all lazy-loaded relationships
        if (appointment.getCustomer() != null) {
            appointment.getCustomer().getUserId(); // Access to trigger loading
        }
        if (appointment.getAssignee() != null) {
            appointment.getAssignee().getUserId(); // Access to trigger loading
        }
        if (appointment.getTechnicianEntities() != null) {
            appointment.getTechnicianEntities().size(); // Access to trigger loading
            appointment.getTechnicianEntities().forEach(tech -> tech.getUserId()); // Load each technician
        }
        if (appointment.getServiceTypeEntities() != null) {
            appointment.getServiceTypeEntities().size(); // Access to trigger loading
        }
        if (appointment.getVehicleTypeEntity() != null) {
            appointment.getVehicleTypeEntity().getVehicleTypeId(); // Access to trigger loading
        }
    }

    /**
     * Reset warranty date cho các phụ tùng được sử dụng trong appointment khi thanh toán thành công
     * Tạo hoặc cập nhật CustomerWarrantyPart với warranty_start_date = ngày thanh toán
     */
    private void resetWarrantyDateForAppointment(AppointmentEntity appointment) {
        try {
            log.info("🔄 Resetting warranty date for appointment: {}", appointment.getAppointmentId());
            
            // Lấy tất cả maintenance managements của appointment
            java.util.List<MaintenanceManagementEntity> maintenanceManagements = 
                    maintenanceManagementRepository.findByAppointmentIdAndIsDeletedFalse(appointment.getAppointmentId());
            
            if (maintenanceManagements == null || maintenanceManagements.isEmpty()) {
                log.debug("No maintenance managements found for appointment: {}", appointment.getAppointmentId());
                return;
            }
            
            LocalDateTime warrantyStartDate = LocalDateTime.now(); // Ngày bắt đầu bảo hành = ngày thanh toán
            UUID customerId = appointment.getCustomer() != null ? appointment.getCustomer().getUserId() : null;
            String customerEmail = appointment.getCustomerEmail();
            String customerPhoneNumber = appointment.getCustomerPhoneNumber();
            String customerFullName = appointment.getCustomerFullName();
            
            int resetCount = 0;
            
            // Duyệt qua tất cả maintenance managements
            for (MaintenanceManagementEntity mm : maintenanceManagements) {
                if (mm.getMaintenanceRecords() == null || mm.getMaintenanceRecords().isEmpty()) {
                    continue;
                }
                
                // Duyệt qua tất cả maintenance records đã approved
                for (MaintenanceRecordEntity record : mm.getMaintenanceRecords()) {
                    if (Boolean.TRUE.equals(record.getApprovedByUser()) && 
                        record.getVehiclePart() != null && 
                        !record.getIsDeleted()) {
                        
                        UUID vehiclePartId = record.getVehiclePart().getVehiclePartId();
                        
                        // Kiểm tra phụ tùng này có warranty không
                        WarrantyPartEntity warrantyPart = warrantyPartRepository
                                .findByVehiclePartVehiclePartIdAndIsDeletedFalseAndIsActiveTrue(vehiclePartId)
                                .orElse(null);
                        
                        if (warrantyPart != null) {
                            // Tính warranty_end_date
                            LocalDateTime warrantyEndDate = calculateWarrantyEndDate(
                                    warrantyStartDate, 
                                    warrantyPart.getValidityPeriod(), 
                                    warrantyPart.getValidityPeriodUnit());
                            
                            // Tìm hoặc tạo CustomerWarrantyPart
                            CustomerWarrantyPartEntity existingWarranty = customerWarrantyPartRepository
                                    .findActiveWarrantyByCustomerAndVehiclePart(
                                            customerId,
                                            customerEmail,
                                            customerPhoneNumber,
                                            vehiclePartId,
                                            LocalDateTime.now()
                                    )
                                    .orElse(null);
                            
                            if (existingWarranty != null) {
                                // Update warranty date
                                existingWarranty.setWarrantyStartDate(warrantyStartDate);
                                existingWarranty.setWarrantyEndDate(warrantyEndDate);
                                existingWarranty.setAppointment(appointment);
                                existingWarranty.setQuantity(record.getQuantityUsed());
                                customerWarrantyPartRepository.save(existingWarranty);
                                log.info("✅ Updated warranty date for part {} - Customer: {}, Start: {}, End: {}", 
                                        record.getVehiclePart().getVehiclePartName(),
                                        customerId != null ? customerId : customerEmail,
                                        warrantyStartDate,
                                        warrantyEndDate);
                            } else {
                                // Tạo mới CustomerWarrantyPart
                                CustomerWarrantyPartEntity newWarranty = CustomerWarrantyPartEntity.builder()
                                        .customer(customerId != null ? appointment.getCustomer() : null)
                                        .customerEmail(customerEmail)
                                        .customerPhoneNumber(customerPhoneNumber)
                                        .customerFullName(customerFullName)
                                        .vehiclePart(record.getVehiclePart())
                                        .appointment(appointment)
                                        .warrantyStartDate(warrantyStartDate)
                                        .warrantyEndDate(warrantyEndDate)
                                        .quantity(record.getQuantityUsed())
                                        .build();
                                newWarranty.setIsActive(true);
                                newWarranty.setIsDeleted(false);
                                
                                customerWarrantyPartRepository.save(newWarranty);
                                log.info("✅ Created warranty for part {} - Customer: {}, Start: {}, End: {}", 
                                        record.getVehiclePart().getVehiclePartName(),
                                        customerId != null ? customerId : customerEmail,
                                        warrantyStartDate,
                                        warrantyEndDate);
                            }
                            
                            resetCount++;
                        }
                    }
                }
            }
            
            if (resetCount > 0) {
                log.info("✅ Reset warranty date for {} part(s) in appointment: {}", resetCount, appointment.getAppointmentId());
            } else {
                log.debug("No warranty parts found to reset for appointment: {}", appointment.getAppointmentId());
            }
        } catch (Exception e) {
            log.error("⚠️ Failed to reset warranty date for appointment {}: {}", 
                    appointment.getAppointmentId(), e.getMessage());
            // Không throw exception để không block việc payment
        }
    }
    
    /**
     * Tính warranty_end_date dựa trên warranty_start_date và validity period
     */
    private LocalDateTime calculateWarrantyEndDate(LocalDateTime startDate, Integer validityPeriod, 
                                                   com.fpt.evcare.enums.ValidityPeriodUnitEnum unit) {
        if (startDate == null || validityPeriod == null || unit == null) {
            return startDate;
        }
        
        return switch (unit) {
            case DAY -> startDate.plusDays(validityPeriod);
            case MONTH -> startDate.plusMonths(validityPeriod);
            case YEAR -> startDate.plusYears(validityPeriod);
        };
    }

    /**
     * Tự động cập nhật shift status sang COMPLETED khi appointment chuyển sang COMPLETED sau khi thanh toán
     * Để kỹ thuật viên thấy ca làm đã hoàn thành trong danh sách "Ca làm của tôi"
     */
    private void updateShiftStatusWhenAppointmentCompleted(UUID appointmentId) {
        try {
            // Tìm tất cả shifts liên quan đến appointment này
            org.springframework.data.domain.Page<com.fpt.evcare.entity.ShiftEntity> shiftPage = 
                    shiftRepository.findByAppointmentId(appointmentId, 
                    org.springframework.data.domain.PageRequest.of(0, 100)); // Lấy tối đa 100 shifts
            
            java.util.List<com.fpt.evcare.entity.ShiftEntity> shifts = shiftPage.getContent();
            
            if (shifts.isEmpty()) {
                log.debug(InvoiceConstants.LOG_DEBUG_NO_SHIFTS_FOUND_TO_UPDATE_COMPLETED, appointmentId);
                return;
            }
            
            // Cập nhật tất cả shifts có status IN_PROGRESS hoặc SCHEDULED sang COMPLETED
            int updatedCount = 0;
            for (com.fpt.evcare.entity.ShiftEntity shift : shifts) {
                if (shift.getStatus() == com.fpt.evcare.enums.ShiftStatusEnum.IN_PROGRESS || 
                    shift.getStatus() == com.fpt.evcare.enums.ShiftStatusEnum.SCHEDULED) {
                    shift.setStatus(com.fpt.evcare.enums.ShiftStatusEnum.COMPLETED);
                    // Cập nhật search field để bao gồm status mới
                    String search = com.fpt.evcare.utils.UtilFunction.concatenateSearchField(
                            shift.getAppointment() != null ? shift.getAppointment().getCustomerFullName() : "",
                            shift.getAppointment() != null ? shift.getAppointment().getVehicleNumberPlate() : "",
                            "COMPLETED"
                    );
                    shift.setSearch(search);
                    shiftRepository.save(shift);
                    updatedCount++;
                    log.info(InvoiceConstants.LOG_INFO_AUTO_UPDATED_SHIFT_TO_COMPLETED, 
                            shift.getShiftId(), appointmentId);
                }
            }
            
            if (updatedCount > 0) {
                log.info(InvoiceConstants.LOG_INFO_UPDATED_SHIFTS_TO_COMPLETED, updatedCount, appointmentId);
            } else {
                log.debug(InvoiceConstants.LOG_DEBUG_NO_SHIFTS_NEEDED_UPDATE_COMPLETED, appointmentId);
            }
        } catch (Exception e) {
            log.error(InvoiceConstants.LOG_ERR_FAILED_UPDATE_SHIFT_STATUS_ON_PAYMENT, 
                    appointmentId, e.getMessage());
            // Không throw exception để không block việc payment
        }
    }
}
