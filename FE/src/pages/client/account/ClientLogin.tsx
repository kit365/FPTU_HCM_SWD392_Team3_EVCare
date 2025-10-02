import { Button, Form, Input, Modal } from 'antd';
import type { FormProps } from 'rc-field-form';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useForgotPassword } from '../../../hooks/useForgotPassword';
import { useState } from 'react';
import type { RequestOtpRequest, VerifyOtpRequest } from '../../../type/forgot-password';
import { useAuth } from '../../../hooks/useAuthClient';
import type { LoginRequest } from '../../../type/auth';

const ClientLogin = () => {
    const { login, isLoading } = useAuth();

    const onFinish: FormProps['onFinish'] = async (values) => {
        const payload: LoginRequest = {
            email: values.email,
            password: values.password
        };
        await login(payload);
    };

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
        <div className="min-h-screen bg-gray-100">
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-12">
                    <h2 className="text-center text-2xl font-bold mb-6">
                        ĐĂNG NHẬP
                    </h2>

                    <Form
                        initialValues={{ remember: true }}
                        layout="vertical"
                        onFinish={onFinish}
                        className="space-y-4"
                    >
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: "Vui lòng nhập email" },
                                { type: "email", message: "Email không hợp lệ" },
                            ]}
                        >
                            <Input placeholder="Nhập email của bạn" />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu"
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập mật khẩu!'
                                }
                            ]}
                        >
                            <Input.Password placeholder="Nhập mật khẩu" />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="w-full"
                                size="large"
                                loading={isLoading}
                            >
                                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </Button>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="link"
                                className="w-full text-left"
                                style={{ padding: 0 }}
                                onClick={() => setIsForgotModalOpen(true)}
                            >
                                Quên mật khẩu?
                            </Button>
                        </Form.Item>
                    </Form>

                    <div className="text-center mt-4">
                        Chưa có tài khoản? <Link to="/client/register" className="text-blue-600 hover:text-blue-800">Đăng ký tại đây</Link>
                    </div>
                </div>
            </div>

            <Modal
                title="Quên mật khẩu"
                open={isForgotModalOpen}
                onCancel={handleCloseForgotModal}
                footer={null}
            >
                {forgotStep === 'email' && (
                    <form onSubmit={handleSubmit(handleForgotPassword)} className="space-y-4">
                        <div>
                            <label className="block mb-1 font-medium">Email</label>
                            <input
                                type="email"
                                className="w-full border rounded px-3 py-2"
                                placeholder="Nhập email của bạn"
                                {...register('email', {
                                    required: 'Vui lòng nhập email',
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: 'Email không hợp lệ'
                                    }
                                })}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" className="px-4 py-2" onClick={handleCloseForgotModal}>Đóng</button>
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={isForgotLoading}>
                                {isForgotLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
                            </button>
                        </div>
                    </form>
                )}
                {forgotStep === 'otp' && (
                    <form onSubmit={handleSubmit(handleVerifyOtp)} className="space-y-4">
                        <div>
                            <label className="block mb-1 font-medium">Nhập mã OTP đã gửi tới email</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2"
                                placeholder="Nhập mã OTP"
                                {...register('otp', { required: 'Vui lòng nhập mã OTP' })}
                            />
                            {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>}
                        </div>
                        <div className="flex justify-between gap-2">
                            <button type="button" className="px-4 py-2" onClick={() => { setForgotStep('email'); reset(); }}>Quay lại</button>
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                                Xác nhận OTP
                            </button>
                        </div>
                    </form>
                )}
                {forgotStep === 'reset' && (
                    <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4">
                        <div>
                            <label className="block mb-1 font-medium">Mật khẩu mới</label>
                            <input
                                type="password"
                                className="w-full border rounded px-3 py-2"
                                placeholder="Nhập mật khẩu mới"
                                {...register('newPassword', {
                                    required: 'Vui lòng nhập mật khẩu mới',
                                    minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                                })}
                            />
                            {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>}
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                className="w-full border rounded px-3 py-2"
                                placeholder="Nhập lại mật khẩu mới"
                                {...register('confirmPassword', {
                                    required: 'Vui lòng xác nhận mật khẩu'
                                })}
                            />
                            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                        </div>
                        <div className="flex justify-between gap-2">
                            <button type="button" className="px-4 py-2" onClick={() => { setForgotStep('otp'); reset(); }}>Quay lại</button>
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={isForgotLoading}>
                                {isForgotLoading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    )
}

export default ClientLogin