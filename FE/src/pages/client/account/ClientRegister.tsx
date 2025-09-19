import React from 'react';
import { Button, Form, Input, notification } from 'antd';
import type { FormProps } from 'rc-field-form';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
const ClientRegister = () => {
  const navigate = useNavigate();
  const onFinish: FormProps['onFinish'] = (values) => {

    if (values.email! && values.password! && values.phone) {
      console.log('gia tri form register: ', values)
      notification.success({
        message: "Register thành công",
        description: "JSON.stringify(res.message) o day"
      })
      navigate("/client/login");
    } else {
      notification.error({
        message: "Register thất bại",
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
            ĐĂNG KÝ TÀI KHOẢN
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
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số điện thoại!"
                },
                {
                  pattern: /^[0-9]+$/,
                  message: "Số điện thoại chỉ được chứa số!"
                },
                {
                  min: 10,
                  message: "Số điện thoại phải có ít nhất 10 số!"
                }
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full" size="large">
                Đăng ký
              </Button>
            </Form.Item>
          </Form>
          
          <div className="text-center mt-4">
            Đã có tài khoản? <Link to="/client/login" className="text-blue-600 hover:text-blue-800">Đăng nhập tại đây</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientRegister