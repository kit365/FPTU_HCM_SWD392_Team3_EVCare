import { Link } from 'react-router-dom';
import { Divider } from 'antd';
import { useAuth } from '../../../hooks/useAuth';
import { useForm } from 'react-hook-form';
import type { RegisterUserRequest } from '../../../types/admin/auth';
import { GoogleLoginButton } from '../../../components/client/GoogleLoginButton';
const ClientRegister = () => {
  const { registerUser, isLoading } = useAuth({ type: 'client' });
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterUserRequest>();
  const onSubmit = async (values: RegisterUserRequest) => {
    await registerUser(values);
    // Auto-login logic handled in useAuth (type: 'client')
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Content */}
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-12">
          <h2 className="text-center text-2xl font-bold mb-6">
            ĐĂNG KÝ TÀI KHOẢN
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="ant-form-item">
              <label className="ant-form-item-label block mb-1 font-medium">Email</label>
              <input
                type="email"
                className={`ant-input w-full px-3 py-2 rounded border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                placeholder="Nhập email của bạn"
                {...register('email', {
                  required: 'Vui lòng nhập email',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Email không hợp lệ'
                  }
                })}
              />
              {errors.email && <div className="ant-form-item-explain ant-form-item-explain-error text-red-500 text-sm mt-1">{errors.email.message}</div>}
            </div>

            {/* Full Name */}
            <div className="ant-form-item">
              <label className="ant-form-item-label block mb-1 font-medium">Họ và tên</label>
              <input
                type="text"
                className={`ant-input w-full px-3 py-2 rounded border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                placeholder="Nhập họ và tên của bạn"
                {...register('fullName', {
                  required: 'Vui lòng nhập họ và tên',
                  minLength: { value: 2, message: 'Họ và tên phải có ít nhất 2 ký tự' }
                })}
              />
              {errors.fullName && <div className="ant-form-item-explain ant-form-item-explain-error text-red-500 text-sm mt-1">{errors.fullName.message}</div>}
            </div>

            {/* Password */}
            <div className="ant-form-item">
              <label className="ant-form-item-label block mb-1 font-medium">Mật khẩu</label>
              <input
                type="password"
                className={`ant-input w-full px-3 py-2 rounded border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                placeholder="Nhập mật khẩu"
                {...register('password', {
                  required: 'Vui lòng nhập mật khẩu!',
                  minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                })}
              />
              {errors.password && <div className="ant-form-item-explain ant-form-item-explain-error text-red-500 text-sm mt-1">{errors.password.message}</div>}
            </div>
            {/* Username */}
            <div className="ant-form-item">
              <label className="ant-form-item-label block mb-1 font-medium">Tên người dùng</label>
              <input
                type="text"
                className={`ant-input w-full px-3 py-2 rounded border ${errors.username ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                placeholder="Nhập tên người dùng"
                {...register('username', {
                  required: 'Vui lòng nhập tên người dùng',
                  minLength: { value: 3, message: 'Tên người dùng phải có ít nhất 3 ký tự!' }
                })}
              />
              {errors.username && <div className="ant-form-item-explain ant-form-item-explain-error text-red-500 text-sm mt-1">{errors.username.message}</div>}
            </div>
            {/* Phone */}
            <div className="ant-form-item">
              <label className="ant-form-item-label block mb-1 font-medium">Số điện thoại</label>
              <input
                type="text"
                className={`ant-input w-full px-3 py-2 rounded border ${errors.numberPhone ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                placeholder="Nhập số điện thoại"
                {...register('numberPhone', {
                  required: 'Vui lòng nhập số điện thoại!',
                  pattern: { value: /^[0-9]+$/, message: 'Số điện thoại chỉ được chứa số!' },
                  minLength: { value: 10, message: 'Số điện thoại phải có ít nhất 10 số!' }
                })}
              />
              {errors.numberPhone && <div className="ant-form-item-explain ant-form-item-explain-error text-red-500 text-sm mt-1">{errors.numberPhone.message}</div>}
            </div>
            {/* Submit Button */}
            <div className="ant-form-item">
              <button type="submit" className="ant-btn ant-btn-primary w-full text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-base font-medium" style={{height: 40, fontSize: 16}} disabled={isLoading}>
                {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
              </button>
            </div>
          </form>

          <Divider className="my-6">Hoặc</Divider>

          <GoogleLoginButton 
            text="Đăng ký bằng Google" 
            fullWidth={true}
          />

          <div className="text-center mt-6">
            Đã có tài khoản? <Link to="/client/login" className="text-blue-600 hover:text-blue-800">Đăng nhập tại đây</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientRegister