# 🔍 DEBUG DASHBOARD - HƯỚNG DẪN CHI TIẾT

## 🎯 MỤC TIÊU
Dashboard hiển thị 0 → Tìm nguyên nhân và fix!

---

## 📋 CÁC BƯỚC DEBUG:

### **BƯỚC 1: MỞ DEVTOOLS**
1. Mở trang: `http://localhost:5173/admin/dashboard`
2. Nhấn **F12** (hoặc Ctrl + Shift + I)
3. Chọn tab **Console**

---

### **BƯỚC 2: KIỂM TRA TOKEN**
Paste lệnh này vào Console:
```javascript
localStorage.getItem('access_token')
```

**Kết quả:**
- ❌ **null** → Cần login lại (→ BƯỚC 6)
- ✅ **Có giá trị dài** → OK, tiếp tục BƯỚC 3

---

### **BƯỚC 3: KIỂM TRA NETWORK**
1. Chọn tab **Network** trong DevTools
2. Refresh trang (**F5**)
3. Tìm request tên **`stats`** trong danh sách

**Nếu KHÔNG thấy `stats`:**
- → Frontend KHÔNG GỌI API
- → Xem Console có lỗi đỏ không?

---

### **BƯỚC 4: XEM STATUS CODE**
1. Click vào request **`stats`**
2. Xem cột **Status**

**Các trường hợp:**
- ✅ **200** (xanh) → API OK, xem BƯỚC 5
- ❌ **401** (đỏ) → Token expired, login lại (→ BƯỚC 6)
- ❌ **403** (đỏ) → Không có quyền, sai role
- ❌ **500** (đỏ) → Backend lỗi

---

### **BƯỚC 5: XEM RESPONSE DATA**
1. Vẫn ở request **`stats`**
2. Chọn tab **Response** hoặc **Preview**
3. Xem có data không?

**Nếu CÓ data:**
- → Backend OK, nhưng Frontend không render
- → Xem Console có lỗi React không?

---

### **BƯỚC 6: LOGIN LẠI** (Nếu cần)
1. Logout admin (click avatar → Logout)
2. Login lại:
   - Email: `admin@evcare.com`
   - Password: `Admin@123`
3. Vào `/admin/dashboard`
4. Xem có data không?

---

## ❓ CHO TÔI BIẾT:

Sau khi làm xong các bước, báo lại:
1. ✅/❌ Token có tồn tại không? (BƯỚC 2)
2. ✅/❌ Request `stats` có xuất hiện không? (BƯỚC 3)
3. 📊 Status code là gì? (BƯỚC 4)
4. 📊 Response có data không? (BƯỚC 5)

---

## 🛠️ GIẢI PHÁP DỰA TRÊN KẾT QUẢ:

### **Trường hợp 1: Token = null**
→ Login lại admin

### **Trường hợp 2: Không có request `stats`**
→ Lỗi React, xem Console errors

### **Trường hợp 3: Status 401/403**
→ Login lại admin

### **Trường hợp 4: Status 500**
→ Backend lỗi, xem backend logs

### **Trường hợp 5: Status 200 + Có data + Vẫn hiển thị 0**
→ Lỗi React render, xem Console errors

---

## 📞 HỖ TRỢ
Báo lại kết quả từng bước, tôi sẽ fix ngay! 🚀

