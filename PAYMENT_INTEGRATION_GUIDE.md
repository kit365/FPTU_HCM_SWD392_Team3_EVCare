# Hướng dẫn tích hợp VNPay và MoMo cho EVCare

## Tổng quan

Dự án EVCare đã được tích hợp hai phương thức thanh toán trực tuyến:
- **VNPay**: Cổng thanh toán phổ biến tại Việt Nam
- **MoMo**: Ví điện tử MoMo

## Cấu trúc Backend

### 1. Entity và Repository

#### PaymentTransactionEntity
- **Location**: `BE/src/main/java/com/fpt/evcare/entity/PaymentTransactionEntity.java`
- Lưu trữ thông tin các giao dịch thanh toán
- Các trường chính:
  - `transactionId`: ID của transaction
  - `invoice`: Liên kết với hóa đơn
  - `gateway`: VNPAY hoặc MOMO
  - `amount`: Số tiền thanh toán
  - `status`: Trạng thái (PENDING, SUCCESS, FAILED, v.v.)
  - `paymentUrl`: URL thanh toán từ gateway
  - `gatewayTransactionId`: Transaction ID từ gateway

#### PaymentTransactionRepository
- **Location**: `BE/src/main/java/com/fpt/evcare/repository/PaymentTransactionRepository.java`
- Cung cấp các query để truy vấn payment transactions

### 2. Enums

#### PaymentGatewayEnum
- **Location**: `BE/src/main/java/com/fpt/evcare/enums/PaymentGatewayEnum.java`
- Values: `VNPAY`, `MOMO`, `BANK_TRANSFER`, `CASH`

#### PaymentTransactionStatusEnum
- **Location**: `BE/src/main/java/com/fpt/evcare/enums/PaymentTransactionStatusEnum.java`
- Values: `PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`, `CANCELLED`, `REFUNDED`

### 3. Service Layer

#### PaymentService và PaymentServiceImpl
- **Location**: `BE/src/main/java/com/fpt/evcare/service/PaymentService.java`
- **Implementation**: `BE/src/main/java/com/fpt/evcare/serviceimpl/PaymentServiceImpl.java`

**Các method chính:**
- `createPayment(CreatePaymentRequest)`: Tạo payment URL
- `handleVnpayCallback(...)`: Xử lý callback từ VNPay
- `handleMomoCallback(...)`: Xử lý callback từ MoMo
- `checkPaymentStatus(UUID)`: Kiểm tra trạng thái thanh toán
- `getPaymentHistoryByInvoice(UUID, Pageable)`: Lấy lịch sử giao dịch theo invoice
- `getAllPaymentHistory(Pageable)`: Lấy toàn bộ lịch sử giao dịch

### 4. Controller

#### PaymentController
- **Location**: `BE/src/main/java/com/fpt/evcare/controller/PaymentController.java`

**Endpoints:**
- `POST /api/payment/create`: Tạo payment URL
- `GET /api/payment/vnpay/callback`: VNPay callback
- `GET /api/payment/status/{transactionId}`: Kiểm tra trạng thái
- `GET /api/payment/invoice/{invoiceId}`: Lịch sử theo invoice
- `GET /api/payment/history`: Lịch sử tất cả giao dịch

### 5. Utilities

#### VnpayUtil
- **Location**: `BE/src/main/java/com/fpt/evcare/util/VnpayUtil.java`
- Tạo hash SHA-512 cho VNPay
- Verify hash từ VNPay callback
- Parse IP address từ request
- Build query URL

## Cấu trúc Frontend

### 1. Types

#### Payment Types
- **Location**: `FE/src/types/payment.types.ts`
- Định nghĩa các type TypeScript cho payment

### 2. Constants

#### Payment Constants
- **Location**: `FE/src/constants/paymentConstants.ts`
- Định nghĩa labels và mapping cho payment gateway và status

### 3. Service

#### Payment Service
- **Location**: `FE/src/service/paymentService.ts`
- Cung cấp các hàm gọi API cho payment

### 4. Components

#### PaymentPage
- **Location**: `FE/src/pages/client/payment/PaymentPage.tsx`
- UI để tạo và thanh toán hóa đơn
- Hỗ trợ chọn gateway (VNPay, MoMo)
- Tự động redirect sau khi tạo payment URL thành công

#### PaymentCallback
- **Location**: `FE/src/pages/client/payment/PaymentCallback.tsx`
- Xử lý kết quả thanh toán
- Hiển thị success/failure message

## Cấu hình

### 1. Backend Configuration

Thêm vào `application-dev.yml` hoặc `application-prod.yml`:

```yaml
payment:
  vnpay:
    tmn-code: ${VNPAY_TMN_CODE}
    hash-secret: ${VNPAY_HASH_SECRET}
    url: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html  # Sandbox
    # url: https://www.vnpayment.vn/paymentv2/vpcpay.html   # Production
    return-url: ${VNPAY_RETURN_URL:http://localhost:3000/client/payment/return}
  momo:
    partner-code: ${MOMO_PARTNER_CODE}
    access-key: ${MOMO_ACCESS_KEY}
    secret-key: ${MOMO_SECRET_KEY}
    url: https://test-payment.momo.vn/v2/gateway/api/create  # Sandbox
    return-url: ${MOMO_RETURN_URL:http://localhost:3000/client/payment/return}
    notify-url: ${MOMO_NOTIFY_URL:http://localhost:8080/api/payment/momo/notify}
```

