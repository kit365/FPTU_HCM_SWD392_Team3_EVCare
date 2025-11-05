

# ⭐ 🚗 SWD392_Team3 - Hệ thống Quản lý Dịch vụ Bảo trì Xe Điện (EVCare) ⭐

<div align="center">

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.4-brightgreen?style=for-the-badge&logo=spring)
![React](https://img.shields.io/badge/React-19.1.1-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=for-the-badge&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7-red?style=for-the-badge&logo=redis)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?style=for-the-badge&logo=docker)

</div>

## 📑 Mục lục

- [📋 Mô tả dự án](#-mô-tả-dự-án)
- [🎯 Tính năng](#-tính-năng)
- [🏗️ Kiến trúc MVC](#️-kiến-trúc-mvc)
- [💻 Công nghệ](#-công-nghệ)
- [👥 Tài khoản khởi tạo mặc định](#-tài-khoản-khởi-tạo-mặc-định)
- [🛠️ Cài đặt Local](#️-cài-đặt-local)
- [🚀 Deploy Production](#-deploy-production)
- [📚 API Documentation](#-api-documentation)
- [📂 Branch Strategy](#-branch-strategy)
- [⚡ Development Workflow](#-development-workflow)

---

## 📋 Mô tả dự án

**EVCare** là hệ thống web quản lý dịch vụ bảo trì và sửa chữa xe điện, hỗ trợ toàn bộ quy trình từ đặt lịch hẹn đến thanh toán và bảo hành. Hệ thống được xây dựng theo mô hình **MVC (Model-View-Controller)** với kiến trúc phân tầng rõ ràng.

---

## 🎯 Tính năng

### Chức năng chính:
- **Quản lý cuộc hẹn**: Đặt lịch, xác nhận, theo dõi tiến độ, hủy lịch hẹn
- **Quản lý dịch vụ**: Bảo trì, sửa chữa, thay thế phụ tùng, quản lý loại dịch vụ
- **Quản lý nhân viên**: Phân công kỹ thuật viên, quản lý ca làm việc, theo dõi hiệu suất
- **Thanh toán**: Hỗ trợ thanh toán tiền mặt và VNPay (QR code), quản lý hóa đơn
- **Bảo hành**: Quản lý chính sách bảo hành phụ tùng, tự động áp dụng giảm giá
- **Hóa đơn**: Tạo và quản lý hóa đơn điện tử, xuất hóa đơn PDF
- **Tin nhắn**: Hệ thống chat real-time giữa khách hàng và nhân viên qua WebSocket
- **Dashboard**: Thống kê doanh thu, số lượng cuộc hẹn, biểu đồ phân tích
- **Quản lý xe**: Đăng ký thông tin xe, lịch sử bảo trì
- **Tìm kiếm**: Tra cứu cuộc hẹn qua email/OTP cho khách vãng lai

---

## 🏗️ Kiến trúc MVC

Hệ thống được xây dựng theo mô hình **MVC (Model-View-Controller)** với các thành phần:

<div align="center">
![Uploading kientruc.jpg…]()


</div>

### Backend (Spring Boot - Java)

#### **Controller Layer** (`com.fpt.evcare.controller`)
- Xử lý HTTP requests/responses
- Validate input data
- Gọi Service layer để xử lý business logic
- Ví dụ: `AppointmentController`, `AuthController`, `InvoiceController`, `VnPayController`

#### **Service Layer** (`com.fpt.evcare.service` & `com.fpt.evcare.serviceimpl`)
- Chứa business logic chính
- Xử lý transactions
- Gọi Repository layer để truy cập database
- Ví dụ: `AppointmentServiceImpl`, `UserServiceImpl`, `InvoiceServiceImpl`

#### **Repository Layer** (`com.fpt.evcare.repository`)
- Truy cập database (JPA/Hibernate)
- Thực hiện các query
- Ví dụ: `AppointmentRepository`, `UserRepository`, `InvoiceRepository`

#### **Entity Layer** (`com.fpt.evcare.entity`)
- Đại diện cho các bảng trong database
- Sử dụng JPA annotations để mapping
- Ví dụ: `AppointmentEntity`, `UserEntity`, `InvoiceEntity`

#### **DTO Layer** (`com.fpt.evcare.dto`)
- **Request DTO**: Dữ liệu nhận từ client (`dto.request`)
- **Response DTO**: Dữ liệu trả về cho client (`dto.response`)
- Ví dụ: `AppointmentResponse`, `UserResponse`, `InvoiceResponse`

### Frontend (React + TypeScript)

#### **View Layer** (`FE/src/pages`)
- Các component hiển thị UI
- Tương tác với user
- Gọi API thông qua Service layer

#### **Service Layer** (`FE/src/service`)
- Gọi API đến backend
- Xử lý HTTP requests/responses
- Ví dụ: `bookingService`, `invoiceService`, `paymentService`

#### **Component Layer** (`FE/src/components`)
- Reusable components
- Shared UI components

---

## 💻 Công nghệ

### Backend
- **Framework**: Spring Boot 3.5.4
- **Language**: Java 21
- **Database**: PostgreSQL 15 (với pgvector extension)
- **Cache**: Redis 7
- **ORM**: JPA/Hibernate
- **Security**: Spring Security + JWT (Nimbus JOSE)
- **WebSocket**: Spring WebSocket (STOMP)
- **API Documentation**: SpringDoc OpenAPI (Swagger)
- **Email**: Spring Mail
- **Build Tool**: Maven

### Frontend
- **Framework**: React 19.1.1
- **Language**: TypeScript 5.8.3
- **Build Tool**: Vite 7.1.2
- **UI Library**: 
  - Material-UI (MUI) 7.3.2
  - Ant Design 5.27.5
- **Styling**: Tailwind CSS 4.1.13
- **State Management**: React Hooks + Context API
- **Routing**: React Router DOM 6.30.1
- **HTTP Client**: Axios 1.12.2
- **WebSocket**: STOMP.js + SockJS
- **Form Handling**: React Hook Form + Yup/Zod
- **Charts**: Nivo, FullCalendar

### Infrastructure
- **Container**: Docker & Docker Compose
- **Deployment**: Vercel (Frontend), VPS/Cloud (Backend)

---

## 👥 Tài khoản khởi tạo mặc định

> ⚠️ **Lưu ý quan trọng**: Hệ thống sử dụng **Code-First** approach với JPA/Hibernate. Database schema và dữ liệu khởi tạo được tự động tạo thông qua các `CommandLineRunner` classes trong package `com.fpt.evcare.initializer`.  
> **Không cần** chạy các câu lệnh SQL INSERT thủ công - tất cả dữ liệu sẽ được khởi tạo tự động khi ứng dụng Spring Boot khởi động lần đầu.

Hệ thống tự động khởi tạo các tài khoản mặc định khi chạy lần đầu:

### 🔑 Admin (Quản trị viên)
- **Email**: `admin@gmail.com`
- **Password**: `1`
- **Quyền**: Toàn quyền quản lý hệ thống


### 👨‍💼 Staff (Nhân viên)
- **Email**: `staff@gmail.com` (mặc định)
- **Password**: `123456` (mặc định)
- **Các tài khoản khác**: `staff1` đến `staff19`
- **Password**: `Staff@123`
- **Quyền**: Quản lý cuộc hẹn, cập nhật trạng thái dịch vụ

### 👤 Customer (Khách hàng)
- **Email**: `customer@gmail.com` (mặc định)
- **Password**: `123456` (mặc định)
- **Các tài khoản khác**: `customer1` đến `customer749` với email `customer1@evcare.com` đến `customer749@evcare.com`
- **Password**: `@Customer123`
- **Quyền**: Đặt lịch hẹn, xem lịch sử, thanh toán
- **Số lượng**: 750 tài khoản

### 🔧 Technician (Kỹ thuật viên)
- **Email**: `technician@gmail.com` (mặc định)
- **Password**: `123456` (mặc định)
- **Các tài khoản khác**: `technician1` đến `technician39` với email `technician1@evcare.com` đến `technician39@evcare.com`
- **Password**: `@Technician123`
- **Quyền**: Xem ca làm việc, cập nhật tiến độ bảo trì
- **Số lượng**: 40 tài khoản

**Tổng cộng**: 811 tài khoản (1 Admin + 20 Staff + 750 Customer + 40 Technician)

### 📝 Dữ liệu khởi tạo tự động

Hệ thống tự động khởi tạo các dữ liệu mẫu sau khi database được tạo:

- **Roles**: ADMIN, STAFF, CUSTOMER, TECHNICIAN
- **Users**: Các tài khoản như đã mô tả ở trên
- **Vehicle Types**: Các mẫu xe điện (VinFast, Tesla, Hyundai, Kia, BYD, BMW, Porsche, etc.)
- **Service Types**: Các loại dịch vụ bảo trì (bảo dưỡng, sửa chữa, thay thế phụ tùng, etc.)
- **Vehicle Parts**: Phụ tùng xe điện (pin, động cơ, lốp, phanh, etc.)
- **Service Type - Vehicle Part Mapping**: Quan hệ giữa dịch vụ và phụ tùng
- **Warranty Parts**: Chính sách bảo hành cho các phụ tùng

Tất cả dữ liệu được khởi tạo thông qua các class `CommandLineRunner` trong package `com.fpt.evcare.initializer`.

---

---

## 🛠️ Cài đặt Local

### Yêu cầu hệ thống
- Java 21
- Node.js 18+ và npm
- Docker & Docker Compose
- Maven 3.8+

### 1. Clone repository
```bash
git clone https://github.com/kit365/FPTU_HCM_SWD392_Team3_EVCare.git
```

### 2. Khởi động Database và Redis bằng Docker

Di chuyển vào thư mục backend và chạy docker-compose:

```bash
cd BE
docker-compose up -d
```

Lệnh này sẽ khởi động:
- **PostgreSQL** trên port `5432`
- **Redis** trên port `6380` (mapped từ 6379)

Kiểm tra các container đang chạy:
```bash
docker-compose ps
```

### 3. Cấu hình Backend

Tạo file `.env` trong thư mục `BE/` (hoặc copy từ `.env.example` nếu có):

```env
POSTGRES_DB=evcare
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
SPRING_BACKEND_URL=http://localhost:8080
FRONTEND_URL=http://localhost:5000
REDIS_HOST=localhost
REDIS_PORT=6380
JWT_SECRET=your_jwt_secret_key_here
```

Cấu hình database trong `application-dev.yml` hoặc `application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/evcare
    username: postgres
    password: your_password
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
```

### 4. Chạy Backend

```bash
cd BE
mvn clean install
mvn spring-boot:run
```

Backend sẽ chạy trên `http://localhost:8080`

> **Lưu ý**: Khi chạy lần đầu, các `CommandLineRunner` sẽ tự động:
> - Tạo database schema (nếu chưa có)
> - Khởi tạo roles và users (811 tài khoản)
> - Khởi tạo dữ liệu mẫu (vehicle types, service types, parts, etc.)

### 5. Cấu hình và chạy Frontend

```bash
cd FE
npm install
npm run dev
```

Frontend sẽ chạy trên `http://localhost:5000`

### 6. Truy cập ứng dụng

- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Redis**: localhost:6380
- **PostgreSQL**: localhost:5432

### 7. Dừng Docker containers

```bash
cd BE
docker-compose down
```

Để xóa cả volumes (dữ liệu):
```bash
docker-compose down -v
```

---

## 🚀 Deploy Production

### Frontend (Vercel)

1. **Kết nối repository với Vercel**
   - Đăng nhập Vercel
   - Import project từ Git repository
   - Chọn root directory: `FE`

2. **Cấu hình Environment Variables**
   ```
   VITE_API_BASE_URL=https://your-backend-url.com
   ```

3. **Deploy**
   ```bash
   cd FE
   vercel --prod
   ```

### Backend (VPS/Cloud)

1. **Build JAR file**
   ```bash
   cd BE
   mvn clean package -DskipTests
   ```

2. **Tạo file `.env` trên server**
   ```env
   POSTGRES_DB=evcare
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_secure_password
   SPRING_BACKEND_URL=https://your-backend-url.com
   FRONTEND_URL=https://your-frontend-url.com
   REDIS_HOST=localhost
   REDIS_PORT=6379
   JWT_SECRET=your_secure_jwt_secret
   ```

3. **Chạy ứng dụng**
   ```bash
   java -jar target/EVCare-0.0.1-SNAPSHOT.jar
   ```

Hoặc sử dụng Docker:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📚 API Documentation

Sau khi chạy backend, truy cập Swagger UI để xem tất cả API endpoints:

**URL**: http://localhost:8080/swagger-ui.html

Swagger UI cung cấp:
- Danh sách tất cả API endpoints
- Mô tả chi tiết từng endpoint
- Request/Response schemas
- Test API trực tiếp trên browser

### Các API chính:

#### Authentication
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Đăng xuất
- `POST /api/v1/auth/validate` - Validate token

#### Appointments
- `GET /api/v1/appointments` - Lấy danh sách cuộc hẹn
- `POST /api/v1/appointments` - Tạo cuộc hẹn mới
- `GET /api/v1/appointments/{id}` - Lấy chi tiết cuộc hẹn
- `PUT /api/v1/appointments/{id}` - Cập nhật cuộc hẹn

#### Invoices & Payments
- `GET /api/v1/invoices/appointment/{appointmentId}` - Lấy hóa đơn theo cuộc hẹn
- `POST /api/v1/invoices/{id}/pay-cash` - Thanh toán tiền mặt
- `GET /api/v1/vnpay/create-payment` - Tạo payment URL VNPay

#### Messages
- `GET /api/v1/messages/conversation/{userId}` - Lấy conversation
- `POST /api/v1/messages` - Gửi tin nhắn
- `WebSocket /ws/message` - Real-time messaging

---

## 📂 Branch Strategy

main (production) ← Code chạy thật
↑
develop (integration) ← Merge tất cả feature
↑
feature/<tên-feature> ← Mỗi người làm 1 feature riêng


**Tên branch chuẩn:**
- ✅ `feature/auth-login-frontend`
- ✅ `feature/booking-payment-backend`
- ✅ `bugfix/seat-selection-error`
- ❌ `my-branch`, `test`, `fix`, `abc123`

**Commit message chuẩn:**
| Tag        | Mục đích                                      | Ví dụ commit message                                 |
|------------|-----------------------------------------------|------------------------------------------------------|
| `[FEAT]`   | Thêm tính năng mới                            | `[FEAT] Thêm API đăng ký user mới`                   |
| `[FIX]`    | Sửa lỗi                                       | `[FIX] Sửa lỗi validation email`                     |
| `[UPDATE]` | Cập nhật UI, thay đổi không ảnh hưởng logic   | `[UPDATE] Cập nhật UI trang đặt vé`                  |
| `[REFACTOR]`| Tái cấu trúc code                            | `[REFACTOR] Tách component BookingForm`              |
| `[TEST]`   | Thêm hoặc sửa unit test                       | `[TEST] Thêm unit test cho AuthService`              |

❌ Không hợp lệ: `update`, `fix bug`, `abc`, `done`

---

## ⚡ Development Workflow

### 1️⃣ Tạo feature branch mới
```bash
# Nếu chưa có develop
git checkout -b develop
git push -u origin develop

# Bắt đầu feature mới
git checkout develop
git pull origin develop
git checkout -b feature/<tên-feature>

### 2️⃣ Làm việc & commit code

# Lưu thay đổi thường xuyên
git add .
git commit -m "[FEAT] Mô tả ngắn chức năng"

# Đẩy code lên server
git push origin feature/<tên-feature>


### 3️⃣ Sync với develop mỗi ngày

git checkout develop
git pull origin develop
git checkout feature/<tên-feature>
git merge develop

❌ Lưu ý: Không pull từ các feature branch khác, chỉ pull từ develop.


### 4️⃣ Hoàn thành feature

# Đẩy code cuối cùng
git push origin feature/<tên-feature>

# Tạo Merge Request trên GitLab:
# Target: feature/<tên-feature> → develop
# Merge phải:
# - [ ] Ít nhất 1 reviewer
# - [ ] All tests pass
# - [ ] Không conflict với develop
# - [ ] Commit message mô tả rõ ràng


🛠 Xử lý conflict

git status  # Xem files bị conflict

# Mở file, chỉnh sửa phần <<<<<<< ... >>>>>>>>
# Giữ code đúng và xóa dấu hiệu conflict

git add .
git commit -m "[FIX] Resolve merge conflict với develop"

# 📌 JWT Authentication Guide

## 1. Giới thiệu
Hệ thống sử dụng **JWT (JSON Web Token)** để xác thực và phân quyền.  
JWT bao gồm 2 loại token:

- **Access Token**: thời gian sống ngắn (**1 giờ**), dùng để xác thực khi gọi API.  
- **Refresh Token**: thời gian sống dài hơn (**7 ngày**), dùng để cấp lại Access Token mới khi hết hạn.  

---

## 2. Quy trình hoạt động

### 🔑 Login
1. Người dùng gửi **email + password**.  
2. Server kiểm tra thông tin đăng nhập.  
3. Sinh **Access Token (1h)** và **Refresh Token (7 ngày)**.  
4. Lưu cả 2 token vào **Redis** để quản lý.  

### 📌 Sử dụng Access Token
- Mỗi request từ client phải gửi kèm Access Token trong:  
- Server kiểm tra:
- ✅ Chữ ký token có hợp lệ không.  
- ✅ Token có hết hạn chưa.  
- ✅ Token có tồn tại trong Redis không.  

### 🔄 Refresh Token
- Khi **Access Token** hết hạn, client gọi API refresh token với **Refresh Token**.  
- Server kiểm tra:
- Refresh Token có hợp lệ và còn hạn không (**check Redis + TTL**).  
- Nếu hợp lệ → sinh **Access Token mới** và **Refresh Token mới** nhưng vẫn giữ **TTL cũ**.  

### 🚪 Logout
- Khi logout, hệ thống xoá **Access Token** và **Refresh Token** của user khỏi **Redis**.  

---

## 3. Thời gian sống (TTL)
- **Access Token**: `3600 giây` (1 giờ).  
- **Refresh Token**: `604800 giây` (7 ngày).  
- Khi refresh, **Refresh Token mới** được sinh ra nhưng chỉ sống đúng bằng **thời gian còn lại** của token cũ (*remaining TTL*).  

---

## 4. Các API chính
- `POST /auth/login` → đăng nhập, trả về **Access Token + Refresh Token**.  
- `POST /auth/refresh` → cấp lại **Access Token** khi hết hạn.  
- `POST /auth/logout` → đăng xuất, xoá token khỏi Redis.  
- `POST /auth/validate` → kiểm tra token có hợp lệ hay không.  

---

## 5. Cấu trúc code chính
- **AuthServiceImpl**: xử lý login, refresh, logout, validate token.  
- **TokenService**: lưu/xoá Access Token & Refresh Token vào Redis.  
- **RedisService**: thao tác với Redis (*set/get/delete/getExpire*).  
- **CustomJWTDecode**: cung cấp secret key cho việc ký/verify JWT.  

---

## 6. Lưu ý
- Tất cả token được ký bằng **thuật toán HS256** với **secret key**.  
- Token chỉ hợp lệ khi:
- ✅ Chữ ký đúng.  
- ✅ Chưa hết hạn.  
- ✅ Có trong Redis.  



