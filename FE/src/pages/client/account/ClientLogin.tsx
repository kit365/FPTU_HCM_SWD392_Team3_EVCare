import { Modal } from 'antd';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useForgotPassword } from '../../../hooks/useForgotPassword';
import { useState } from 'react';
import type { RequestOtpRequest, VerifyOtpRequest } from '../../../types/admin/forgot-password';
import { useRoleBasedAuth } from '../../../hooks/useRoleBasedAuth';
import type { LoginRequest } from '../../../types/admin/auth';
import { GoogleLoginButton } from '../../../components/client/GoogleLoginButton';
import { ClientHeader } from '../../../components/client';

const ClientLogin = () => {
    const { login, isLoading } = useRoleBasedAuth({
        allowedRoles: ['CUSTOMER', 'CLIENT'],
        redirectPath: '/client',
        errorMessage: 'Tài khoản quản trị không thể đăng nhập vào trang khách hàng. Vui lòng đăng nhập qua trang quản trị.'
    });

    // Form cho đăng nhập
    const {
        register: registerLogin,
        handleSubmit: handleSubmitLogin,
        formState: { errors: loginErrors }
    } = useForm<LoginRequest>();

    const onLoginSubmit = async (data: LoginRequest) => {
        await login(data);
    };

    // Form cho quên mật khẩu
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'reset'>('email');
    const [emailForOtp, setEmailForOtp] = useState('');
    const [otpForReset, setOtpForReset] = useState('');
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setError
    } = useForm<{ email: string; otp: string; newPassword: string; confirmPassword: string }>();
    const { requestOTP, isLoading: isForgotLoading, verifyOTP, resetPassword } = useForgotPassword();

    const handleForgotPassword = async (data: RequestOtpRequest) => {
        const res = await requestOTP(data);
        if (res.success) {
            setEmailForOtp(data.email);
            setForgotStep('otp');
        }
    };

    const handleVerifyOtp = async (data: VerifyOtpRequest) => {
        const response = await verifyOTP(data);
        if (response.data.isValid === true) {
            setOtpForReset(data.otp);
            setForgotStep('reset');
        }
    }

    const handleResetPassword = async (data: { newPassword: string; confirmPassword: string }) => {
        if (data.newPassword !== data.confirmPassword) {
            setError('confirmPassword', { message: 'Mật khẩu xác nhận không khớp' });
            return;
        }

        try {
            const res = await resetPassword({
                email: emailForOtp,
                otp: otpForReset,
                newPassword: data.newPassword
            });
            if (res.success) {
                setIsForgotModalOpen(false);
                setForgotStep('email');
                reset();
            }
        } catch {
            // notify đã được hook xử lý
        }
    };

    const handleCloseForgotModal = () => {
        setIsForgotModalOpen(false);
        setForgotStep('email');
        setEmailForOtp('');
        setOtpForReset('');
        reset();
    };

    return (
        <>
            <ClientHeader />
            <section className='py-[130px] bg-login'>
                <div className='w-[1410px] mx-auto'>
                    <h2 className='text-white mb-[20px] text-[4rem] font-[700] text-center'>Đăng Nhập</h2>
                    <div className='text-white text-center'><Link to={"/"}>Trang chủ</Link><span className='mx-[5px]'>-</span> <span className='text-[#41cb5a]'>Đăng nhập</span></div>
                </div>
            </section>
            <section className='py-[130px]'>
                <div className='w-[1410px] mx-auto p-[65px] bg-[#41cb5a] rounded-[10px] mt-[24px] flex'>
                    <div className='w-[67%] px-[12px] relative'>
                        <img src="https://sf-static.upanhlaylink.com/img/image_202510319912dc6709537d30c6ef1376776aa83c.jpg" alt="" className='w-full h-auto object-cover rounded-[10px]' />
                        <div className='absolute top-[50%] right-[-50px] translate-y-[-50%] rotate-[-90deg]'>
                            <Link to="/client/login" className='bg-[#41cb5a] border border-[#41cb5a] text-white px-[20px] py-[10px]'>Đăng nhập</Link>
                            <Link to="/client/register" className='bg-transparent hover:bg-[#41cb5a] border border-[#fff] hover:border-[#41cb5a] text-white px-[20px] py-[10px] transition-colors duration-[400ms] ease-in-out'>Đăng ký</Link>
                        </div>
                    </div>
                    <div className='flex-1 px-[12px]'>
                        <div className='text-white text-[4rem] mb-[65px] font-[700]'>Chào mừng trở lại</div>
                        <form onSubmit={handleSubmitLogin(onLoginSubmit)}>
                            <div className='mb-[30px]'>
                                <input
                                    type="email"
                                    placeholder='Email'
                                    className='border-b border-[#d9d9d9] text-white placeholder:text-white outline-none py-[15px] pr-[20px] w-full bg-transparent'
                                    {...registerLogin('email', {
                                        required: 'Vui lòng nhập email',
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: 'Email không hợp lệ'
                                        }
                                    })}
                                />
                                {loginErrors.email && (
                                    <p className='text-red-300 text-[1.2rem] mt-[5px]'>{loginErrors.email.message}</p>
                                )}
                            </div>
                            <div className='mb-[30px]'>
                                <input
                                    type="password"
                                    placeholder='Nhập mật khẩu'
                                    className='border-b border-[#d9d9d9] text-white placeholder:text-white outline-none py-[15px] pr-[20px] w-full bg-transparent'
                                    {...registerLogin('password', {
                                        required: 'Vui lòng nhập mật khẩu'
                                    })}
                                />
                                {loginErrors.password && (
                                    <p className='text-red-300 text-[1.2rem] mt-[5px]'>{loginErrors.password.message}</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className='mb-[30px] border-2 border-white w-full px-[26px] py-[12px] cursor-pointer font-[600] text-white transition-colors duration-[400ms] ease-in-out hover:bg-white hover:text-[#41cb5a] disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </button>
                        </form>
                        <div className='mb-[20px] text-right'>
                            <button
                                type="button"
                                onClick={() => setIsForgotModalOpen(true)}
                                className='text-white text-[1.4rem] hover:text-[#f0f0f0] underline'
                            >
                                Quên mật khẩu?
                            </button>
                        </div>
                        <div className='flex items-center mb-[30px]'>
                            <span className='w-[20px] h-[20px] border border-[#41cb5a] rounded-full bg-white cursor-pointer relative after:absolute after:top-[6px] after:left-[6px] after:bg-[#41cb5a] after:content-[""] after:w-[6px] after:h-[6px] after:rounded-full'></span>
                            <span className='ml-[10px] mt-[4px] text-white text-[1.4rem]'>Đồng ý các điều khoản & điều kiện của bạn</span>
                        </div>
                        <div className='text-white text-center font-[500] mb-[30px]'>Hoặc</div>
                        <GoogleLoginButton />
                    </div>
                </div>
            </section>
            <div className='bg-[url("https://charger-next.vercel.app/_next/static/media/our-info.730cd5ce.jpg")] bg-no-repeat bg-cover py-[65px] bg-center relative'>
                <div className='absolute inset-0 bg-black opacity-50 z-0'></div>
                <div className='relative z-10 w-[1410px] mx-auto flex items-center justify-center'>
                    <img src="https://i.imgur.com/XAy1f1e.jpeg" alt="EVCare" className='w-[80px] h-[80px] object-cover' />
                </div>
            </div>
            {/* Modal Quên mật khẩu */}
            <Modal
                title={
                    <div className='text-[2.4rem] font-[700] text-[#333]' >
                        Quên mật khẩu
                        <div className='flex items-center gap-[8px] mt-[10px]' >
                            <div className='w-[40px] h-[4px] rounded-full bg-[#41cb5a] transition-colors duration-[300ms]'></div>
                            <div className={`w-[40px] h-[4px] rounded-full transition-colors duration-[300ms] ${forgotStep !== 'email' ? 'bg-[#41cb5a]' : 'bg-[#e0e0e0]'}`}></div>
                            <div className={`w-[40px] h-[4px] rounded-full transition-colors duration-[300ms] ${forgotStep === 'reset' ? 'bg-[#41cb5a]' : 'bg-[#e0e0e0]'}`}></div>
                        </div>
                    </div>
                }
                open={isForgotModalOpen}
                onCancel={handleCloseForgotModal}
                footer={null}
                className="forgot-password-modal"
                width={600}
                styles={{
                    content: {
                        padding: '40px',
                        borderRadius: '10px'
                    }
                }}
            >
                {forgotStep === 'email' && (
                    <form onSubmit={handleSubmit(handleForgotPassword)}>
                        <div className='mb-[30px]'>
                            <label className="block mb-[15px] text-[1.6rem] font-[600] text-[#333]">Email</label>
                            <input
                                type="email"
                                className="w-full border-b border-[#d9d9d9] outline-none py-[15px] pr-[20px] bg-transparent focus:border-[#41cb5a] transition-colors duration-[300ms] text-[1.4rem]"
                                placeholder="Nhập email của bạn"
                                {...register('email', {
                                    required: 'Vui lòng nhập email',
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: 'Email không hợp lệ'
                                    }
                                })}
                            />
                            {errors.email && <p className="text-red-500 text-[1.2rem] mt-[8px]">{errors.email.message}</p>}
                        </div>
                        <div className="flex justify-end gap-[12px] mt-[40px]">
                            <button
                                type="button"
                                className="px-[24px] py-[12px] border-2 border-[#d9d9d9] text-[#333] rounded-[6px] font-[600] text-[1.4rem] hover:bg-[#f5f5f5] transition-colors duration-[300ms]"
                                onClick={handleCloseForgotModal}
                            >
                                Đóng
                            </button>
                            <button
                                type="submit"
                                className="px-[24px] py-[12px] bg-[#41cb5a] text-white rounded-[6px] font-[600] text-[1.4rem] hover:bg-[#38b850] transition-colors duration-[300ms] disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isForgotLoading}
                            >
                                {isForgotLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
                            </button>
                        </div>
                    </form>
                )}
                {
                    forgotStep === 'otp' && (
                        <form onSubmit={handleSubmit(handleVerifyOtp)}>
                            <div className='mb-[30px]'>
                                <label className="block mb-[15px] text-[1.6rem] font-[600] text-[#333]">Nhập mã OTP</label>
                                <p className='text-[1.3rem] text-[#666] mb-[15px]'>Mã OTP đã được gửi tới email: <span className='font-[600] text-[#41cb5a]'>{emailForOtp}</span></p>
                                <input
                                    type="text"
                                    className="w-full border-b border-[#d9d9d9] outline-none py-[15px] pr-[20px] bg-transparent focus:border-[#41cb5a] transition-colors duration-[300ms] text-[1.4rem]"
                                    placeholder="Nhập mã OTP"
                                    {...register('otp', { required: 'Vui lòng nhập mã OTP' })}
                                />
                                {errors.otp && <p className="text-red-500 text-[1.2rem] mt-[8px]">{errors.otp.message}</p>}
                            </div>
                            <div className="flex justify-between gap-[12px] mt-[40px]">
                                <button
                                    type="button"
                                    className="px-[24px] py-[12px] border-2 border-[#d9d9d9] text-[#333] rounded-[6px] font-[600] text-[1.4rem] hover:bg-[#f5f5f5] transition-colors duration-[300ms]"
                                    onClick={() => { setForgotStep('email'); reset(); }}
                                >
                                    Quay lại
                                </button>
                                <button
                                    type="submit"
                                    className="px-[24px] py-[12px] bg-[#41cb5a] text-white rounded-[6px] font-[600] text-[1.4rem] hover:bg-[#38b850] transition-colors duration-[300ms]"
                                >
                                    Xác nhận OTP
                                </button>
                            </div>
                        </form>
                    )
                }
                {
                    forgotStep === 'reset' && (
                        <form onSubmit={handleSubmit(handleResetPassword)}>
                            <div className='mb-[30px]'>
                                <label className="block mb-[15px] text-[1.6rem] font-[600] text-[#333]">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    className="w-full border-b border-[#d9d9d9] outline-none py-[15px] pr-[20px] bg-transparent focus:border-[#41cb5a] transition-colors duration-[300ms] text-[1.4rem]"
                                    placeholder="Nhập mật khẩu mới"
                                    {...register('newPassword', {
                                        required: 'Vui lòng nhập mật khẩu mới',
                                        minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                                    })}
                                />
                                {errors.newPassword && <p className="text-red-500 text-[1.2rem] mt-[8px]">{errors.newPassword.message}</p>}
                            </div>
                            <div className='mb-[30px]'>
                                <label className="block mb-[15px] text-[1.6rem] font-[600] text-[#333]">Xác nhận mật khẩu</label>
                                <input
                                    type="password"
                                    className="w-full border-b border-[#d9d9d9] outline-none py-[15px] pr-[20px] bg-transparent focus:border-[#41cb5a] transition-colors duration-[300ms] text-[1.4rem]"
                                    placeholder="Nhập lại mật khẩu mới"
                                    {...register('confirmPassword', {
                                        required: 'Vui lòng xác nhận mật khẩu'
                                    })}
                                />
                                {errors.confirmPassword && <p className="text-red-500 text-[1.2rem] mt-[8px]">{errors.confirmPassword.message}</p>}
                            </div>
                            <div className="flex justify-between gap-[12px] mt-[40px]">
                                <button
                                    type="button"
                                    className="px-[24px] py-[12px] border-2 border-[#d9d9d9] text-[#333] rounded-[6px] font-[600] text-[1.4rem] hover:bg-[#f5f5f5] transition-colors duration-[300ms]"
                                    onClick={() => { setForgotStep('otp'); reset(); }}
                                >
                                    Quay lại
                                </button>
                                <button
                                    type="submit"
                                    className="px-[24px] py-[12px] bg-[#41cb5a] text-white rounded-[6px] font-[600] text-[1.4rem] hover:bg-[#38b850] transition-colors duration-[300ms] disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isForgotLoading}
                                >
                                    {isForgotLoading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                                </button>
                            </div>
                        </form>
                    )
                }
            </Modal>
        </>
    )
}

export default ClientLogin