package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.config.VnPayConfig;
import com.fpt.evcare.entity.AppointmentEntity;
import com.fpt.evcare.entity.InvoiceEntity;
import com.fpt.evcare.entity.PaymentMethodEntity;
import com.fpt.evcare.entity.PaymentTransactionEntity;
import com.fpt.evcare.enums.AppointmentStatusEnum;
import com.fpt.evcare.enums.InvoiceStatusEnum;
import com.fpt.evcare.enums.MethodTypeEnum;
import com.fpt.evcare.enums.PaymentGatewayEnum;
import com.fpt.evcare.enums.PaymentTransactionStatusEnum;
import com.fpt.evcare.repository.AppointmentRepository;
import com.fpt.evcare.repository.InvoiceRepository;
import com.fpt.evcare.repository.PaymentMethodRepository;
import com.fpt.evcare.repository.PaymentTransactionRepository;
import com.fpt.evcare.service.AppointmentService;
import com.fpt.evcare.service.InvoiceService;
import com.fpt.evcare.service.VnPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class VnPayServiceImpl implements VnPayService {

    private final AppointmentService appointmentService;
    private final AppointmentRepository appointmentRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceService invoiceService;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final VnPayConfig vnPayConfig;
    private final com.fpt.evcare.repository.ShiftRepository shiftRepository;
    private final com.fpt.evcare.repository.MaintenanceManagementRepository maintenanceManagementRepository;
    private final com.fpt.evcare.repository.WarrantyPartRepository warrantyPartRepository;
    private final com.fpt.evcare.repository.CustomerWarrantyPartRepository customerWarrantyPartRepository;
    private final com.fpt.evcare.repository.MaintenanceRecordRepository maintenanceRecordRepository;


    @Override
    @Transactional
    public String createPayment(String id, String source, HttpServletRequest ipAddr) {
        try {
            AppointmentEntity appointment = appointmentService.getAppointmentEntityById(UUID.fromString(id));

            if (appointment.getStatus().equals(AppointmentStatusEnum.CANCELLED)) {
                throw new IllegalArgumentException("Đơn hàng đã bị hủy hoặc không hợp lệ");
            }

            // Lấy invoice từ appointment
            List<InvoiceEntity> invoices = invoiceRepository.findByAppointmentAndIsDeletedFalse(appointment);
            if (invoices.isEmpty()) {
                throw new IllegalArgumentException("Không tìm thấy hóa đơn cho appointment này. Vui lòng tạo hóa đơn trước khi thanh toán.");
            }
            
            InvoiceEntity invoice = invoices.get(0); // Lấy invoice đầu tiên
            
            // Validate invoice status phải ở PENDING (giống cash payment)
            if (invoice.getStatus() != InvoiceStatusEnum.PENDING) {
                throw new IllegalStateException("Hóa đơn đã được thanh toán hoặc đã hủy");
            }
            
            // Validate appointment status phải ở PENDING_PAYMENT (giống cash payment)
            if (appointment.getStatus() != AppointmentStatusEnum.PENDING_PAYMENT) {
                throw new IllegalStateException("Appointment không ở trạng thái chờ thanh toán");
            }
            
            // Validate totalAmount
            if (invoice.getTotalAmount() == null || invoice.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Hóa đơn chưa có giá hoặc giá không hợp lệ");
            }

            String orderInfo = "Thanh toan hoa don #" + invoice.getInvoiceId() + " - tong tien: " + invoice.getTotalAmount() + " VND";
            String version = "2.1.0";
            String command = "pay";
            String orderType = "other"; // OrderType: "other" cho VNPay
            // Format tiền theo cent (VNPay yêu cầu amount tính bằng cent)
            long amount = invoice.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue();
            String transactionReference = getRandomNumber(8);
            String clientIpAddress = getIpAddress(ipAddr);
            String tmnCode = vnPayConfig.getTmnCode();
            String returnUrl = vnPayConfig.getReturnUrl();

            Map<String, String> params = new HashMap<>();
            params.put("vnp_Version", version);
            params.put("vnp_Command", command);
            params.put("vnp_TmnCode", tmnCode);
            params.put("vnp_Amount", String.valueOf(amount));
            params.put("vnp_CurrCode", "VND");
            params.put("vnp_TxnRef", transactionReference); // Dùng transactionReference thay vì orderId
            params.put("vnp_OrderInfo", orderInfo);
            params.put("vnp_OrderType", orderType);
            params.put("vnp_Locale", "vn");
            params.put("vnp_ReturnUrl", returnUrl);

            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
//            ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh"); // Đặt múi giờ Việt Nam

//            String vnp_CreateDate = LocalDateTime.now(zoneId).format(formatter); /neu bi loi khi render len sever
            String vnp_CreateDate = formatter.format(cld.getTime());

            params.put("vnp_CreateDate", vnp_CreateDate);
            params.put("vnp_IpAddr", clientIpAddress);

            // Sắp xếp params theo thứ tự a-z
            List<String> sortedKeys = new ArrayList<>(params.keySet());
            Collections.sort(sortedKeys);

            StringBuilder queryData = new StringBuilder();
            StringBuilder hashData = new StringBuilder();

            for (String key : sortedKeys) {
                String value = params.get(key);
                if (value != null) {
                    String encodedValue = URLEncoder.encode(value, StandardCharsets.US_ASCII);
                    if (!hashData.isEmpty()) {
                        hashData.append("&");
                    }
                    hashData.append(key).append("=").append(encodedValue);

                    if (!queryData.isEmpty()) {
                        queryData.append("&");
                    }
                    queryData.append(key).append("=").append(encodedValue);
                }
            }

            // Tạo vnp_SecureHash
            String secureHash = hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
            queryData.append("&vnp_SecureHash=").append(secureHash);
            String paymentUrl = vnPayConfig.getPayUrl() + "?" + queryData.toString();
            
            // Tạo PaymentTransactionEntity để lưu mapping giữa transactionReference và appointment/invoice
            // Lưu source vào notes để biết redirect về admin hay client
            PaymentTransactionEntity paymentTransaction = PaymentTransactionEntity.builder()
                    .appointment(appointment)
                    .invoice(invoice)
                    .gateway(PaymentGatewayEnum.VNPAY)
                    .amount(invoice.getTotalAmount())
                    .currency("VND")
                    .transactionReference(transactionReference)
                    .paymentUrl(paymentUrl)
                    .status(PaymentTransactionStatusEnum.PENDING)
                    .notes(source != null ? "source:" + source : null) // Lưu source vào notes
                    .build();
            
            paymentTransactionRepository.save(paymentTransaction);
            log.info("✅ Created PaymentTransaction: transactionReference={}, invoiceId={}, appointmentId={}", 
                    transactionReference, invoice.getInvoiceId(), appointment.getAppointmentId());
            
            // Appointment status đã được validate là PENDING_PAYMENT ở trên, không cần update
            // Chỉ update khi callback thành công (giống cash payment)
            
            return paymentUrl;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo URL thanh toán VNPay", e);
        }
    }

    @Override
    @Transactional
    public String handleIPN(Map<String, String> params, HttpServletRequest request) {
        String transactionReference = params.get("vnp_TxnRef");
        String transactionStatus = params.get("vnp_TransactionStatus");
        String vnp_Amount = params.get("vnp_Amount");
        String vnp_TransactionNo = params.get("vnp_TransactionNo");
        String vnp_PayDate = params.get("vnp_PayDate");
        
        // Validate secure hash
        String vnp_SecureHash = params.get("vnp_SecureHash");
        
        // Lấy raw query string từ request để verify hash đúng cách
        // VNPay tính hash dựa trên query string gốc (đã encode), không phải params đã decode
        String rawQueryString = request.getQueryString();
        if (rawQueryString == null) {
            log.error("❌ Cannot get raw query string from request");
            throw new RuntimeException("Invalid request from VNPay");
        }
        
        // Extract hash data từ query string (loại bỏ vnp_SecureHash và vnp_SecureHashType)
        String[] queryParams = rawQueryString.split("&");
        Map<String, String> paramsMap = new HashMap<>();
        for (String param : queryParams) {
            if (param != null && !param.isEmpty()) {
                int equalIndex = param.indexOf("=");
                if (equalIndex > 0) {
                    String key = param.substring(0, equalIndex);
                    String value = equalIndex < param.length() - 1 ? param.substring(equalIndex + 1) : "";
                    // Bỏ qua vnp_SecureHash và vnp_SecureHashType
                    if (!key.equals("vnp_SecureHash") && !key.equals("vnp_SecureHashType")) {
                        paramsMap.put(key, value);
                    }
                }
            }
        }
        
        // Sort theo key và build hash data (giữ nguyên giá trị đã encode từ URL)
        List<String> sortedKeys = new ArrayList<>(paramsMap.keySet());
        Collections.sort(sortedKeys);
        StringBuilder hashData = new StringBuilder();
        for (String key : sortedKeys) {
            String value = paramsMap.get(key);
            if (value != null) { // Không filter empty value, vì VNPay có thể có params với empty value
                if (!hashData.isEmpty()) {
                    hashData.append("&");
                }
                hashData.append(key).append("=").append(value);
            }
        }
        
        String hashDataString = hashData.toString();
        
        // Log để debug (có thể comment sau khi fix xong)
        log.debug("Raw query string: {}", rawQueryString);
        log.debug("Hash data for verification: {}", hashDataString);
        log.debug("Received vnp_SecureHash: {}", vnp_SecureHash);
        
        String calculatedHash = hmacSHA512(vnPayConfig.getHashSecret(), hashDataString);
        log.debug("Calculated hash: {}", calculatedHash);
        
        if (!calculatedHash.equalsIgnoreCase(vnp_SecureHash)) {
            log.error("❌ Invalid secure hash from VNPay for transactionReference: {}", transactionReference);
            log.error("Expected: {}, Got: {}", calculatedHash, vnp_SecureHash);
            log.error("Hash data: {}", hashDataString);
            throw new RuntimeException("Invalid secure hash from VNPay");
        }
        
        // Tìm PaymentTransaction theo transactionReference
        PaymentTransactionEntity paymentTransaction = paymentTransactionRepository
                .findByTransactionReference(transactionReference)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy payment transaction với transactionReference: " + transactionReference));
        
        AppointmentEntity appointment = paymentTransaction.getAppointment();
        InvoiceEntity invoice = paymentTransaction.getInvoice();
        
        // Update payment transaction với thông tin từ VNPay callback
        paymentTransaction.setTransactionResponse(String.join("|", params.values()));
        paymentTransaction.setGatewayTransactionId(vnp_TransactionNo);
        if (vnp_PayDate != null && !vnp_PayDate.isEmpty()) {
            try {
                // Parse VNPay date format: yyyyMMddHHmmss
                SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
                paymentTransaction.setPaymentDate(LocalDateTime.ofInstant(
                    formatter.parse(vnp_PayDate).toInstant(),
                    java.time.ZoneId.systemDefault()
                ));
            } catch (Exception e) {
                log.warn("Failed to parse payment date: {}", vnp_PayDate);
            }
        }
        
        if ("00".equals(transactionStatus)) {
            // Payment successful
            paymentTransaction.setStatus(PaymentTransactionStatusEnum.SUCCESS);
            paymentTransactionRepository.save(paymentTransaction);
            
            // ✅ Nếu totalAmount = 0, tự động thanh toán và completed appointment (không cần VNPay callback)
            if (invoice.getTotalAmount().compareTo(BigDecimal.ZERO) == 0) {
                log.info("💰 Invoice totalAmount is 0 - Auto-completing payment and appointment via VNPay callback");
                
                // Tìm payment method VNPAY (hoặc tạo mới nếu chưa có)
                PaymentMethodEntity vnpayPaymentMethod = paymentMethodRepository
                        .findByMethodTypeAndIsDeletedFalse(MethodTypeEnum.MOBILE_WALLET)
                        .orElseGet(() -> {
                            PaymentMethodEntity newVnpay = new PaymentMethodEntity();
                            newVnpay.setMethodType(MethodTypeEnum.MOBILE_WALLET);
                            newVnpay.setProvider("VNPay");
                            newVnpay.setIsActive(true);
                            newVnpay.setIsDeleted(false);
                            return paymentMethodRepository.save(newVnpay);
                        });
                
                // Cập nhật invoice
                invoice.setPaymentMethod(vnpayPaymentMethod);
                invoice.setPaidAmount(BigDecimal.ZERO);
                invoice.setStatus(InvoiceStatusEnum.PAID);
                invoiceRepository.save(invoice);
                log.info("✅ Invoice {} auto-marked as PAID via VNPay (totalAmount = 0)", invoice.getInvoiceId());
                
                // Cập nhật appointment sang COMPLETED
                appointment.setStatus(AppointmentStatusEnum.COMPLETED);
                appointmentRepository.save(appointment);
                appointmentRepository.flush();
                
                // Refresh appointment từ database
                UUID appointmentIdForRefresh = appointment.getAppointmentId();
                appointment = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(appointmentIdForRefresh);
                
                if (appointment != null) {
                    log.info("✅ Appointment {} auto-marked as COMPLETED via VNPay (invoice totalAmount = 0)", appointment.getAppointmentId());
                    
                    // Tự động cập nhật shift status sang COMPLETED
                    updateShiftStatusWhenAppointmentCompleted(appointment.getAppointmentId());
                    
                    // Reset warranty date cho các phụ tùng được sử dụng trong appointment
                    resetWarrantyDateForAppointment(appointment);
                } else {
                    log.warn("⚠️ Could not refresh appointment after VNPay auto-payment: {}", appointmentIdForRefresh);
                    updateShiftStatusWhenAppointmentCompleted(appointmentIdForRefresh);
                    
                    AppointmentEntity reloadedAppointment = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(appointmentIdForRefresh);
                    if (reloadedAppointment != null) {
                        resetWarrantyDateForAppointment(reloadedAppointment);
                    }
                }
                
                log.info("✅ Auto-payment successful via VNPay: transactionReference={}, invoiceId={}, amount=0", 
                        transactionReference, invoice.getInvoiceId());
                
                return transactionReference;
            }
            
            // Validate amount phải bằng totalAmount (giống cash payment - không cho partial)
            BigDecimal paidAmount = BigDecimal.valueOf(Long.parseLong(vnp_Amount)).divide(BigDecimal.valueOf(100));
            if (paidAmount.compareTo(invoice.getTotalAmount()) < 0) {
                log.warn("Paid amount {} is less than total amount {}", paidAmount, invoice.getTotalAmount());
                throw new RuntimeException("Số tiền thanh toán phải bằng tổng tiền hóa đơn. Đã nhận: " + paidAmount + ", Cần: " + invoice.getTotalAmount());
            }
            
            // Tìm payment method VNPAY (hoặc tạo mới nếu chưa có) - tương tự cash payment
            // VNPAY thuộc MOBILE_WALLET hoặc OTHER trong MethodTypeEnum
            PaymentMethodEntity vnpayPaymentMethod = paymentMethodRepository
                    .findByMethodTypeAndIsDeletedFalse(MethodTypeEnum.MOBILE_WALLET)
                    .orElseGet(() -> {
                        PaymentMethodEntity newVnpay = new PaymentMethodEntity();
                        newVnpay.setMethodType(MethodTypeEnum.MOBILE_WALLET);
                        newVnpay.setProvider("VNPay");
                        newVnpay.setIsActive(true);
                        newVnpay.setIsDeleted(false);
                        return paymentMethodRepository.save(newVnpay);
                    });
            
            // Cập nhật invoice (giống cash payment logic)
            invoice.setPaymentMethod(vnpayPaymentMethod);
            invoice.setPaidAmount(invoice.getTotalAmount()); // Set đúng totalAmount (không add từng phần)
            invoice.setStatus(InvoiceStatusEnum.PAID);
            invoiceRepository.save(invoice);
            log.info("Invoice {} marked as PAID via VNPay", invoice.getInvoiceId());
            
            // Cập nhật appointment sang COMPLETED
            appointment.setStatus(AppointmentStatusEnum.COMPLETED);
            appointmentRepository.save(appointment);
            appointmentRepository.flush(); // Flush để đảm bảo dữ liệu được ghi vào database ngay lập tức
            
            // Refresh appointment từ database để đảm bảo có dữ liệu mới nhất
            UUID appointmentIdForRefresh = appointment.getAppointmentId();
            appointment = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(appointmentIdForRefresh);
            
            if (appointment != null) {
                log.info("Appointment {} marked as COMPLETED", appointment.getAppointmentId());
                
                // Log appointment completed
                log.info("✅ Appointment marked as COMPLETED via VNPay - ID: {}, Status: {}", 
                        appointment.getAppointmentId(),
                        appointment.getStatus());
                
                // ✅ Tự động cập nhật shift status sang COMPLETED khi appointment chuyển sang COMPLETED sau khi thanh toán
                // Để kỹ thuật viên thấy ca làm đã hoàn thành
                updateShiftStatusWhenAppointmentCompleted(appointment.getAppointmentId());
                
                // ✅ Reset warranty date cho các phụ tùng được sử dụng trong appointment
                resetWarrantyDateForAppointment(appointment);
            } else {
                log.warn("⚠️ Could not refresh appointment after VNPay payment: {}", appointmentIdForRefresh);
                // Vẫn cập nhật shift status với appointmentId
                updateShiftStatusWhenAppointmentCompleted(appointmentIdForRefresh);
                
                // Reload appointment để reset warranty
                AppointmentEntity reloadedAppointment = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(appointmentIdForRefresh);
                if (reloadedAppointment != null) {
                    resetWarrantyDateForAppointment(reloadedAppointment);
                }
            }
            
            log.info("✅ Payment successful: transactionReference={}, invoiceId={}, amount={}", 
                    transactionReference, invoice.getInvoiceId(), paidAmount);
            
            return transactionReference;
        } else {
            // Payment failed
            paymentTransaction.setStatus(PaymentTransactionStatusEnum.FAILED);
            paymentTransactionRepository.save(paymentTransaction);
            
            log.warn("⚠️ Payment failed: transactionReference={}, status={}", transactionReference, transactionStatus);
            return null;
        }
    }

    @Override
    public String getIpAddress(HttpServletRequest request) {
        String ipAdress;
        try {
            ipAdress = request.getHeader("X-FORWARDED-FOR");
            if (ipAdress == null) {
                ipAdress = request.getRemoteAddr();
            }
        } catch (Exception e) {
            ipAdress = "Invalid IP:" + e.getMessage();
        }
        return ipAdress;
    }

    @Override
    public String getRandomNumber(int len) {
        Random rnd = new Random();
        String chars = "0123456789";
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }


    @Override
    public String hmacSHA512(String key, String data) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            // Chuyển bytes sang hex string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append("0");
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo chữ ký HMAC-SHA512", e);
        }
    }

    @Override
    public String getSourceFromTransaction(String transactionReference) {
        PaymentTransactionEntity paymentTransaction = paymentTransactionRepository
                .findByTransactionReference(transactionReference)
                .orElse(null);
        
        if (paymentTransaction != null && paymentTransaction.getNotes() != null) {
            String notes = paymentTransaction.getNotes();
            if (notes.startsWith("source:")) {
                return notes.substring(7); // Extract "admin" or "client" from "source:admin"
            }
        }
        return "client"; // Default to client if not found
    }

    @Override
    public String getAppointmentIdFromTransaction(String transactionReference) {
        PaymentTransactionEntity paymentTransaction = paymentTransactionRepository
                .findByTransactionReference(transactionReference)
                .orElse(null);
        
        if (paymentTransaction != null && paymentTransaction.getAppointment() != null) {
            return paymentTransaction.getAppointment().getAppointmentId().toString();
        }
        return null;
    }

    /**
     * Tự động cập nhật shift status sang COMPLETED khi appointment chuyển sang COMPLETED sau khi thanh toán VNPay
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
                log.debug("No shifts found for appointment {} to update to COMPLETED", appointmentId);
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
                    log.info("✅ Auto-updated shift {} status to COMPLETED when appointment {} completed after VNPay payment", 
                            shift.getShiftId(), appointmentId);
                }
            }
            
            if (updatedCount > 0) {
                log.info("✅ Updated {} shift(s) to COMPLETED for appointment {} after VNPay payment", updatedCount, appointmentId);
            } else {
                log.debug("No shifts needed status update for appointment {} (all shifts are already COMPLETED or other status)", appointmentId);
            }
        } catch (Exception e) {
            log.error("⚠️ Failed to update shift status when appointment {} completed after VNPay payment: {}", 
                    appointmentId, e.getMessage());
            // Không throw exception để không block việc payment
        }
    }

    /**
     * Reset warranty date cho các phụ tùng được sử dụng trong appointment khi thanh toán thành công
     * Tạo hoặc cập nhật CustomerWarrantyPart với warranty_start_date = ngày thanh toán
     */
    private void resetWarrantyDateForAppointment(AppointmentEntity appointment) {
        try {
            log.info("🔄 Resetting warranty date for appointment via VNPay: {}", appointment.getAppointmentId());
            
            // Lấy tất cả maintenance managements của appointment
            java.util.List<com.fpt.evcare.entity.MaintenanceManagementEntity> maintenanceManagements = 
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
            for (com.fpt.evcare.entity.MaintenanceManagementEntity mm : maintenanceManagements) {
                if (mm.getMaintenanceRecords() == null || mm.getMaintenanceRecords().isEmpty()) {
                    continue;
                }
                
                // Duyệt qua tất cả maintenance records đã approved
                for (com.fpt.evcare.entity.MaintenanceRecordEntity record : mm.getMaintenanceRecords()) {
                    if (Boolean.TRUE.equals(record.getApprovedByUser()) && 
                        record.getVehiclePart() != null && 
                        !record.getIsDeleted()) {
                        
                        UUID vehiclePartId = record.getVehiclePart().getVehiclePartId();
                        
                        // Kiểm tra phụ tùng này có warranty không
                        com.fpt.evcare.entity.WarrantyPartEntity warrantyPart = warrantyPartRepository
                                .findByVehiclePartVehiclePartIdAndIsDeletedFalseAndIsActiveTrue(vehiclePartId)
                                .orElse(null);
                        
                        if (warrantyPart != null) {
                            // Tính warranty_end_date
                            LocalDateTime warrantyEndDate = calculateWarrantyEndDate(
                                    warrantyStartDate, 
                                    warrantyPart.getValidityPeriod(), 
                                    warrantyPart.getValidityPeriodUnit());
                            
                            // Tìm hoặc tạo CustomerWarrantyPart
                            com.fpt.evcare.entity.CustomerWarrantyPartEntity existingWarranty = customerWarrantyPartRepository
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
                                log.info("✅ Updated warranty date for part {} via VNPay - Customer: {}, Start: {}, End: {}", 
                                        record.getVehiclePart().getVehiclePartName(),
                                        customerId != null ? customerId : customerEmail,
                                        warrantyStartDate,
                                        warrantyEndDate);
                            } else {
                                // Tạo mới CustomerWarrantyPart
                                com.fpt.evcare.entity.CustomerWarrantyPartEntity newWarranty = 
                                        com.fpt.evcare.entity.CustomerWarrantyPartEntity.builder()
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
                                log.info("✅ Created warranty for part {} via VNPay - Customer: {}, Start: {}, End: {}", 
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
                log.info("✅ Reset warranty date for {} part(s) in appointment via VNPay: {}", resetCount, appointment.getAppointmentId());
            } else {
                log.debug("No warranty parts found to reset for appointment via VNPay: {}", appointment.getAppointmentId());
            }
        } catch (Exception e) {
            log.error("⚠️ Failed to reset warranty date for appointment {} via VNPay: {}", 
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

}
