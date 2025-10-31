# 🔧 Hướng dẫn fix lỗi redirect_uri_mismatch - Google OAuth

## ❌ Lỗi bạn đang gặp:

```
Lỗi 400: redirect_uri_mismatch

The redirect URI in the request: http://localhost:8080/login/oauth2/code/google
does not match the ones authorized for the OAuth client.
```

---

## ✅ GIẢI PHÁP - 5 BƯỚC ĐƠN GIẢN

### Bước 1: Truy cập Google Cloud Console

**Link trực tiếp:** https://console.cloud.google.com/apis/credentials

1. Đăng nhập tài khoản Google của bạn
2. Chọn project (nếu có nhiều)

---

### Bước 2: Tìm OAuth 2.0 Client ID

Tìm trong danh sách **OAuth 2.0 Client IDs** dòng có:

```
Client ID: 202746327765-9shovegi2uc1545d0gkdmpo16lvjut61.apps.googleusercontent.com
```

**Click vào tên** của Client ID này (thường là "Web client 1" hoặc tương tự)

---

### Bước 3: Cấu hình Authorized JavaScript origins

Kéo lên đầu, tìm phần **"Authorized JavaScript origins"**

Click **"+ ADD URI"**

Thêm lần lượt 2 URIs sau:

```
http://localhost:8080
```

```
http://localhost:5000
```

**Kết quả sẽ như này:**

```
┌─────────────────────────────────────────────────────────┐
│ Authorized JavaScript origins                           │
├─────────────────────────────────────────────────────────┤
│  URIs 1   http://localhost:8080                    [X]  │
│  URIs 2   http://localhost:5000                    [X]  │
│                                                         │
│  + ADD URI                                              │
└─────────────────────────────────────────────────────────┘
```

---

### Bước 4: Cấu hình Authorized redirect URIs

Kéo xuống, tìm phần **"Authorized redirect URIs"**

Click **"+ ADD URI"**

Thêm URI này:

```
http://localhost:8080/login/oauth2/code/google
```

**⚠️ QUAN TRỌNG:**
- Phải gõ chính xác, không thừa/thiếu ký tự nào
- Phải là `localhost:8080` (backend port)
- Phải có đầy đủ `/login/oauth2/code/google`

**Kết quả sẽ như này:**

```
┌──────────────────────────────────────────────────────────────┐
│ Authorized redirect URIs                                     │
├──────────────────────────────────────────────────────────────┤
│  URIs 1   http://localhost:8080/login/oauth2/code/google [X]│
│                                                              │
│  + ADD URI                                                   │
└──────────────────────────────────────────────────────────────┘
```

---

### Bước 5: Lưu và đợi

1. Kéo xuống dưới cùng
2. Click nút **"SAVE"** màu xanh
3. Đợi thông báo "OAuth client updated"
4. **Đợi 1-2 phút** để Google cập nhật hệ thống

---

## 🧪 Test lại sau khi cấu hình

### A. Xóa cache trình duyệt

**Chrome/Edge:**
1. Press `Ctrl + Shift + Delete`
2. Chọn "Cookies and other site data"
3. Time range: "All time"
4. Click "Clear data"

**Firefox:**
1. Press `Ctrl + Shift + Delete`
2. Chọn "Cookies" và "Cache"
3. Click "Clear Now"

### B. Restart Backend

```bash
# Terminal backend
Ctrl + C  (dừng backend)

# Chạy lại
cd BE
mvn spring-boot:run
```

Đợi backend start xong, thấy log:
```
Tomcat started on port(s): 8080 (http)
```

### C. Test đăng nhập

1. Mở trình duyệt mới (hoặc Incognito mode)
2. Truy cập: `http://localhost:5000`
3. Click nút **"Đăng nhập bằng Google"**
4. Chọn tài khoản Google
5. Click **"Đồng ý"** (nếu hỏi quyền)
6. **Thành công!** ✅ Bạn sẽ được redirect về trang chủ

---

## 🐛 Vẫn lỗi? Troubleshooting

### Lỗi 1: Vẫn báo redirect_uri_mismatch

**Nguyên nhân:** Google chưa cập nhật xong hoặc cache trình duyệt

**Giải pháp:**
1. Đợi thêm 2-3 phút
2. Thử Incognito mode (Ctrl + Shift + N)
3. Thử trình duyệt khác

### Lỗi 2: Backend không chạy port 8080

**Kiểm tra:**
```bash
# Xem port backend đang chạy
# Tìm dòng log:
Tomcat started on port(s): XXXX (http)
```

**Nếu port khác 8080:**
- Update URI thành: `http://localhost:XXXX/login/oauth2/code/google`
- Thay `XXXX` bằng port thực tế

### Lỗi 3: Không tìm thấy OAuth Client ID

**Kiểm tra:**
1. Bạn đã đăng nhập đúng tài khoản Google chưa?
2. Bạn đã chọn đúng project chưa?
3. Thử tìm bằng Client ID: `202746327765-9shovegi2uc1545d0gkdmpo16lvjut61`

---

## 📋 Checklist hoàn thành

Đảm bảo bạn đã làm đủ các bước:

- [ ] Đã thêm `http://localhost:8080` vào Authorized JavaScript origins
- [ ] Đã thêm `http://localhost:5000` vào Authorized JavaScript origins  
- [ ] Đã thêm `http://localhost:8080/login/oauth2/code/google` vào Authorized redirect URIs
- [ ] Đã click SAVE trong Google Console
- [ ] Đã đợi 1-2 phút
- [ ] Đã xóa cache trình duyệt
- [ ] Đã restart backend
- [ ] Backend đang chạy ở port 8080

---

## 🎯 Cấu hình đầy đủ cuối cùng

```
Authorized JavaScript origins:
├── http://localhost:8080
└── http://localhost:5000

Authorized redirect URIs:
└── http://localhost:8080/login/oauth2/code/google
```

---

## 📞 Cần hỗ trợ thêm?

Nếu sau khi làm theo hướng dẫn vẫn lỗi, hãy cung cấp:

1. Screenshot màn hình Google Console (phần Authorized redirect URIs)
2. Log backend khi start (dòng "Tomcat started on port...")
3. URL đầy đủ hiện trên thanh địa chỉ khi lỗi xảy ra

Tôi sẽ hỗ trợ bạn ngay! 🚀


