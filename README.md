<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/72550177-1a70-4f80-84db-8b919e23eab8" /># 🚗 SWD392_Team3 - Hệ thống Quản lý Xe Điện

Dự án phát triển hệ thống web/app cho **xe điện**, hỗ trợ:  

- Đặt chỗ sạc  
- Giám sát tình trạng pin 
- Báo cáo dữ liệu & doanh thu  
- Quản lý người dùng  

**Mục tiêu:**  
- Dashboard cho Admin  
- Thanh toán & bản đồ trạm sạc  
- Báo cáo doanh thu & dữ liệu người dùng  

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



