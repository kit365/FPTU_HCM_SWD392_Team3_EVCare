# Hướng Dẫn Test Đăng Ký Trên Vercel

## 🔍 Vấn Đề
Khi deploy lên Vercel, chức năng đăng ký không hoạt động vì frontend đang gọi API đến `localhost:8080` thay vì URL backend thực tế.

## ✅ Đã Sửa
- Đã cập nhật `FE/src/constants/apiConstants.ts` để sử dụng environment variable `VITE_BACKEND_URL`

## 📝 Các Bước Thực Hiện

### 1. Cấu Hình Environment Variable trên Vercel

1. **Truy cập Vercel Dashboard:**
   - Vào https://vercel.com
   - Chọn project của bạn

2. **Thêm Environment Variable:**
   - Vào **Settings** → **Environment Variables**
   - Thêm biến mới:
     - **Name:** `VITE_BACKEND_URL`
     - **Value:** URL backend của bạn (ví dụ: `https://your-backend.herokuapp.com` hoặc `https://api.yourdomain.com`)
     - **Environments:** Chọn `Production`, `Preview`, và `Development` (nếu cần)
   
   **Lưu ý:**
   - KHÔNG thêm `/api/v1` vào cuối URL vì code đã tự động thêm rồi
   - URL phải bắt đầu với `http://` hoặc `https://`
   - Nếu backend của bạn chạy trên port khác, phải chỉ định port: `https://your-backend.com:8080`

3. **Redeploy:**
   - Sau khi thêm environment variable, bạn cần **Redeploy** lại project
   - Vào **Deployments** tab
   - Click vào 3 chấm (...) của deployment mới nhất
   - Chọn **Redeploy**

### 2. Kiểm Tra Backend CORS

Đảm bảo backend của bạn đã cấu hình CORS để cho phép frontend trên Vercel gọi API:

- Backend phải cho phép origin của Vercel (ví dụ: `https://your-app.vercel.app`)
- Kiểm tra file `CorsConfig.java` trong backend

### 3. Cách Test Đăng Ký

#### A. Test Trên Vercel (Production)

1. **Mở Browser Console (F12):**
   - Vào trang đăng ký trên Vercel
   - Mở Developer Tools (F12)
   - Chuyển sang tab **Console** và **Network**

2. **Thử Đăng Ký:**
   - Điền thông tin đăng ký:
     - **Email:** test@example.com
     - **Họ và tên:** Nguyễn Văn A
     - **Tên người dùng:** nguyenvana (tối thiểu 3 ký tự)
     - **Mật khẩu:** Test123!@# (phải có: chữ hoa, chữ thường, số, ký tự đặc biệt, tối thiểu 8 ký tự)
     - **Số điện thoại:** 0123456789 (10 số)
   - Click **Đăng ký**

3. **Kiểm Tra Network Tab:**
   - Tìm request đến endpoint `/api/v1/auth/register`
   - Kiểm tra:
     - **Status Code:** Nếu là 200 hoặc 201 → thành công
     - **Status Code 4xx/5xx:** → có lỗi
     - **Request URL:** Phải trỏ đến backend URL, KHÔNG phải localhost
     - **Response:** Xem message lỗi cụ thể

4. **Kiểm Tra Console:**
   - Xem có lỗi JavaScript nào không
   - Kiểm tra log từ code (các dòng `console.log`)

#### B. Kiểm Tra Environment Variable Đã Được Áp Dụng

1. **Trong Browser Console, chạy lệnh:**
```javascript
console.log('Backend URL:', import.meta.env.VITE_BACKEND_URL);
```
- Nếu hiển thị URL backend của bạn → ✅ Đúng
- Nếu hiển thị `undefined` → ❌ Environment variable chưa được set đúng

### 4. Debug Các Lỗi Thường Gặp

#### ❌ Lỗi: CORS Policy
**Dấu hiệu:** Console hiển thị "CORS policy: No 'Access-Control-Allow-Origin' header"

**Giải pháp:**
- Kiểm tra backend CORS config
- Thêm Vercel domain vào danh sách allowed origins

#### ❌ Lỗi: Network Error / Failed to Fetch
**Dấu hiệu:** Request bị failed, không có response

**Giải pháp:**
- Kiểm tra `VITE_BACKEND_URL` đã đúng chưa
- Kiểm tra backend có đang chạy không
- Kiểm tra firewall/security group

#### ❌ Lỗi: 404 Not Found
**Dấu hiệu:** Status code 404

**Giải pháp:**
- Kiểm tra endpoint path: `/api/v1/auth/register`
- Kiểm tra backend có deploy đúng endpoint này không

#### ❌ Lỗi: 500 Internal Server Error
**Dấu hiệu:** Status code 500

**Giải pháp:**
- Kiểm tra backend logs
- Có thể là lỗi database connection, validation, etc.

#### ❌ Lỗi Validation: "Mật khẩu phải chứa..."
**Dấu hiệu:** Response có message về validation

**Giải pháp:**
- Đảm bảo mật khẩu đáp ứng yêu cầu:
  - Tối thiểu 8 ký tự
  - Có chữ hoa (A-Z)
  - Có chữ thường (a-z)
  - Có số (0-9)
  - Có ký tự đặc biệt (@$!%*?&)
  - KHÔNG có khoảng trắng

### 5. Test Checklist

- [ ] Đã set `VITE_BACKEND_URL` trên Vercel
- [ ] Đã redeploy sau khi set environment variable
- [ ] Backend đang chạy và có thể truy cập được
- [ ] Backend CORS đã cấu hình đúng
- [ ] Đã test đăng ký với thông tin hợp lệ
- [ ] Đã kiểm tra Network tab trong DevTools
- [ ] Đã kiểm tra Console không có lỗi

### 6. Test Local với Environment Variable

Để test local giống như trên Vercel:

1. **Tạo file `.env.local` trong thư mục `FE/`:**
```env
VITE_BACKEND_URL=https://your-backend-url.com
```

2. **Chạy dev server:**
```bash
cd FE
npm run dev
```

3. **Kiểm tra:**
- Mở browser console
- Chạy: `console.log(import.meta.env.VITE_BACKEND_URL)`
- Phải hiển thị URL backend của bạn

### 7. Lưu Ý Quan Trọng

⚠️ **Environment Variables trong Vite:**
- Chỉ các biến bắt đầu với `VITE_` mới được expose ra client-side
- Các biến khác sẽ bị ẩn để bảo mật

⚠️ **Redeploy sau khi thay đổi Environment Variable:**
- Mỗi khi thêm/sửa environment variable trên Vercel, bạn PHẢI redeploy để áp dụng thay đổi

⚠️ **Backend URL:**
- KHÔNG thêm trailing slash `/` ở cuối
- KHÔNG thêm `/api/v1` vì code đã tự động thêm
- Ví dụ đúng: `https://api.example.com`
- Ví dụ sai: `https://api.example.com/api/v1/`

### 8. Liên Hệ Hỗ Trợ

Nếu vẫn gặp vấn đề sau khi làm theo hướng dẫn:
1. Chụp screenshot lỗi trong Console và Network tab
2. Copy error message cụ thể
3. Kiểm tra backend logs
4. Kiểm tra Vercel deployment logs




