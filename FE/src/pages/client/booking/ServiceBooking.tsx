import React, { useState, useEffect } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Select,
  TreeSelect,
  message,
} from "antd";
import type { FormProps } from "antd";
import { Dayjs, isDayjs } from "dayjs";
import { bookingService } from "../../../service/bookingService";
import { useAuthContext } from "../../../context/useAuthContext";
import type { VehicleType, ServiceType } from "../../../types/booking.types";
import ViewOldDataModal, { type VehicleProfileData } from "./ViewOldDataModal";

const { TextArea } = Input;
const { SHOW_PARENT } = TreeSelect;

export const ServiceBookingPage: React.FC = () => {
  const [form] = Form.useForm();
  const [serviceType, setServiceType] = useState<string>("");
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [selectedVehicleTypeId, setSelectedVehicleTypeId] = useState<string>("");
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [serviceModes, setServiceModes] = useState<string[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState<boolean>(false);
  const [loadingServices, setLoadingServices] = useState<boolean>(false);
  const [loadingServiceModes, setLoadingServiceModes] = useState<boolean>(false);
  const [isUseOldData, setIsUseOldData] = useState(false);

  // Lấy thông tin user từ AuthContext
  const { user } = useAuthContext();

  // Fetch vehicle types and service modes on mount
  useEffect(() => {
    fetchVehicleTypes();
    fetchServiceModes();
  }, []);

  // Fetch services when vehicle type changes
  useEffect(() => {
    if (selectedVehicleTypeId) {
      fetchServiceTypes(selectedVehicleTypeId);
    } else {
      setServiceTypes([]);
      form.setFieldValue("services", undefined);
    }
  }, [selectedVehicleTypeId]);

  const handleOldData = () => {
    setIsUseOldData(true);
  };

  const handleCancelModal = () => {
    setIsUseOldData(false);
  };


  const handleSelectVehicle = async (vehicleData: VehicleProfileData) => {
    try {
      // Fill thông tin cơ bản từ hồ sơ xe
      form.setFieldsValue({
        customerName: vehicleData.customerName,
        phone: vehicleData.phone,
        email: vehicleData.email,
        mileage: vehicleData.mileage,
        licensePlate: vehicleData.licensePlate,
        notes: vehicleData.notes || "",
        location: vehicleData.userAddress || "",
      });

      // Bước 1: Fill mẫu xe
      if (vehicleData.vehicleTypeId) {
        form.setFieldsValue({
          vehicleType: vehicleData.vehicleTypeId,
        });
        setSelectedVehicleTypeId(vehicleData.vehicleTypeId);

        // Bước 2: Load service types cho vehicle type đã chọn (luôn load để user có thể chọn)
        try {
          const serviceResponse = await bookingService.getServiceTypesByVehicleId(vehicleData.vehicleTypeId, {
            page: 0,
            pageSize: 100,
          });

          if (serviceResponse.data.success && serviceResponse.data.data.data) {
            setServiceTypes(serviceResponse.data.data.data);

            // Nếu có serviceTypeIds từ vehicle profile, fill vào form
            if (vehicleData.serviceTypeIds && vehicleData.serviceTypeIds.length > 0) {
              form.setFieldsValue({
                services: vehicleData.serviceTypeIds,
              });
            }

            // Bước 3: Fill loại hình dịch vụ (nếu có)
            if (vehicleData.serviceMode) {
              form.setFieldsValue({
                serviceType: vehicleData.serviceMode,
              });
              setServiceType(vehicleData.serviceMode);
            }

            if (vehicleData.serviceTypeIds && vehicleData.serviceTypeIds.length > 0) {
              message.success("Đã điền đầy đủ thông tin từ hồ sơ xe! Bạn có thể chỉnh sửa nếu cần.");
            } else {
              message.success("Đã điền thông tin cơ bản và mẫu xe. Vui lòng chọn dịch vụ.");
            }
          }
        } catch (error) {
          console.error("Error loading service types:", error);
          message.warning("Đã điền thông tin cơ bản và mẫu xe. Vui lòng chọn dịch vụ thủ công.");
        }
      } else {
        message.success("Đã điền thông tin cơ bản. Vui lòng chọn mẫu xe và dịch vụ.");
      }
    } catch (error) {
      console.error("Error in handleSelectVehicle:", error);
      message.error("Có lỗi khi điền thông tin từ hồ sơ xe.");
    }
  };

  const fetchVehicleTypes = async () => {
    setLoadingVehicles(true);
    try {
      const response = await bookingService.getVehicleTypes({
        page: 0,
        pageSize: 100,
      });
      if (response.data.success && response.data.data.data) {
        setVehicleTypes(response.data.data.data);
      }
    } catch (error) {
      message.error("Không thể tải danh sách mẫu xe");
      console.error("Error fetching vehicle types:", error);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const fetchServiceTypes = async (vehicleTypeId: string) => {
    setLoadingServices(true);
    try {
      const response = await bookingService.getServiceTypesByVehicleId(vehicleTypeId, {
        page: 0,
        pageSize: 100,
      });
      if (response.data.success && response.data.data.data) {
        setServiceTypes(response.data.data.data);
      }
    } catch (error) {
      message.error("Không thể tải danh sách dịch vụ");
      console.error("Error fetching service types:", error);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchServiceModes = async () => {
    setLoadingServiceModes(true);
    try {
      const response = await bookingService.getServiceModes();
      if (response.data.success && response.data.data) {
        setServiceModes(response.data.data);
      }
    } catch (error) {
      message.error("Không thể tải danh sách loại dịch vụ");
      console.error("Error fetching service modes:", error);
    } finally {
      setLoadingServiceModes(false);
    }
  };

  const handleVehicleTypeChange = (value: string) => {
    setSelectedVehicleTypeId(value);
    form.setFieldValue("services", undefined);
  };

  // Convert vehicle types to options
  const vehicleOptions = vehicleTypes.map((vt) => ({
    value: vt.vehicleTypeId,
    label: `${vt.vehicleTypeName} - ${vt.manufacturer} (${vt.modelYear})`,
  }));

  // Convert API response to TreeSelect format
  const buildServiceTree = (services: ServiceType[]) => {
    return services.map((service) => ({
      title: service.serviceName,
      value: service.serviceTypeId,
      key: service.serviceTypeId,
      children: service.children && service.children.length > 0
        ? service.children.map((child) => ({
          title: child.serviceName,
          value: child.serviceTypeId,
          key: child.serviceTypeId,
        }))
        : undefined,
    }));
  };

  const serviceTreeData = buildServiceTree(serviceTypes);

  // Hàm xử lý service selection logic
  const processServiceSelection = (selectedServices: string[], serviceTreeData: any[]): string[] => {
    if (!selectedServices || selectedServices.length === 0) return [];

    const result: string[] = [];

    selectedServices.forEach(serviceId => {
      const selectedService = findServiceInTree(serviceTreeData, serviceId);

      if (selectedService) {
        if (selectedService.children && selectedService.children.length > 0) {
          // Kiểm tra xem có children nào được chọn không
          const selectedChildren = selectedServices.filter(id =>
            selectedService.children?.some((child: any) => child.value === id)
          );

          if (selectedChildren.length === 0) {
            // Chỉ chọn parent → gửi tất cả children IDs (không gửi parent ID)
            selectedService.children?.forEach((child: any) => {
              result.push(child.value);
            });
          } else {
            // Có chọn children cụ thể → chỉ gửi những children được chọn
            result.push(...selectedChildren);
          }
        } else {
          // Đây là leaf node → gửi trực tiếp
          result.push(serviceId);
        }
      }
    });

    return [...new Set(result)];
  };

  // Hàm helper để tìm service trong tree
  const findServiceInTree = (treeData: any[], serviceId: string): any => {
    for (const service of treeData) {
      if (service.value === serviceId) return service;
      if (service.children) {
        const found = findServiceInTree(service.children, serviceId);
        if (found) return found;
      }
    }
    return null;
  };



  const onFinish: FormProps["onFinish"] = async (values) => {
    try {
      const dateValue = values["dateTime"];
      const formattedDate = isDayjs(dateValue)
        ? (dateValue as Dayjs).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
        : new Date().toISOString();

      // Xử lý service selection theo logic mới
      const processedServiceIds = processServiceSelection(values.services || [], serviceTreeData);

      // Map form values to API request
      const appointmentData = {
        ...(user?.userId && { customerId: user.userId }), // Chỉ thêm customerId nếu user tồn tại và có userId
        customerFullName: values.customerName,
        customerPhoneNumber: values.phone || "",
        customerEmail: values.email,
        vehicleTypeId: values.vehicleType,
        vehicleNumberPlate: values.licensePlate,
        vehicleKmDistances: values.mileage || "",
        userAddress: values.userAddress || values.location || "",
        serviceMode: values.serviceType,
        scheduledAt: formattedDate,
        notes: values.notes || "",
        serviceTypeIds: processedServiceIds,
      };

      const response = await bookingService.createAppointment(appointmentData);

      if (response.data.success) {
        console.log("APPOINTMENT CREATED SUCCESSFULLY:", {
          appointmentData: appointmentData,
          response: response.data,
          appointmentId: response.data.data,
          message: response.data.message
        });
        message.success(response.data.message || "Đặt lịch hẹn thành công!");
        form.resetFields();
        setSelectedVehicleTypeId("");
        setServiceType("");
      } else {
        console.log("APPOINTMENT CREATION FAILED:", {
          appointmentData: appointmentData,
          response: response.data,
          errorMessage: response.data.message
        });
        message.error(response.data.message || "Đặt lịch hẹn thất bại!");
      }
    } catch (error: any) {
      console.error("Error creating appointment:", {
        error: error,
        errorMessage: error?.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại!"
      });
      const errorMessage = error?.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại!";
      message.error(errorMessage);
    }
  };

  return (
    <>
      <div className="w-full h-[560px]">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.610010397031!2d106.809883!3d10.841127599999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2sFPT%20University%20HCMC!5e0!3m2!1sen!2s!4v1761944376322!5m2!1sen!2s"
          loading="lazy"
          className="w-full h-[560px] border-0"
          style={{ width: '100%', height: '560px' }}
        ></iframe>
      </div >
      <div className="w-[1170px] mx-auto mt-[50px] mb-[100px]">
        <h2 className="text-[#333] text-[3rem] uppercase font-[300] text-center relative booking-title">Đặt lịch dịch vụ</h2>
        <p className="mt-[34px] mb-[50px] text-[1.8rem] font-[300] text-center text-[#777777]">Chúng tôi là một trong những cửa hàng sửa chữa ô tô hàng đầu phục vụ khách hàng. Tất cả các dịch vụ sửa chữa đều được thực hiện bởi đội ngũ thợ máy có trình độ cao.</p>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="space-y-8"
        >
          <div className="flex gap-[30px]">
            {/* Thông tin khách hàng */}
            <div className="w-[570px]">
              <div className="text-[#333] pt-[11px] pb-[13px] px-[16px] font-[500] bg-[#F5F5F5] mb-[20px]">Thông tin khách hàng</div>
              <Form.Item
                name="customerName"
                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                className="mb-[20px]"
              >
                <Input
                  placeholder="Họ và tên"
                  className="border border-[#E2E6E7] py-[12px] px-[15px] w-full font-[500] outline-none text-[#1a1a1a]"
                />
              </Form.Item>
              <Form.Item
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  { pattern: new RegExp(/\d+/g), message: "Cần nhập số!" },
                  { min: 10, message: "Số điện thoại phải tối thiểu 10 số" },
                ]}
                className="mb-[20px]"
              >
                <Input
                  placeholder="Số điện thoại"
                  className="border border-[#E2E6E7] py-[12px] px-[15px] w-full font-[500] outline-none text-[#1a1a1a]"
                />
              </Form.Item>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input
                  placeholder="Email"
                  className="border border-[#E2E6E7] py-[12px] px-[15px] w-full font-[500] outline-none text-[#1a1a1a]"
                />
              </Form.Item>
            </div>

            {/* Thông tin xe */}
            <div className="w-[570px]">
              <div className="text-[#333] pt-[11px] pb-[13px] px-[16px] font-[500] bg-[#F5F5F5] mb-[20px]">Thông tin xe</div>
              <Form.Item
                name="vehicleType"
                rules={[{ required: true, message: "Vui lòng chọn mẫu xe" }]}
                className="mb-[20px]"
              >
                <Select
                  placeholder="Mẫu xe"
                  options={vehicleOptions}
                  loading={loadingVehicles}
                  onChange={handleVehicleTypeChange}
                  className="w-full"
                  style={{ height: '48px' }}
                />
              </Form.Item>
              <Form.Item
                name="mileage"
                className="mb-[20px]"
              >
                <Input
                  placeholder="Số Km"
                  className="border border-[#E2E6E7] py-[12px] px-[15px] w-full font-[500] outline-none text-[#1a1a1a]"
                />
              </Form.Item>
              <Form.Item
                name="licensePlate"
                rules={[
                  { required: true, message: "Vui lòng nhập biển số xe" },
                  { min: 7, message: "Biển số xe phải có ít nhất 7 ký tự" },
                  {
                    pattern: /^(0[1-9]|[1-9][0-9])[A-Z]-\d{5}$/,
                    message: "Biển số xe không đúng định dạng. Ví dụ: 30A-12345",
                  },
                ]}
              >
                <Input
                  placeholder="Biển số xe"
                  className="border border-[#E2E6E7] py-[12px] px-[15px] w-full font-[500] outline-none text-[#1a1a1a]"
                />
              </Form.Item>
            </div>
          </div>

          {/* Dịch vụ và Loại hình dịch vụ ngang hàng */}
          <div className="flex gap-[30px] mt-[30px]">
            {/* Dịch vụ */}
            <div className="w-[570px]">
              <div className="text-[#333] pt-[11px] pb-[13px] px-[16px] font-[500] bg-[#F5F5F5] mb-[20px]">Dịch vụ</div>
              <Form.Item
                name="services"
                rules={[{ required: true, message: "Vui lòng chọn dịch vụ" }]}
              >
                <TreeSelect
                  treeData={serviceTreeData}
                  treeCheckable
                  showCheckedStrategy={SHOW_PARENT}
                  placeholder={selectedVehicleTypeId ? "Vui lòng chọn" : "Vui lòng chọn mẫu xe trước"}
                  style={{ width: "100%", height: '48px' }}
                  allowClear
                  disabled={!selectedVehicleTypeId}
                  loading={loadingServices}
                />
              </Form.Item>
            </div>

            {/* Loại hình dịch vụ */}
            <div className="w-[570px]">
              <div className="text-[#333] pt-[11px] pb-[13px] px-[16px] font-[500] bg-[#F5F5F5] mb-[20px]">Loại hình dịch vụ</div>
              <Form.Item
                name="serviceType"
                rules={[{ required: true, message: "Vui lòng chọn thể loại" }]}
                className="mb-[20px]"
              >
                <Select
                  placeholder="Chọn loại dịch vụ"
                  options={serviceModes.map((mode) => {
                    const serviceModeMap: { [key: string]: string } = {
                      'STATIONARY': 'Tại trung tâm',
                      'MOBILE': 'Di động (Tận nơi)',
                    };
                    return {
                      value: mode,
                      label: serviceModeMap[mode] || mode,
                    };
                  })}
                  loading={loadingServiceModes}
                  onChange={(value) => setServiceType(value)}
                  className="w-full"
                  style={{ height: '48px' }}
                />
              </Form.Item>

              {/* Nếu STATIONARY → hiện địa điểm, MOBILE → hiện input */}
              {serviceType === "STATIONARY" && (
                <Form.Item
                  name="location"
                >
                  <Input
                    value="Vũng Tàu"
                    disabled
                    placeholder="Vũng Tàu"
                    className="border border-[#E2E6E7] py-[12px] px-[15px] w-full font-[500] outline-none text-[#1a1a1a] bg-gray-100"
                  />
                </Form.Item>
              )}

              {serviceType === "MOBILE" && (
                <Form.Item
                  name="userAddress"
                  rules={[
                    { required: true, message: "Vui lòng nhập địa chỉ gặp nạn" },
                  ]}
                >
                  <Input
                    placeholder="Địa chỉ gặp nạn"
                    className="border border-[#E2E6E7] py-[12px] px-[15px] w-full font-[500] outline-none text-[#1a1a1a]"
                  />
                </Form.Item>
              )}
            </div>
          </div>

          {/* Thời gian hẹn */}
          <div className="mt-[30px]">
            <div className="text-[#333] pt-[11px] pb-[13px] px-[16px] font-[500] bg-[#F5F5F5] mb-[20px]">Thời gian hẹn</div>
            <Form.Item
              name="dateTime"
              rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                className="w-full"
                placeholder="Thời gian hẹn"
                style={{ height: '48px' }}
              />
            </Form.Item>
          </div>

          {/* Ghi chú */}
          <div className="mt-[30px]">
            <div className="text-[#333] pt-[11px] pb-[13px] px-[16px] font-[500] bg-[#F5F5F5] mb-[20px]">Ghi chú</div>
            <Form.Item name="notes">
              <TextArea
                rows={4}
                placeholder="Nhập ghi chú (nếu có)"
                className="border border-[#E2E6E7] py-[12px] px-[15px] w-full font-[500] outline-none text-[#1a1a1a]"
              />
            </Form.Item>
          </div>

          {/* Nút Submit */}
          <style>{`
          .ant-select-selection-item,
          .ant-select-selection-placeholder {
            font-weight: 500 !important;
            color: #1a1a1a !important;
          }
          .ant-tree-select-selection-item,
          .ant-tree-select-selection-placeholder {
            font-weight: 500 !important;
            color: #1a1a1a !important;
          }
          .ant-picker-input > input {
            font-weight: 500 !important;
            color: #1a1a1a !important;
          }
          .booking-btn-primary {
            position: relative;
            overflow: hidden;
            background: #1E69B8 !important;
            border: 1px solid #1E69B8 !important;
            color: white !important;
            font-weight: 600;
            padding: 18px 50px !important;
            font-size: 1.8rem !important;
            transition: all 0.4s ease !important;
            z-index: 1;
          }
          .booking-btn-primary::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.2);
            transition: left 0.5s ease;
            z-index: -1;
          }
          .booking-btn-primary:hover::before {
            left: 100%;
          }
          .booking-btn-primary:hover {
            background: #155a9d !important;
            border-color: #155a9d !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(30, 105, 184, 0.4);
          }

          .booking-btn-secondary {
            position: relative;
            overflow: hidden;
            background: white !important;
            border: 2px solid #1E69B8 !important;
            color: #1E69B8 !important;
            font-weight: 600;
            padding: 18px 50px !important;
            font-size: 1.8rem !important;
            transition: all 0.4s ease !important;
            z-index: 1;
          }
          .booking-btn-secondary::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: rgba(30, 105, 184, 0.1);
            transition: left 0.5s ease;
            z-index: -1;
          }
          .booking-btn-secondary:hover::before {
            left: 100%;
          }
          .booking-btn-secondary:hover {
            background: #1E69B8 !important;
            border-color: #1E69B8 !important;
            color: white !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(30, 105, 184, 0.4);
          }
        `}</style>
          <div className="flex gap-[20px] justify-center mt-[30px]">
            <Button
              type="default"
              htmlType="submit"
              size="large"
              className="booking-btn-primary"
            >
              Đặt lịch hẹn
            </Button>
            <Button
              type="default"
              onClick={handleOldData}
              size="large"
              className="booking-btn-secondary"
            >
              Sử dụng hồ sơ xe
            </Button>
          </div>
        </Form>

        {/* Modal for old data */}
        <ViewOldDataModal
          open={isUseOldData}
          onCancel={handleCancelModal}
          onSelectVehicle={handleSelectVehicle}
        />
      </div>
    </>
  );
};
