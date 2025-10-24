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
import vinImage from "../../../assets/vin.jpg";
import { bookingService } from "../../../service/bookingService";
import { useAuthContext } from "../../../context/useAuthContext";
import type { VehicleType, ServiceType } from "../../../types/booking.types";
import ViewOldDataModal from "./ViewOldDataModal";
import type { OldBookingData } from "./mockOldBookingData";

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
  const [isUseOldData, setIsUseOldData] = useState(false)

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

  const handleSelectVehicle = (bookingData: OldBookingData['bookingHistory']) => {
    // Chỉ fill thông tin cơ bản, không fill các trường selection
    form.setFieldsValue({
      customerName: bookingData.customerName,
      phone: bookingData.phone,
      email: bookingData.email,
      // KHÔNG điền vehicleType (Mẫu xe)
      mileage: bookingData.mileage,
      licensePlate: bookingData.licensePlate,
      // KHÔNG điền services (Dịch vụ)
      // KHÔNG điền serviceType (Loại hình dịch vụ)
      userAddress: bookingData.serviceType === 'MOBILE' ? bookingData.userAddress : undefined,
      // KHÔNG điền dateTime (Thời gian hẹn)
      notes: bookingData.notes,
    });

    // Reset các trường selection để user phải chọn lại
    form.setFieldsValue({
      vehicleType: undefined,
      services: undefined,
      serviceType: undefined,
      dateTime: undefined,
      location: undefined, // Reset location cho STATIONARY
    });

    // Reset state để không load services tự động
    setSelectedVehicleTypeId("");
    setServiceType("");

    // Hiển thị message
    message.success("Đã điền thông tin cơ bản từ lịch sử booking! Vui lòng chọn lại Mẫu xe, Dịch vụ và Thời gian.");
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
        appointmentData: appointmentData,
        error: error,
        errorMessage: error?.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại!"
      });
      const errorMessage = error?.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại!";
      message.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: `url(${vinImage})`,
          filter: "blur(2px)",
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
                  <Select
                    placeholder="Lựa chọn"
                    options={vehicleOptions}
                    loading={loadingVehicles}
                    onChange={handleVehicleTypeChange}
                  />
                </Form.Item>
                <Form.Item label="Số Km" name="mileage">
                  <Input placeholder="Nhập số km trên phương tiện" />
                </Form.Item>
                <Form.Item
                  label="Biển số xe"
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
                  <Input placeholder="Ví dụ: 30A-12345" />
                </Form.Item>
              </div>
            </div>

            {/* Dịch vụ */}
            <div>
              <h3 className="font-semibold mb-4">3. Dịch vụ</h3>
              <Form.Item
                name="services"
                label="Chọn dịch vụ"
                rules={[{ required: true, message: "Vui lòng chọn dịch vụ" }]}
              >
                <TreeSelect
                  treeData={serviceTreeData}
                  treeCheckable
                  showCheckedStrategy={SHOW_PARENT}
                  placeholder={selectedVehicleTypeId ? "Vui lòng chọn" : "Vui lòng chọn mẫu xe trước"}
                  style={{ width: "100%" }}
                  allowClear
                  disabled={!selectedVehicleTypeId}
                  loading={loadingServices}
                />
              </Form.Item>
            </div>

            {/* Loại dịch vụ & Thông tin liên hệ */}
            <div>
              <h3 className="font-semibold mb-4">4. Loại hình dịch vụ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item
                  label="Chọn thể loại dịch vụ"
                  name="serviceType"
                  rules={[{ required: true, message: "Vui lòng chọn thể loại" }]}
                >
                  <Select
                    placeholder="Chọn loại dịch vụ"
                    options={serviceModes.map((mode) => ({
                      value: mode,
                      label: mode,
                    }))}
                    loading={loadingServiceModes}
                    onChange={(value) => setServiceType(value)}
                  />
                </Form.Item>

                {/* Nếu STATIONARY → hiện địa điểm, MOBILE → hiện input */}
                {serviceType === "STATIONARY" && (
                  <Form.Item label="Địa điểm" name="location">
                    <Input value="Vũng Tàu" disabled placeholder="Vũng Tàu" />
                  </Form.Item>
                )}

                {serviceType === "MOBILE" && (
                  <Form.Item
                    label="Địa chỉ gặp nạn"
                    name="userAddress"
                    rules={[
                      { required: true, message: "Vui lòng nhập địa chỉ gặp nạn" },
                    ]}
                  >
                    <Input placeholder="Nhập địa chỉ gặp nạn của bạn" />
                  </Form.Item>
                )}
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
              <Button
                type="default"
                onClick={handleOldData}
                size="large"
                style={{ marginLeft: '16px' }}
              >
                Sử dụng dữ liệu cũ
              </Button>
            </div>
          </Form>
        </div>
      </div>

      {/* Modal for old data */}
      <ViewOldDataModal
        open={isUseOldData}
        onCancel={handleCancelModal}
        onSelectVehicle={handleSelectVehicle}
      />
    </div>
  );
};
