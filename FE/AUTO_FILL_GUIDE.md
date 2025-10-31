# Hướng dẫn Chức năng Fill Tự động từ Dữ liệu Cũ

## Tổng quan
Chức năng "Dùng dữ liệu cũ" đã được cập nhật để tự động điền đầy đủ thông tin theo thứ tự: **Mẫu xe → Dịch vụ → Loại hình dịch vụ**.

## API được sử dụng
- **Endpoint**: `GET /api/v1/appointment/user/{user-id}`
- **Chức năng**: Lấy thông tin cuộc hẹn của người dùng
- **Roles**: ADMIN, STAFF - Hiển thị thông tin cụ thể cuộc hẹn của người dùng

## Các thay đổi chính

### 1. Cập nhật ViewOldDataModal
- **File**: `src/pages/client/booking/ViewOldDataModal.tsx`
- **Thay đổi**:
  - Thêm thông tin `vehicleTypeId`, `serviceTypeIds`, `serviceTypeNames`, `serviceMode` vào `VehicleProfileData`
  - Mapping dữ liệu từ API response để lấy đầy đủ thông tin
  - Hiển thị danh sách dịch vụ đã chọn trước đó trong modal

### 2. Cập nhật ServiceBooking
- **File**: `src/pages/client/booking/ServiceBooking.tsx`
- **Thay đổi**:
  - Cập nhật `handleSelectVehicle` để fill tự động theo thứ tự
  - Thêm logic load service types dựa trên vehicle type đã chọn
  - Fill tự động các dropdown theo thứ tự

## Luồng hoạt động

### Khi user chọn "Dùng dữ liệu cũ":

1. **Hiển thị Modal**: 
   - Load danh sách cuộc hẹn cũ của user từ API
   - Hiển thị thông tin xe, dịch vụ đã chọn, ngày hẹn

2. **Khi user chọn một xe**:
   - **Bước 1**: Fill thông tin cơ bản (tên, SĐT, email, biển số, km, ghi chú, địa chỉ)
   - **Bước 2**: Fill mẫu xe (vehicleType dropdown)
   - **Bước 3**: Load danh sách dịch vụ cho mẫu xe đã chọn
   - **Bước 4**: Fill dịch vụ đã chọn trước đó (services dropdown)
   - **Bước 5**: Fill loại hình dịch vụ (serviceType dropdown)

3. **Kết quả**: Form được điền đầy đủ, user có thể chỉnh sửa nếu cần

## Cấu trúc dữ liệu

### VehicleProfileData Interface
```typescript
interface VehicleProfileData {
  // Thông tin cơ bản
  appointmentId: string;
  vehicleName: string;
  licensePlate: string;
  customerName: string;
  phone: string;
  email: string;
  mileage: string;
  lastServiceDate: string;
  serviceType: string;
  
  // Thông tin để fill tự động
  vehicleTypeId: string;
  vehicleTypeName: string;
  serviceTypeIds: string[];
  serviceTypeNames: string[];
  serviceMode: string;
  userAddress?: string;
  notes?: string;
}
```

## Thông báo cho người dùng

- **Thành công đầy đủ**: "Đã điền đầy đủ thông tin từ hồ sơ xe! Bạn có thể chỉnh sửa nếu cần."
- **Thành công một phần**: "Đã điền thông tin cơ bản và mẫu xe. Vui lòng chọn dịch vụ."
- **Lỗi load dịch vụ**: "Đã điền thông tin cơ bản và mẫu xe. Vui lòng chọn dịch vụ thủ công."
- **Lỗi chung**: "Có lỗi khi điền thông tin từ hồ sơ xe."

## Lợi ích

1. **Tiết kiệm thời gian**: User không cần nhập lại thông tin đã có
2. **Chính xác**: Sử dụng dữ liệu từ cuộc hẹn trước đó
3. **Linh hoạt**: User vẫn có thể chỉnh sửa thông tin sau khi fill
4. **Thông minh**: Tự động load và fill theo thứ tự logic

## Xử lý lỗi

- Nếu không load được service types: Vẫn fill được thông tin cơ bản và mẫu xe
- Nếu không có service types trong dữ liệu cũ: Chỉ fill thông tin cơ bản và mẫu xe
- Nếu có lỗi API: Hiển thị thông báo lỗi và không fill gì

## Testing

Để test chức năng:

1. **Tạo cuộc hẹn mới** với đầy đủ thông tin
2. **Quay lại trang booking** và click "Dùng dữ liệu cũ"
3. **Chọn xe vừa tạo** từ danh sách
4. **Kiểm tra** xem form có được fill đầy đủ không
5. **Chỉnh sửa** một số thông tin và submit để đảm bảo vẫn hoạt động bình thường
