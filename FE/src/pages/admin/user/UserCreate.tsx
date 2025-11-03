import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Modal, Button, Box } from '@mui/material';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { notify } from '../../../components/admin/common/Toast';
import { userService } from '../../../service/userService';
import { roleService } from '../../../service/roleService';
import type { RoleResponse } from '../../../types/admin/role';
import { handleApiError } from '../../../utils/handleApiError';
import { ImageUpload } from '../../../components/admin/common/ImageUpload';
import type { UserResponse } from '../../../types/user.types';

export default function UserCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    numberPhone: '',
    address: '',
    avatarUrl: '',
    roleIds: [] as string[],
    technicianSkills: '',
  });

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    numberPhone: '',
    roleIds: '',
  });

  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [deletedUser, setDeletedUser] = useState<UserResponse | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const allRoles = await roleService.getAllRoles();
      // Filter to show only STAFF and TECHNICIAN
      const filteredRoles = allRoles.filter(
        role => role.roleName === 'STAFF' || role.roleName === 'TECHNICIAN'
      );
      setRoles(filteredRoles);
    } catch (error: any) {
      notify.error('Không thể tải danh sách vai trò');
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Real-time phone validation
    if (name === 'numberPhone') {
      if (value && !/^\d{0,10}$/.test(value)) {
        setErrors(prev => ({ ...prev, numberPhone: 'Chỉ được nhập số' }));
        return;
      }
      if (value && value.length > 0 && value.length !== 10) {
        setErrors(prev => ({ ...prev, numberPhone: 'Số điện thoại phải đúng 10 chữ số' }));
      } else {
        setErrors(prev => ({ ...prev, numberPhone: '' }));
      }
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRoleId = e.target.value;
    if (selectedRoleId) {
      setFormData(prev => ({ ...prev, roleIds: [selectedRoleId] }));
      setErrors(prev => ({ ...prev, roleIds: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      username: '',
      email: '',
      password: '',
      numberPhone: '',
      roleIds: '',
    };

    if (!formData.username || formData.username.length < 3) {
      newErrors.username = 'Username phải có ít nhất 3 ký tự';
    } else if (formData.username.length > 20) {
      newErrors.username = 'Username có tối đa 20 ký tự';
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      newErrors.password = 'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt';
    }

    if (formData.numberPhone && formData.numberPhone.length !== 10) {
      newErrors.numberPhone = 'Số điện thoại phải đúng 10 chữ số';
    }

    if (formData.roleIds.length === 0) {
      newErrors.roleIds = 'Vui lòng chọn vai trò';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  // Check if user exists (including deleted ones)
  const checkDeletedUser = async (): Promise<UserResponse | null> => {
    try {
      // Try to get user by email (will only return non-deleted users)
      const user = await userService.getUserProfile(formData.email);
      return user || null;
    } catch (error: any) {
      // If not found, try username
      try {
        const user = await userService.getUserProfile(formData.username);
        return user || null;
      } catch (error2: any) {
        // If still not found, try phone (if provided)
        if (formData.numberPhone) {
          try {
            const user = await userService.getUserProfile(formData.numberPhone);
            return user || null;
          } catch (error3: any) {
            return null;
          }
        }
        return null;
      }
    }
  };

  // Since backend doesn't have API to find deleted users directly,
  // we'll create a mock user object with the form data to show in modal
  // The actual restore will need backend support to find the deleted user by email/username/phone
  const createMockDeletedUser = (): UserResponse => {
    return {
      userId: '', // Will be empty, backend needs to find this
      email: formData.email,
      username: formData.username,
      numberPhone: formData.numberPhone || undefined,
      fullName: formData.fullName || undefined,
      isDeleted: true,
    } as UserResponse;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      notify.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    try {
      setSubmitting(true);

      // First, check if user already exists (not deleted)
      const existingUser = await checkDeletedUser();
      if (existingUser && !existingUser.isDeleted) {
        notify.error('Người dùng này đã tồn tại và đang hoạt động');
        setSubmitting(false);
        return;
      }

      // Determine if user is STAFF or TECHNICIAN
      const selectedRole = roles.find(r => r.roleId === formData.roleIds[0]);
      const roleName = selectedRole?.roleName;
      const isStaffOrTechnician = roleName === 'STAFF' || roleName === 'TECHNICIAN';
      
      // Call API to create user
      // Set isActive = false for STAFF and TECHNICIAN (they need employee profile first)
      const success = await userService.create({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName || undefined,
        numberPhone: formData.numberPhone || undefined,
        address: formData.address || undefined,
        roleIds: formData.roleIds,
        isActive: isStaffOrTechnician ? false : undefined, // Set false for staff/technician, undefined for others
      });
      
      if (success) {
        notify.success(`Thêm ${roleName === 'STAFF' ? 'nhân viên' : 'kỹ thuật viên'} thành công!`);
        // Navigate back to staff management page
        setTimeout(() => {
          navigate('/admin/users/staff');
        }, 500);
      }
    } catch (error: any) {
      // Check if error is due to duplicate (user might be deleted)
      const errorMessage = error?.response?.data?.message || error?.message || '';
      
      if (errorMessage.includes('đã tồn tại') || errorMessage.includes('duplicated') || 
          errorMessage.includes('Email này') || errorMessage.includes('Username này') || 
          errorMessage.includes('Số điện thoại này')) {
        
        // Check if user exists and is not deleted
        const existingUser = await checkDeletedUser();
        
        if (existingUser && !existingUser.isDeleted) {
          // User exists and is active, show error
          handleApiError(error, 'Người dùng này đã tồn tại và đang hoạt động');
        } else {
          // User might be deleted, show restore modal
          // Note: We create a mock user object since backend doesn't expose deleted users
          const mockDeletedUser = createMockDeletedUser();
          setDeletedUser(mockDeletedUser);
          setRestoreModalOpen(true);
        }
      } else {
        // Other errors
        handleApiError(error, 'Có lỗi xảy ra khi thêm người dùng');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestoreUser = async () => {
    if (!deletedUser) return;

    try {
      setRestoring(true);
      
      // Try to find the deleted user
      const foundDeletedUser = await userService.findDeletedUser({
        email: formData.email,
        username: formData.username,
        phone: formData.numberPhone,
      });
      
      if (!foundDeletedUser || !foundDeletedUser.userId) {
        notify.error('Không tìm thấy user đã bị xóa. Vui lòng đảm bảo backend có API hỗ trợ tìm user đã bị xóa.');
        setRestoreModalOpen(false);
        setDeletedUser(null);
        return;
      }
      
      // Restore the deleted user
      await userService.restore(foundDeletedUser.userId);
      
      // Update the restored user with new information from form
      const selectedRole = roles.find(r => r.roleId === formData.roleIds[0]);
      const isStaffOrTechnician = selectedRole?.roleName === 'STAFF' || selectedRole?.roleName === 'TECHNICIAN';
      
      await userService.update(foundDeletedUser.userId, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName || undefined,
        numberPhone: formData.numberPhone || undefined,
        address: formData.address || undefined,
        roleIds: formData.roleIds,
        isActive: isStaffOrTechnician ? false : undefined,
        avatarUrl: formData.avatarUrl || undefined,
        technicianSkills: formData.technicianSkills || undefined,
      });

      notify.success('Khôi phục và cập nhật người dùng thành công!');
      setRestoreModalOpen(false);
      setDeletedUser(null);
      
      setTimeout(() => {
        navigate('/admin/users/staff');
      }, 500);
    } catch (error: any) {
      // If findDeletedUser API doesn't exist, show helpful error
      if (error?.response?.status === 404 || error?.message?.includes('404')) {
        notify.error('Backend chưa hỗ trợ API tìm user đã bị xóa. Vui lòng liên hệ developer để thêm các endpoint: /user/deleted/by-email, /user/deleted/by-username, /user/deleted/by-phone');
      } else {
        handleApiError(error, 'Có lỗi xảy ra khi khôi phục người dùng');
      }
    } finally {
      setRestoring(false);
    }
  };

  const handleCancelRestore = () => {
    setRestoreModalOpen(false);
    setDeletedUser(null);
    // Stay on the form page
  };

  const handleCancel = () => {
    navigate('/admin/users/staff');
  };

  const selectedRole = roles.find(r => r.roleId === formData.roleIds[0]);
  const isTechnician = selectedRole?.roleName === 'TECHNICIAN';

  if (loadingRoles) {
    return (
      <div className="max-w-[1320px] px-[12px] mx-auto">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        {/* Header with back button */}
        <div className="p-[2.4rem] flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeftOutlined className="text-[2rem]" />
          </button>
          <h2 className="text-admin-secondary text-[1.6rem] font-[500] leading-[1.2]">
            Thêm nhân viên mới
          </h2>
        </div>

        <div className="px-[2.4rem] pb-[2.4rem]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role Selection */}
              <div className="md:col-span-2">
                <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                  Vai trò <span className="text-red-500">*</span>
                </label>
                <select
                  name="roleIds"
                  value={formData.roleIds[0] || ''}
                  onChange={handleRoleChange}
                  className={`w-full px-4 py-3 text-[1.3rem] border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.roleIds ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">-- Chọn vai trò --</option>
                  {roles.map(role => (
                    <option key={role.roleId} value={role.roleId}>
                      {role.roleName === 'STAFF' ? 'Nhân viên (Staff)' : 'Kỹ thuật viên (Technician)'}
                    </option>
                  ))}
                </select>
                {errors.roleIds && (
                  <p className="text-red-500 text-[1.1rem] mt-1">{errors.roleIds}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-[1.3rem] border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập tên đăng nhập"
                />
                {errors.username && (
                  <p className="text-red-500 text-[1.1rem] mt-1">{errors.username}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-[1.3rem] border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="example@evcare.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-[1.1rem] mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-[1.3rem] border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ít nhất 8 ký tự"
                />
                {errors.password && (
                  <p className="text-red-500 text-[1.1rem] mt-1">{errors.password}</p>
                )}
                <p className="text-gray-500 text-[1.1rem] mt-1">
                  Phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-[1.3rem] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập họ và tên"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  name="numberPhone"
                  value={formData.numberPhone}
                  onChange={handleChange}
                  maxLength={10}
                  className={`w-full px-4 py-3 text-[1.3rem] border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.numberPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0901234567"
                />
                {errors.numberPhone && (
                  <p className="text-red-500 text-[1.1rem] mt-1">{errors.numberPhone}</p>
                )}
                <p className="text-gray-500 text-[1.1rem] mt-1">
                  Phải là 10 chữ số (hoặc để trống)
                </p>
              </div>
            </div>

            {/* Avatar Upload */}
            <ImageUpload
              value={formData.avatarUrl}
              onChange={(url) => setFormData(prev => ({ ...prev, avatarUrl: url }))}
              label="Ảnh đại diện (tùy chọn)"
            />

            {/* Continue with other fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Address */}
              <div className={isTechnician ? '' : 'md:col-span-2'}>
                <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 text-[1.3rem] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập địa chỉ"
                />
              </div>

              {/* Technician Skills - Only show if Technician role */}
              {isTechnician && (
                <div className="md:col-span-2">
                  <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                    Kỹ năng kỹ thuật viên
                  </label>
                  <textarea
                    name="technicianSkills"
                    value={formData.technicianSkills}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 text-[1.3rem] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập kỹ năng (ví dụ: Sửa xe điện, thay pin, bảo dưỡng)"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 text-[1.3rem] font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-3 text-[1.3rem] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                disabled={submitting}
              >
                {submitting ? 'Đang tạo...' : 'Tạo người dùng'}
              </button>
            </div>
          </form>
        </div>
      </Card>

      {/* Restore User Confirmation Modal */}
      <Modal
        open={restoreModalOpen}
        onClose={handleCancelRestore}
        aria-labelledby="restore-modal-title"
        aria-describedby="restore-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <h2
            id="restore-modal-title"
            className="text-[2rem] font-bold mb-4 text-[#2b2d3b]"
          >
            Phát hiện người dùng đã bị xóa
          </h2>
          <div id="restore-modal-description" className="text-[1.4rem] text-[#666] mb-6 space-y-3">
            <p>
              Chúng tôi phát hiện có người dùng đã bị xóa với thông tin tương tự:
            </p>
            {deletedUser && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Email:</strong> {deletedUser.email}</p>
                {deletedUser.username && <p><strong>Username:</strong> {deletedUser.username}</p>}
                {deletedUser.numberPhone && <p><strong>Số điện thoại:</strong> {deletedUser.numberPhone}</p>}
                {deletedUser.fullName && <p><strong>Họ tên:</strong> {deletedUser.fullName}</p>}
              </div>
            )}
            <p className="mt-4">
              Bạn có muốn <strong>khôi phục</strong> người dùng này và cập nhật thông tin mới không?
            </p>
            <p className="text-[1.2rem] text-[#999]">
              Nếu chọn khôi phục, thông tin của người dùng sẽ được cập nhật theo form bạn vừa nhập.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              onClick={handleCancelRestore}
              variant="outlined"
              disabled={restoring}
              sx={{
                textTransform: 'none',
                fontSize: '1.3rem',
                px: 3,
                py: 1,
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleRestoreUser}
              variant="contained"
              color="primary"
              disabled={restoring}
              sx={{
                textTransform: 'none',
                fontSize: '1.3rem',
                px: 3,
                py: 1,
                bgcolor: '#2563eb',
                '&:hover': {
                  bgcolor: '#1d4ed8',
                },
              }}
            >
              {restoring ? 'Đang khôi phục...' : 'Khôi phục và cập nhật'}
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}

