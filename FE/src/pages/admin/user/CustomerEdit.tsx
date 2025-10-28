import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@mui/material';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { notify } from '../../../components/admin/common/Toast';
import { userService } from '../../../service/userService';
import type { UserResponse } from '../../../types/user.types';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { handleApiError } from '../../../utils/handleApiError';

export default function CustomerEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<UserResponse | null>(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (id) {
      fetchUserDetail();
    }
  }, [id]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const response = await userService.getById(id!);
      setData(response);
      setIsActive(response.isActive ?? true);
    } catch (error: any) {
      notify.error(error.response?.data?.message || 'Không thể tải thông tin khách hàng');
      navigate('/admin/users/customers');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsActive(event.target.checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) {
      notify.error('Không tìm thấy ID khách hàng');
      return;
    }

    try {
      setSubmitting(true);

      // Only update isActive status (but include email as backend requires it)
      const updateData = {
        email: user.email,  // Required by backend validation
        isActive: isActive
      };

      const success = await userService.update(id, updateData);

      if (success) {
        notify.success('Cập nhật trạng thái khách hàng thành công!');
        // Navigate and reload after a short delay
        setTimeout(() => {
          window.location.href = '/admin/users/customers';
        }, 500);
      }
    } catch (error: any) {
      handleApiError(error, 'Có lỗi xảy ra khi cập nhật khách hàng');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/users/customers');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const user = data;

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
            Chỉnh sửa trạng thái khách hàng
          </h2>
        </div>

        <div className="px-[2.4rem] pb-[2.4rem]">
          {/* User Info Header */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-[1.6rem] font-semibold text-gray-800 mb-4">
              Thông tin khách hàng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[1.3rem]">
              <div>
                <span className="text-gray-600">Mã người dùng:</span>
                <span className="ml-2 font-medium text-gray-900">{user.userId}</span>
              </div>
              <div>
                <span className="text-gray-600">Tên đăng nhập:</span>
                <span className="ml-2 font-medium text-gray-900">{user.username}</span>
              </div>
              <div>
                <span className="text-gray-600">Vai trò:</span>
                <span className="ml-2">
                  {user.roleName?.map((role, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded text-[1.1rem] mr-1"
                    >
                      {role}
                    </span>
                  ))}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Nhà cung cấp:</span>
                <span className="ml-2">
                  <span className={`inline-block px-2 py-1 rounded text-[1.1rem] ${
                    user?.provider === 'GOOGLE' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user?.provider || 'LOCAL'}
                  </span>
                </span>
              </div>
              <div>
                <span className="text-gray-600">Trạng thái:</span>
                <span className="ml-2">
                  <span className={`inline-block px-2 py-1 rounded text-[1.1rem] ${
                    isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name - READ ONLY */}
              <div>
                <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={user.fullName || ''}
                  disabled
                  className="w-full px-4 py-3 text-[1.3rem] border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Email - READ ONLY */}
              <div>
                <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full px-4 py-3 text-[1.3rem] border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Phone - READ ONLY */}
              <div>
                <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={user.numberPhone || ''}
                  disabled
                  className="w-full px-4 py-3 text-[1.3rem] border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Address - READ ONLY */}
              <div>
                <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={user.address || ''}
                  disabled
                  className="w-full px-4 py-3 text-[1.3rem] border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Status Toggle - EDITABLE */}
              <div className="md:col-span-2">
                <FormControlLabel
                  control={
                    <Switch
                      checked={isActive}
                      onChange={handleToggleActive}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#10b981',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#10b981',
                        },
                      }}
                    />
                  }
                  label={
                    <span className="text-[1.3rem] font-medium text-gray-700">
                      Trạng thái tài khoản: {' '}
                      <span className={isActive ? 'text-green-600' : 'text-gray-500'}>
                        {isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </span>
                  }
                />
                <p className="text-[1.1rem] text-gray-500 mt-1 ml-14">
                  Bật để cho phép khách hàng đăng nhập, tắt để vô hiệu hóa tài khoản
                </p>
              </div>
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
                {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
