import React from "react";
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Select,
  TreeSelect,
} from "antd";
import type { FormProps } from "antd";
import { Dayjs, isDayjs } from "dayjs";
import vinImage from "../../../assets/vin.jpg";

const { TextArea } = Input;
const { SHOW_PARENT } = TreeSelect;

export const ServiceBookingPage: React.FC = () => {
  const [form] = Form.useForm();

  const vehicleOptions = [
    { value: "xe_tang", label: "Xe tăng" },
    { value: "xe_dap", label: "Xe đạp" },
    { value: "xe_may", label: "Xe máy" },
    { value: "oto", label: "Ô tô" },
  ];

  const districtOptions = [
    { value: "quan1", label: "Quận 1" },
    { value: "quan2", label: "Quận 2" },
    { value: "quan3", label: "Quận 3" },
  ];

  const serviceTreeData = [
    {
      title: 'Bảo dưỡng',
      value: 'maintenance',
      key: 'maintenance',
      children: [
        { title: 'Thay dầu', value: 'maintenance-oil', key: 'maintenance-oil' },
        { title: 'Kiểm tra định kỳ', value: 'maintenance-routine', key: 'maintenance-routine' },
      ],
    },
    {
      title: 'Sửa chữa',
      value: 'repair',
      key: 'repair',
      children: [
        { title: 'Thay phụ tùng', value: 'repair-parts', key: 'repair-parts' },
        { title: 'Đồng sơn', value: 'repair-paint', key: 'repair-paint' },
      ],
    },
  ];

  const onFinish: FormProps["onFinish"] = (values) => {
    console.log("gia cua object value", values)
    const dateValue = values["dateTime"];
    const formattedDate = isDayjs(dateValue)
      ? (dateValue as Dayjs).format("YYYY-MM-DD HH:mm:ss")
      : undefined;

    console.log("Form Submitted: ", { ...values, dateTime: formattedDate });
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: `url(${vinImage})`,
          filter: 'blur(2px)'
        }}
      />

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-6xl w-full bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-center text-2xl font-bold mb-6">
            ĐẶT LỊCH DỊCH VỤ
          </h2>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="space-y-8"
          >
            {/* Grid 2 cột */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Thông tin khách hàng */}
              <div>
                <h3 className="font-semibold mb-4">1. Thông tin khách hàng</h3>
                <Form.Item
                  label="Họ tên"
                  name="customerName"
                  rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                >
                  <Input placeholder="Nhập họ và tên" />
                </Form.Item>
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại" },
                    { pattern: new RegExp(/\d+/g), message: "Cần nhập số!" },
                    { min: 10, message: "Số điện thoại phải tối thiểu 10 số" },
                  ]}
                >
                  <Input placeholder="Tối thiểu 10 chữ số" />
                </Form.Item>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                >
                  <Input placeholder="vidu@gmail.com" />
                </Form.Item>
              </div>

              {/* Thông tin xe */}
              <div>
                <h3 className="font-semibold mb-4">2. Thông tin xe</h3>
                <Form.Item
                  label="Mẫu xe"
                  name="vehicleType"
                  rules={[{ required: true, message: "Vui lòng chọn mẫu xe" }]}
                >
                  <Select placeholder="Lựa chọn" options={vehicleOptions} />
                </Form.Item>
                <Form.Item label="Số Km" name="mileage">
                  <Input placeholder="Nhập số km trên phương tiện" />
                </Form.Item>
                <Form.Item
                  label="Biển số xe"
                  name="licensePlate"
                  rules={[
                    { required: true, message: "Vui lòng nhập biển số xe" },
                    { min: 7, message: 'Biển số xe phải có ít nhất 7 ký tự', },
                    { max: 8, message: 'Biển số xe không được vượt quá 8 ký tự', },
                    { pattern: /^[A-Za-z0-9-]+$/, message: 'Biển số xe chỉ được chứa chữ, số và dấu gạch ngang', },
                  ]}
                >
                  <Input placeholder="Nhập biển số xe" />
                </Form.Item>
              </div>
            </div>

            {/* Dịch vụ */}
            <div>
              <h3 className="font-semibold mb-4">3. Dịch vụ</h3>
              <Form.Item
                name="services"
                label="Chọn dịch vụ"
                rules={[
                    { required: true, message: "Vui lòng chọn dịch vụ" },
                    ]}
              >
                <TreeSelect
                  treeData={serviceTreeData}
                  treeCheckable
                  showCheckedStrategy={SHOW_PARENT}
                  placeholder="Vui lòng chọn"
                  style={{ width: '100%' }}
                  allowClear
                />
              </Form.Item>
            </div>

            {/* Địa điểm & Thời gian */}
            <div>
              <h3 className="font-semibold mb-4">4. Địa điểm và Thời gian</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item
                  label="Chọn quận"
                  name="district"
                  rules={[{ required: true, message: "Vui lòng chọn quận" }]}
                >
                  <Select placeholder="Chọn quận" options={districtOptions} />
                </Form.Item>
                <Form.Item
                  label="Chọn huyện"
                  name="ward"
                  rules={[{ required: true, message: "Vui lòng chọn huyện" }]}
                >
                  <Select
                    placeholder="Chọn huyện"
                    options={[
                      { value: "huyen1", label: "Huyện 1" },
                      { value: "huyen2", label: "Huyện 2" },
                    ]}
                  />
                </Form.Item>
              </div>
              <Form.Item
                label="Thời gian hẹn"
                name="dateTime"
                rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  className="w-full"
                  placeholder="Chọn ngày và giờ"
                />
              </Form.Item>
            </div>

            {/* Ghi chú */}
            <div>
              <h3 className="font-semibold mb-4">5. Ghi chú</h3>
              <Form.Item name="notes">
                <TextArea rows={4} placeholder="Nhập ghi chú (nếu có)" />
              </Form.Item>
            </div>

            {/* Nút Submit */}
            <div className="text-center">
              <Button type="primary" htmlType="submit" size="large">
                Đặt lịch hẹn
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};
