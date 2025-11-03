import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Switch, FormControlLabel } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { userService } from '../../../service/userService';
import { notify } from '../../../components/admin/common/Toast';
import type { UserResponse } from '../../../types/user.types';
import { handleApiError } from '../../../utils/handleApiError';
import { ImageUpload } from '../../../components/admin/common/ImageUpload';

export const UserEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [backgroundUrl, setBackgroundUrl] = useState<string>('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    numberPhone: '',
    address: '',
    username: '',
    isActive: true,
  });
  const [errors, setErrors] = useState({
    numberPhone: '',
  });

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const data = await userService.getById(id);
      setUser(data);
      setAvatarUrl(data.avatarUrl || '');
      setBackgroundUrl(data.backgroundUrl || '');
      setFormData({
        fullName: data.fullName || '',
        email: data.email || '',
        numberPhone: data.numberPhone || '',
        address: data.address || '',
        username: data.username || '',
        isActive: data.isActive ?? true,
      });
    } catch (error: any) {
      notify.error(error?.message || 'Không thể tải thông tin người dùng');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Validate phone number
    if (name === 'numberPhone') {
      if (value && !/^\d{0,10}$/.test(value)) {
        return; // Don't allow non-numeric or more than 10 digits
      }
      if (value && value.length > 0 && value.length < 10) {
        setErrors(prev => ({ ...prev, numberPhone: 'Số điện thoại phải đủ 10 chữ số' }));
      } else {
        setErrors(prev => ({ ...prev, numberPhone: '' }));
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleActive = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      isActive: e.target.checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;

    // Validate phone number before submit
    if (formData.numberPhone && formData.numberPhone.length !== 10) {
      notify.error('Số điện thoại phải đúng 10 chữ số');
      return;
    }

    setLoading(true);
    try {
      await userService.update(id, {
        ...formData,
        avatarUrl: avatarUrl || undefined,
        backgroundUrl: backgroundUrl || undefined,
      });
      notify.success('Cập nhật thông tin thành công!');
      // Navigate back to staff management page
      setTimeout(() => {
        navigate('/admin/users/staff');
      }, 500);
    } catch (error: any) {
      handleApiError(error, 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading && !user) {
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
        <CardHeaderAdmin title="Chỉnh sửa thông tin người dùng" />

        <div className="px-[2.4rem] pb-[2.4rem]">
          {/* User Info Header */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-[1.3rem]">
              <div>
                <span className="text-gray-600">Mã người dùng:</span>
                <span className="ml-2 font-medium">{user?.userId}</span>
              </div>
              <div>
                <span className="text-gray-600">Vai trò:</span>
                <span className="ml-2">
                  {user?.roleName?.map((role) => (
                    <span key={role} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-[1.1rem] ml-2">
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
                    formData.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {formData.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-[1.3rem] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập họ và tên"
                />
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
                  required
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-[1.3rem] bg-gray-100 cursor-not-allowed"
                  placeholder="Tên đăng nhập"
                />
                <p className="text-[1.1rem] text-gray-500 mt-1">Không thể thay đổi tên đăng nhập</p>
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
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-[1.3rem] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập email"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="numberPhone"
                  value={formData.numberPhone}
                  onChange={handleChange}
                  maxLength={10}
                  className={`w-full px-4 py-2 border rounded-lg text-[1.3rem] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.numberPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập số điện thoại (10 chữ số)"
                />
                {errors.numberPhone ? (
                  <p className="text-[1.1rem] text-red-500 mt-1">{errors.numberPhone}</p>
                ) : (
                  <p className="text-[1.1rem] text-gray-500 mt-1">Phải là 10 chữ số (hoặc để trống)</p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-[1.3rem] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập địa chỉ"
                />
              </div>
            </div>

            {/* Avatar Upload */}
            <div className="mt-6">
              <ImageUpload
                value={avatarUrl}
                onChange={(url) => setAvatarUrl(url)}
                label="Ảnh đại diện"
              />
            </div>

            {/* Background Image Upload */}
            <div className="mt-6">
              <ImageUpload
                value={backgroundUrl}
                onChange={(url) => setBackgroundUrl(url)}
                label="Ảnh nền"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status Toggle */}
              <div className="md:col-span-2">
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
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
                      <span className={formData.isActive ? 'text-green-600' : 'text-gray-500'}>
                        {formData.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </span>
                  }
                />
                <p className="text-[1.1rem] text-gray-500 mt-1 ml-14">
                  Bật để cho phép người dùng đăng nhập, tắt để vô hiệu hóa tài khoản
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 text-[1.3rem] font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-[1.3rem] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

