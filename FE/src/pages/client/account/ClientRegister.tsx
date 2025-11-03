import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useForm } from 'react-hook-form';
import type { RegisterUserRequest } from '../../../types/admin/auth';
import { GoogleLoginButton } from '../../../components/client/GoogleLoginButton';
import { ClientHeader } from '../../../components/client';

const ClientRegister = () => {
  const { registerUser, isLoading } = useAuth({ type: 'client' });

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterUserRequest>();

  const onSubmit = async (data: RegisterUserRequest) => {
    await registerUser(data);
    // Auto-login logic handled in useAuth (type: 'client')
  };

  return (
    <>
      <ClientHeader />
      <section className='py-[130px] bg-login'>
        <div className='w-[1410px] mx-auto'>
          <h2 className='text-white mb-[20px] text-[4rem] font-[700] text-center'>Tạo tài khoản</h2>
          <div className='text-white text-center'><Link to={"/"}>Trang chủ</Link><span className='mx-[5px]'>-</span> <span className='text-[#94d433]'>Tạo tài khoản</span></div>
        </div>
      </section>
      <section className='py-[130px]'>
        <div className='w-[1410px] mx-auto p-[65px] bg-[#94d433] rounded-[10px] mt-[24px] flex'>
          <div className='w-[67%] px-[12px] relative'>
            <img src="https://sf-static.upanhlaylink.com/img/image_202511017c2279b759f2fd71edb9c4812ff3db9f.jpg" alt="" className='w-full h-auto object-cover rounded-[10px]' />
            <div className='absolute top-[50%] right-[-50px] translate-y-[-50%] rotate-[-90deg]'>
              <Link to="/client/login" className='bg-transparent hover:bg-[#94d433] border border-[#fff] hover:border-[#94d433] text-white px-[20px] py-[10px] transition-colors duration-[400ms] ease-in-out'>Đăng nhập</Link>
              <Link to="/client/register" className='bg-[#94d433] border border-[#94d433] text-white px-[20px] py-[10px]'>Đăng ký</Link>
            </div>
          </div>
          <div className='flex-1 px-[12px]'>
            <div className='text-white text-[4rem] mb-[65px] font-[700]'>Tạo tài khoản</div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className='mb-[30px]'>
                <input
                  type="text"
                  placeholder='Họ và tên'
                  className='border-b border-[#d9d9d9] text-white placeholder:text-white outline-none py-[15px] pr-[20px] w-full bg-transparent'
                  {...register('fullName', {
                    required: 'Vui lòng nhập họ và tên',
                    minLength: { value: 2, message: 'Họ và tên phải có ít nhất 2 ký tự' }
                  })}
                />
                {errors.fullName && (
                  <p className='text-red-300 text-[1.2rem] mt-[5px]'>{errors.fullName.message}</p>
                )}
              </div>
              <div className='mb-[30px]'>
                <input
                  type="email"
                  placeholder='Email'
                  className='border-b border-[#d9d9d9] text-white placeholder:text-white outline-none py-[15px] pr-[20px] w-full bg-transparent'
                  {...register('email', {
                    required: 'Vui lòng nhập email',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Email không hợp lệ'
                    }
                  })}
                />
                {errors.email && (
                  <p className='text-red-300 text-[1.2rem] mt-[5px]'>{errors.email.message}</p>
                )}
              </div>
              <div className='mb-[30px]'>
                <input
                  type="text"
                  placeholder='Số điện thoại'
                  className='border-b border-[#d9d9d9] text-white placeholder:text-white outline-none py-[15px] pr-[20px] w-full bg-transparent'
                  {...register('numberPhone', {
                    required: 'Vui lòng nhập số điện thoại',
                    pattern: {
                      value: /^[0-9]+$/,
                      message: 'Số điện thoại chỉ được chứa số'
                    },
                    minLength: { value: 10, message: 'Số điện thoại phải có ít nhất 10 số' }
                  })}
                />
                {errors.numberPhone && (
                  <p className='text-red-300 text-[1.2rem] mt-[5px]'>{errors.numberPhone.message}</p>
                )}
              </div>
              <div className='mb-[30px]'>
                <input
                  type="text"
                  placeholder='Tên người dùng'
                  className='border-b border-[#d9d9d9] text-white placeholder:text-white outline-none py-[15px] pr-[20px] w-full bg-transparent'
                  {...register('username', {
                    required: 'Vui lòng nhập tên người dùng',
                    minLength: { value: 3, message: 'Tên người dùng phải có ít nhất 3 ký tự' }
                  })}
                />
                {errors.username && (
                  <p className='text-red-300 text-[1.2rem] mt-[5px]'>{errors.username.message}</p>
                )}
              </div>
              <div className='mb-[30px]'>
                <input
                  type="password"
                  placeholder='Mật khẩu'
                  className='border-b border-[#d9d9d9] text-white placeholder:text-white outline-none py-[15px] pr-[20px] w-full bg-transparent'
                  {...register('password', {
                    required: 'Vui lòng nhập mật khẩu',
                    minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                  })}
                />
                {errors.password && (
                  <p className='text-red-300 text-[1.2rem] mt-[5px]'>{errors.password.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className='mb-[30px] border-2 border-white w-full px-[26px] py-[12px] cursor-pointer font-[600] text-white transition-colors duration-[400ms] ease-in-out hover:bg-white hover:text-[#94d433] disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
              </button>
            </form>
            <div className='flex items-center mb-[30px]'>
              <span className='w-[20px] h-[20px] border border-[#94d433] rounded-full bg-white cursor-pointer relative after:absolute after:top-[6px] after:left-[6px] after:bg-[#94d433] after:content-[""] after:w-[6px] after:h-[6px] after:rounded-full'></span>
              <span className='ml-[10px] mt-[4px] text-white text-[1.4rem]'>Đồng ý các điều khoản & điều kiện của bạn</span>
            </div>
            <div className='text-white text-center font-[500] mb-[30px]'>Hoặc</div>
            <GoogleLoginButton
              text="Đăng nhập bằng Google"
              fullWidth={true}
            />
          </div>
        </div>
      </section>
      <div className='bg-[url("https://charger-next.vercel.app/_next/static/media/our-info.730cd5ce.jpg")] bg-no-repeat bg-cover py-[65px] bg-center relative'>
        <div className='absolute inset-0 bg-black opacity-50 z-0'></div>
        <div className='relative z-10 w-[1410px] mx-auto flex items-center justify-center'>
          <img src="https://i.imgur.com/XAy1f1e.jpeg" alt="EVCare" className='w-[80px] h-[80px] object-cover' />
        </div>
      </div>
    </>
  )
}

export default ClientRegister