### 2. Environment Variables

Tạo file `.env` trong thư mục `BE/`:

```env
# VNPay Configuration
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_RETURN_URL=http://localhost:3000/client/payment/return

# MoMo Configuration
MOMO_PARTNER_CODE=your_partner_code
MOMO_ACCESS_KEY=your_access_key
MOMO_SECRET_KEY=your_secret_key
MOMO_RETURN_URL=http://localhost:3000/client/payment/return
MOMO_NOTIFY_URL=http://localhost:8080/api/payment/momo/notify
```

### 3. Frontend Configuration

Thêm vào `.env` trong thư mục `FE/`:

```env
VITE_API_URL=http://localhost:8080
```

## Sử dụng

### 1. Tạo Payment

```typescript
import { paymentService } from '@/service/paymentService';
import { PaymentGateway } from '@/types/payment.types';

// Tạo payment URL
const response = await paymentService.createPayment({
  invoiceId: 'invoice-uuid',
  gateway: PaymentGateway.VNPAY,
  amount: 100000,
  currency: 'VND',
  customerInfo: 'Customer information',
  orderDescription: 'Thanh toán hóa đơn',
});

// Redirect đến payment gateway
window.location.href = response.data.paymentUrl;
```

### 2. Kiểm tra Status

```typescript
const status = await paymentService.checkPaymentStatus(transactionId);
console.log(status.data.status); // SUCCESS, FAILED, etc.
```

### 3. Lấy Lịch sử Thanh toán

```typescript
const history = await paymentService.getPaymentHistoryByInvoice(invoiceId);
console.log(history.data.data); // Array of payment transactions
```

## Flow Thanh toán

### VNPay Flow

1. **Client** gọi `POST /api/payment/create` với thông tin invoice
2. **Server** tạo `PaymentTransactionEntity` với status = PENDING
3. **Server** generate payment URL từ VNPay
4. **Server** trả về payment URL
5. **Client** redirect user đến payment URL
6. **User** thanh toán trên VNPay
7. **VNPay** redirect user về `return-url` với parameters
8. **Frontend** hiển thị kết quả (PaymentCallback component)
9. **Backend** nhận callback từ VNPay (async)
10. **Server** verify hash và update transaction status
11. **Server** update invoice status sang PAID (nếu thành công)

### MoMo Flow

Tương tự VNPay, nhưng callback sẽ đi qua webhook `notify-url`.

## Testing

### 1. VNPay Sandbox

1. Đăng ký tài khoản VNPay: https://sandbox.vnpayment.vn/
2. Lấy `tmn-code` và `hash-secret`
3. Cấu hình trong `.env`
4. Test với số tiền bất kỳ

### 2. MoMo Sandbox

1. Đăng ký MoMo partner: https://developers.momo.vn/
2. Lấy credentials
3. Cấu hình trong `.env`
4. Test với số tiền bất kỳ

## Troubleshooting

### Lỗi không tạo được payment URL

- Kiểm tra VNPay credentials trong `.env`
- Kiểm tra return URL có đúng format không
- Kiểm tra log của backend

### Lỗi callback không hoạt động

- Kiểm tra return URL có accessible không
- Verify hash có đúng không
- Kiểm tra log callback từ gateway

### Invoice không được cập nhật

- Kiểm tra logic trong `handleVnpayCallback` hoặc `handleMomoCallback`
- Verify transaction được save thành công
- Check invoice status trong database

## Security Notes

1. **Never expose secret keys** - Luôn lưu secret keys trong environment variables
2. **Verify hash** - Luôn verify hash từ gateway trước khi xử lý
3. **HTTPS** - Sử dụng HTTPS trong production
4. **Validate amount** - Validate amount từ callback phải khớp với database
5. **Idempotency** - Implement idempotency để tránh duplicate transactions

## Dependencies

### Backend

```xml
<!-- pom.xml -->
<dependency>
    <groupId>commons-codec</groupId>
    <artifactId>commons-codec</artifactId>
    <version>1.15</version>
</dependency>
```

### Frontend

Không có dependencies mới, chỉ sử dụng các thư viện hiện có (axios, antd, react-router).

## Migration Database

Khi deploy lần đầu, tạo migration cho `payment_transactions` table:

```sql
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id),
    appointment_id UUID REFERENCES appointments(id),
    gateway VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'VND',
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    payment_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    transaction_response VARCHAR(1000),
    payment_date TIMESTAMP,
    gateway_transaction_id VARCHAR(100),
    customer_info VARCHAR(500),
    notes VARCHAR(500),
    search VARCHAR(255),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);
```

## Next Steps

1. Implement MoMo integration hoàn chỉnh
2. Add refund functionality
3. Add payment webhook receiver
4. Implement payment report
5. Add multi-currency support
