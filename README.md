# 🚗 SWD392_Team3 - Hệ thống Quản lý Xe Điện

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

