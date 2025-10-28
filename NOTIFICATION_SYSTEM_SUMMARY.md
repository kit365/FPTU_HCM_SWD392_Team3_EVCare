# HỆ THỐNG THÔNG BÁO - SUMMARY

## ✅ CÁC FILE ĐÃ TẠO

### 1. Enum
- **NotificationTypeEnum.java** - 4 loại thông báo:
  - REMINDER (Nhắc nhở)
  - ALERT (Cảnh báo)
  - UPDATE (Cập nhật)
  - SYSTEM (Hệ thống)

### 2. Entity
- **NotificationEntity.java** - Bảng thông báo với các trường:
  - notificationId (UUID)
  - user (UserEntity) - Người dùng nhận thông báo
  - appointment (AppointmentEntity) - Liên kết với lịch hẹn (optional)
  - message (MessageEntity) - Liên kết với tin nhắn (optional)
  - maintenanceManagement (MaintenanceManagementEntity) - Liên kết với quản lý bảo trì (optional)
  - invoice (InvoiceEntity) - Liên kết với hóa đơn (optional)
  - notificationType (NotificationTypeEnum) - Loại thông báo
  - title (String) - Tiêu đề thông báo
  - content (String) - Nội dung thông báo
  - isRead (Boolean) - Đã đọc chưa
  - sentAt (LocalDateTime) - Thời gian gửi
  - Extends BaseEntity (isDeleted, isActive, createdAt, updatedAt, createdBy, updatedBy)

### 3. Repository
- **NotificationRepository.java** - Các phương thức:
  - findAllByUserId() - Lấy tất cả thông báo của user
  - findUnreadNotificationsByUserId() - Lấy thông báo chưa đọc
  - countUnreadNotifications() - Đếm số thông báo chưa đọc
  - findByUserIdAndIsRead() - Lọc theo trạng thái đọc/chưa đọc

### 4. DTOs
- **CreationNotificationRequest.java** - Request tạo thông báo
- **NotificationResponse.java** - Response thông báo

### 5. Mapper
- **NotificationMapper.java** - Map giữa Entity và DTO

### 6. Constants
- **NotificationConstants.java** - Các hằng số cho thông báo

### 7. Service
- **NotificationService.java** - Interface
- **NotificationServiceImpl.java** - Implementation với các method:
  - createNotification() - Tạo thông báo
  - getNotification() - Lấy chi tiết thông báo
  - getAllNotifications() - Lấy tất cả thông báo
  - getUnreadNotifications() - Lấy thông báo chưa đọc
  - getUnreadCount() - Đếm số thông báo chưa đọc
  - markAsRead() - Đánh dấu đã đọc
  - markAllAsRead() - Đánh dấu tất cả đã đọc
  - deleteNotification() - Xóa thông báo (soft delete)

### 8. Controller
- **NotificationController.java** - REST API endpoints:
  - POST /api/v1/notifications - Tạo thông báo
  - GET /api/v1/notifications/{id} - Lấy chi tiết thông báo
  - GET /api/v1/notifications - Lấy tất cả thông báo
  - GET /api/v1/notifications/unread - Lấy thông báo chưa đọc
  - GET /api/v1/notifications/unread-count - Lấy số thông báo chưa đọc
  - PUT /api/v1/notifications/{id}/mark-read - Đánh dấu đã đọc
  - PUT /api/v1/notifications/mark-all-read - Đánh dấu tất cả đã đọc
  - DELETE /api/v1/notifications/{id} - Xóa thông báo

## 🔒 BẢO MẬT
- Tất cả endpoints yêu cầu authentication (user-id header)
- Chỉ chủ sở hữu mới có thể xem/xóa thông báo của mình
- Có kiểm tra quyền truy cập (authorization)

## 📊 CÁC TRƯỜNG TRONG BẢNG
Dựa trên schema SQL đã cung cấp, tất cả các trường đều đã được implement:
- ✅ id (notificationId) - UUID
- ✅ user_id (user) - Foreign Key to Users
- ✅ appointment_id (appointment) - Foreign Key to Appointments (optional)
- ✅ message_id (message) - Foreign Key to Messages (optional)
- ✅ maintenance_management_id (maintenanceManagement) - Foreign Key to Maintenance_management (optional)
- ✅ invoice_id (invoice) - Foreign Key to Invoices (optional)
- ✅ notification_type (notificationType) - Enum (reminder, alert, update, system)
- ✅ title - VARCHAR(100)
- ✅ content - TEXT
- ✅ is_read (isRead) - BOOLEAN
- ✅ sent_at (sentAt) - TIMESTAMP
- ✅ is_active (isActive) - BOOLEAN (từ BaseEntity)
- ✅ is_deleted (isDeleted) - BOOLEAN (từ BaseEntity)
- ✅ created_at (createdAt) - TIMESTAMP (từ BaseEntity)
- ✅ created_by (createdBy) - VARCHAR(255) (từ BaseEntity)
- ✅ updated_at (updatedAt) - TIMESTAMP (từ BaseEntity)
- ✅ updated_by (updatedBy) - VARCHAR(255) (từ BaseEntity)

## 🎯 TÍNH NĂNG
1. ✅ Tạo thông báo với liên kết đến các entity khác (appointment, message, maintenance, invoice)
2. ✅ Xem tất cả thông báo của user
3. ✅ Xem thông báo chưa đọc
4. ✅ Đếm số thông báo chưa đọc
5. ✅ Đánh dấu đã đọc (từng thông báo)
6. ✅ Đánh dấu tất cả đã đọc
7. ✅ Xóa thông báo (soft delete)
8. ✅ Phân trang (pagination)
9. ✅ Kiểm tra quyền truy cập (authorization)
10. ✅ Soft delete (không xóa hẳn dữ liệu)

## 📝 GHI CHÚ
- Không cần thêm sửa database schema vì tất cả đã có trong BaseEntity
- Tất cả thông báo đều cần có user_id
- Các liên kết (appointment_id, message_id, etc.) là optional
- Hệ thống sử dụng soft delete (is_deleted = true) thay vì xóa vật lý

