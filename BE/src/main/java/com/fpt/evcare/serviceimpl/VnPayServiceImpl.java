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
            
            // Cập nhật appointment sang COMPLETED (giống cash payment)
            // Đảm bảo giữ nguyên isWarrantyAppointment và originalAppointment
            Boolean isWarrantyAppointment = appointment.getIsWarrantyAppointment();
            AppointmentEntity originalAppointment = appointment.getOriginalAppointment();
            
            appointment.setStatus(AppointmentStatusEnum.COMPLETED);
            appointment.setIsWarrantyAppointment(isWarrantyAppointment); // Đảm bảo giữ nguyên giá trị
            appointment.setOriginalAppointment(originalAppointment); // Đảm bảo giữ nguyên giá trị
            
            appointmentRepository.save(appointment);
            appointmentRepository.flush(); // Flush để đảm bảo dữ liệu được ghi vào database ngay lập tức
            
            // Refresh appointment từ database để đảm bảo có dữ liệu mới nhất
            UUID appointmentIdForRefresh = appointment.getAppointmentId();
            appointment = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(appointmentIdForRefresh);
            
            if (appointment != null) {
                log.info("Appointment {} marked as COMPLETED", appointment.getAppointmentId());
                
                // Debug: Log warranty appointment info sau khi refresh
                if (Boolean.TRUE.equals(appointment.getIsWarrantyAppointment())) {
                    log.info("✅ Warranty appointment marked as COMPLETED via VNPay - ID: {}, isWarranty: {}, Status: {}, OriginalAppt: {}", 
                            appointment.getAppointmentId(),
                            appointment.getIsWarrantyAppointment(),
                            appointment.getStatus(),
                            appointment.getOriginalAppointment() != null ? appointment.getOriginalAppointment().getAppointmentId() : "null");
                } else {
                    log.info("ℹ️ Regular appointment marked as COMPLETED via VNPay - ID: {}, isWarranty: {}, Status: {}", 
                            appointment.getAppointmentId(),
                            appointment.getIsWarrantyAppointment(),
                            appointment.getStatus());
                }
                
                // ✅ Tự động cập nhật shift status sang COMPLETED khi appointment chuyển sang COMPLETED sau khi thanh toán
                // Để kỹ thuật viên thấy ca làm đã hoàn thành
                updateShiftStatusWhenAppointmentCompleted(appointment.getAppointmentId());
            } else {
                log.warn("⚠️ Could not refresh appointment after VNPay payment: {}", appointmentIdForRefresh);
                // Vẫn cập nhật shift status với appointmentId
                updateShiftStatusWhenAppointmentCompleted(appointmentIdForRefresh);
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

}
