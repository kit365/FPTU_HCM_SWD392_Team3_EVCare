# Hướng dẫn cấu hình VNPay

## 📍 Vị trí file cấu hình

File `.env` nằm trong thư mục: **`BE/.env`**

## 🔑 Cách lấy VNPay Credentials

### Bước 1: Đăng ký tài khoản VNPay

1. Truy cập: https://sandbox.vnpayment.vn/
2. Đăng ký tài khoản mới hoặc đăng nhập

### Bước 2: Tạo Website Integration

1. Sau khi đăng nhập, vào mục **"Website Integration"**
2. Tạo website mới với các thông tin:
   - Website URL: `http://localhost:3000` (cho development)
   - Return URL: `http://localhost:3000/client/payment/return`
   - IPN URL: `http://localhost:8080/api/payment/vnpay/callback`

### Bước 3: Lấy Credentials

Sau khi tạo website, bạn sẽ nhận được:

- **TmnCode (Terminal Code)**: Mã cửa hàng (ví dụ: `2QXUI4J4`)
- **HashSecret**: Chuỗi bí mật để tạo hash
- **Website ID**: ID của website

### Bước 4: Cập nhật file .env

Mở file `BE/.env` và cập nhật:

```env
# VNPay Configuration (Sandbox)
VNPAY_TMN_CODE=2QXUI4J4  # Thay bằng TmnCode của bạn
VNPAY_HASH_SECRET=xxxxxxxxxxxxxxxxxxx  # Thay bằng HashSecret của bạn
VNPAY_RETURN_URL=http://localhost:3000/client/payment/return

# Hoặc cho Production:
# Basic URL: https://www.vnpayment.vn/paymentv2/vpcpay.html
```

### Bước 5: Khởi động lại ứng dụng

```bash
cd BE
./mvnw spring-boot:run
```

## 🧪 Test VNPay

### Với Sandbox

VNPay Sandbox sẽ cho phép bạn test với số tiền bất kỳ mà không cần thẻ thật.

### Test Cards

VNPay Sandbox có thể cung cấp test cards hoặc bạn có thể sử dụng số thẻ test của các ngân hàng.

## ⚙️ Production Setup

Khi chuyển sang production:

1. Đăng ký tài khoản VNPay Production
2. Tạo website integration trong production environment
3. Lấy credentials mới
4. Cập nhật `.env` với credentials production
5. Cập nhật `application-dev.yml` để dùng production URL:
   ```yaml
   payment:
     vnpay:
       url: https://www.vnpayment.vn/paymentv2/vpcpay.html  # Production URL
   ```

## 🔐 Security

- **KHÔNG commit** file `.env` vào Git
- File `.env` đã được thêm vào `.gitignore`
- Chỉ share credentials qua các kênh bảo mật
- Rotate credentials định kỳ

## 📝 Example .env file

```env
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/evcare
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=password

# Backend
APP_PORT=8080
SPRING_BACKEND_URL=http://localhost:8080

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Mail
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-app-password

# VNPay Sandbox
VNPAY_TMN_CODE=2QXUI4J4
VNPAY_HASH_SECRET=RAOCTKRKDVCOCMDXWMYXKBJXRPUESFKP
VNPAY_RETURN_URL=http://localhost:3000/client/payment/return

# MoMo (nếu cần)
MOMO_PARTNER_CODE=YourPartnerCode
MOMO_ACCESS_KEY=YourAccessKey
MOMO_SECRET_KEY=YourSecretKey
MOMO_RETURN_URL=http://localhost:3000/client/payment/return
```

## ❓ Troubleshooting

### Lỗi: "Invalid hash"

- Kiểm tra lại `VNPAY_HASH_SECRET` có đúng không
- Đảm bảo HashSecret không có khoảng trắng thừa

### Lỗi: "Website not found"

- Kiểm tra `VNPAY_TMN_CODE` có đúng không
- Đảm bảo website đã được tạo và active trong VNPay dashboard

### Payment không redirect về

- Kiểm tra `VNPAY_RETURN_URL` có đúng và accessible không
- Kiểm tra firewall/port forwarding

## 📞 Support

- VNPay Documentation: https://sandbox.vnpayment.vn/apis/
- VNPay Support: support@vnpayment.vn
