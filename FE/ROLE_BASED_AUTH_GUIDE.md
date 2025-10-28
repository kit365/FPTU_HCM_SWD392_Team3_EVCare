# Hướng dẫn Hệ thống Phân quyền Đăng nhập

## Tổng quan
Hệ thống đã được cập nhật để đảm bảo rằng mỗi loại tài khoản chỉ có thể đăng nhập vào đúng trang của mình:

- **Admin/Staff/Technician**: Chỉ có thể đăng nhập qua `/admin/login`
- **Customer/Client**: Chỉ có thể đăng nhập qua `/client/login`

## Các thay đổi chính

### 1. Hook useRoleBasedAuth
- **File**: `src/hooks/useRoleBasedAuth.ts`
- **Chức năng**: Kiểm tra role của user sau khi đăng nhập và xử lý redirect hoặc hiển thị lỗi
- **Tham số**:
  - `allowedRoles`: Mảng các role được phép
  - `redirectPath`: Đường dẫn redirect khi role phù hợp
  - `errorMessage`: Thông báo lỗi khi role không phù hợp

### 1.1. Hook useRoleBasedRegister
- **File**: `src/hooks/useRoleBasedRegister.ts`
- **Chức năng**: Xử lý đăng ký và tự động đăng nhập với kiểm tra role
- **Tham số**:
  - `allowedRoles`: Mảng các role được phép
  - `redirectPath`: Đường dẫn redirect khi role phù hợp
  - `errorMessage`: Thông báo lỗi khi role không phù hợp

### 2. Trang Admin Login
- **File**: `src/pages/admin/login/Login.tsx`
- **Thay đổi**: Sử dụng `useRoleBasedAuth` với `allowedRoles={['ADMIN', 'STAFF', 'TECHNICIAN']}`
- **Hành vi**: Nếu client cố đăng nhập, sẽ hiển thị thông báo lỗi và không cho phép đăng nhập

### 3. Trang Client Login
- **File**: `src/pages/client/account/ClientLogin.tsx`
- **Thay đổi**: Sử dụng `useRoleBasedAuth` với `allowedRoles={['CUSTOMER', 'CLIENT']}`
- **Hành vi**: Nếu admin cố đăng nhập, sẽ hiển thị thông báo lỗi và không cho phép đăng nhập

### 4. Trang Client Register
- **File**: `src/pages/client/account/ClientRegister.tsx`
- **Thay đổi**: Sử dụng `useRoleBasedRegister` với `allowedRoles={['CUSTOMER', 'CLIENT']}`
- **Hành vi**: Sau khi đăng ký thành công, tự động đăng nhập và chuyển hướng đến trang client

### 5. RootRedirect Component
- **File**: `src/components/common/RootRedirect.tsx`
- **Cải tiến**: Xử lý tốt hơn việc phân quyền dựa trên `isAdmin` và `roleName`

### 6. Auth Hooks
- **Files**: `src/hooks/useAuth.ts`, `src/hooks/useAuthClient.ts`
- **Thay đổi**: Loại bỏ việc tự động navigate về "/", để `useRoleBasedAuth` xử lý

## Luồng hoạt động

### Khi Admin đăng nhập qua `/admin/login`:
1. User nhập thông tin đăng nhập
2. `useRoleBasedAuth.login()` gọi API và lưu token
3. `refreshUser()` cập nhật thông tin user trong context
4. `useRoleBasedAuth` kiểm tra role:
   - Nếu là ADMIN/STAFF/TECHNICIAN → Redirect đến `/admin`
   - Nếu là CUSTOMER/CLIENT → Hiển thị thông báo lỗi và không cho phép đăng nhập

### Khi Client đăng nhập qua `/client/login`:
1. User nhập thông tin đăng nhập
2. `useRoleBasedAuth.login()` gọi API và lưu token
3. `refreshUser()` cập nhật thông tin user trong context
4. `useRoleBasedAuth` kiểm tra role:
   - Nếu là CUSTOMER/CLIENT → Redirect đến `/client`
   - Nếu là ADMIN/STAFF/TECHNICIAN → Hiển thị thông báo lỗi và không cho phép đăng nhập

### Khi Client đăng ký qua `/client/register`:
1. User nhập thông tin đăng ký
2. `useRoleBasedRegister.registerAndLogin()` gọi API đăng ký
3. Nếu đăng ký thành công, tự động gọi API đăng nhập
4. Lưu token và `refreshUser()` cập nhật thông tin user
5. `useRoleBasedRegister` kiểm tra role:
   - Nếu là CUSTOMER/CLIENT → Redirect đến `/client`
   - Nếu là ADMIN/STAFF/TECHNICIAN → Hiển thị thông báo lỗi và không cho phép đăng nhập

### Khi truy cập root path `/`:
1. `RootRedirect` kiểm tra trạng thái đăng nhập
2. Nếu chưa đăng nhập → Redirect đến `/client`
3. Nếu đã đăng nhập:
   - Admin role → Redirect đến `/admin/dashboard`
   - Client role → Redirect đến `/client`

## Thông báo cho người dùng

Khi user cố đăng nhập với role không phù hợp, hệ thống sẽ:
1. Hiển thị toast notification với thông báo lỗi phù hợp
2. Xóa token và không cho phép đăng nhập
3. User phải đăng nhập lại với tài khoản đúng role

## Các role được hỗ trợ

### Admin Roles:
- `ADMIN`: Quản trị viên
- `STAFF`: Nhân viên
- `TECHNICIAN`: Kỹ thuật viên

### Client Roles:
- `CUSTOMER`: Khách hàng
- `CLIENT`: Khách hàng (alias)

## Bảo mật

- Mỗi trang login chỉ chấp nhận đúng role của mình
- Không thể bypass bằng cách truy cập trực tiếp URL
- Thông báo rõ ràng khi có vi phạm quyền truy cập
- Tự động redirect để đảm bảo user ở đúng trang

## Testing

Để test hệ thống:

1. **Test Admin login với client account**:
   - Truy cập `http://localhost:5000/admin/login`
   - Đăng nhập với tài khoản client
   - Kết quả: Thông báo lỗi và không cho phép đăng nhập

2. **Test Client login với admin account**:
   - Truy cập `http://localhost:5000/client/login`
   - Đăng nhập với tài khoản admin
   - Kết quả: Thông báo lỗi và không cho phép đăng nhập

3. **Test đăng ký và tự động đăng nhập**:
   - Client đăng ký qua `/client/register` → Tự động đăng nhập và redirect đến `/client`

4. **Test đăng nhập đúng role**:
   - Admin đăng nhập qua `/admin/login` → Redirect đến `/admin`
   - Client đăng nhập qua `/client/login` → Redirect đến `/client`
