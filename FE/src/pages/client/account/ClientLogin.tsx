import React from 'react';
import { Button, Form, Input, notification } from 'antd';
import type { FormProps } from 'rc-field-form';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

const ClientLogin = () => {
    const navigate = useNavigate();
    const onFinish: FormProps['onFinish'] = (values) => {

        if (values.email! && values.password!) {
            console.log('gia tri form login: ', values)
            notification.success({
                message: "Login thành công",
                description: "JSON.stringify(res.message) o day"
            })
            navigate("/");
        } else {
            notification.error({
                message: "Login thất bại",
                description: "JSON.stringify(res.message) o day"
            })
        };
    };
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Content */}
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
                            <Button type="primary" htmlType="submit" className="w-full" size="large">
                                Đăng nhập
                            </Button>
                        </Form.Item>
                    </Form>
                    
                    <div className="text-center mt-4">
                        Chưa có tài khoản? <Link to="/client/register" className="text-blue-600 hover:text-blue-800">Đăng ký tại đây</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ClientLogin
