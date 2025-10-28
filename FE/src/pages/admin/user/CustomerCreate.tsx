import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@mui/material';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { notify } from '../../../components/admin/common/Toast';
import { userService } from '../../../service/userService';
import { handleApiError } from '../../../utils/handleApiError';

export default function CustomerCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    numberPhone: '',
    address: '',
  });

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    numberPhone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const validateForm = (): boolean => {
    const newErrors = {
      username: '',
      email: '',
      password: '',
      numberPhone: '',
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

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      notify.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    try {
      setSubmitting(true);

      // Call API to create customer (no roleIds - backend will auto assign CUSTOMER role)
      const success = await userService.create({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName || undefined,
        numberPhone: formData.numberPhone || undefined,
        address: formData.address || undefined,
      });

      if (success) {
        notify.success('Thêm khách hàng thành công!');
        // Navigate and reload after a short delay
        setTimeout(() => {
          window.location.href = '/admin/users/customers';
        }, 500);
      }
    } catch (error: any) {
      handleApiError(error, 'Có lỗi xảy ra khi thêm khách hàng');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/users/customers');
  };

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
            Thêm khách hàng mới
          </h2>
        </div>

        <div className="px-[2.4rem] pb-[2.4rem]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full px-4 py-3 text-[1.3rem] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập địa chỉ"
                />
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
                {submitting ? 'Đang tạo...' : 'Tạo khách hàng'}
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

