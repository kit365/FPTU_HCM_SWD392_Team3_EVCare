import React, { useState, useEffect } from "react" ;
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

  // Fetch vehicle types and service modes on mount (only when user is logged in)
  useEffect(() => {
    console.log("🔄 [BOOKING DEBUG] useEffect triggered - user:", user);
    if (user?.userId) {
      console.log("👤 [BOOKING DEBUG] User is logged in, fetching data...");
      fetchVehicleTypes();
      fetchServiceModes();
    } else {
      console.log("❌ [BOOKING DEBUG] User not logged in, skipping data fetch");
    }
  }, [user?.userId, user]);

  // Fetch services when vehicle type changes
  useEffect(() => {
    console.log("🔄 [BOOKING DEBUG] Vehicle type useEffect triggered - selectedVehicleTypeId:", selectedVehicleTypeId);
    if (selectedVehicleTypeId) {
      console.log("🔧 [BOOKING DEBUG] Fetching services for vehicle type:", selectedVehicleTypeId);
      fetchServiceTypes(selectedVehicleTypeId);
    } else {
      console.log("🔧 [BOOKING DEBUG] No vehicle type selected, clearing services");
      setServiceTypes([]);
      form.setFieldValue("services", undefined);
    }
  }, [selectedVehicleTypeId, form]);

  const handleOldData = () => {
    setIsUseOldData(true);
  };

  const handleCancelModal = () => {
    setIsUseOldData(false);
  };

  const handleResetForm = () => {
    form.resetFields();
    setSelectedVehicleTypeId("");
    setServiceType("");
    setServiceTypes([]);
  };

  const handleSelectVehicle = (vehicleData: VehicleProfileData) => {
    // Fill thông tin cơ bản từ hồ sơ xe (không disable)
    form.setFieldsValue({
      customerName: vehicleData.customerName,
      phone: vehicleData.phone,
      email: vehicleData.email,
      mileage: vehicleData.mileage,
      licensePlate: vehicleData.licensePlate,
    });

    // Client có thể edit tất cả các field như bình thường

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
    message.success("Đã điền thông tin cơ bản từ hồ sơ xe! Bạn có thể chỉnh sửa thông tin nếu cần. Vui lòng chọn Mẫu xe, Dịch vụ và Thời gian.");
  };

  const fetchVehicleTypes = async () => {
    console.log("🚗 [BOOKING DEBUG] Starting to fetch vehicle types...");
    setLoadingVehicles(true);
    try {
      // Sử dụng bookingService với authentication
      const response = await bookingService.getVehicleTypes({
        page: 0,
        pageSize: 100,
      });
      console.log("🚗 [BOOKING DEBUG] Vehicle types response:", response);
      if (response.data.success && response.data.data.data) {
        setVehicleTypes(response.data.data.data);
        console.log("🚗 [BOOKING DEBUG] Vehicle types loaded successfully:", response.data.data.data.length, "items");
      } else {
        console.warn("🚗 [BOOKING DEBUG] Vehicle types response not successful:", response.data);
      }
    } catch (error) {
      message.error("Không thể tải danh sách mẫu xe");
      console.error("🚗 [BOOKING DEBUG] Error fetching vehicle types:", error);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const fetchServiceTypes = async (vehicleTypeId: string) => {
    console.log("🔧 [BOOKING DEBUG] Starting to fetch service types for vehicle:", vehicleTypeId);
    setLoadingServices(true);
    try {
      // Sử dụng bookingService với authentication
      const response = await bookingService.getServiceTypesByVehicleId(vehicleTypeId, {
        page: 0,
        pageSize: 100,
        isActive: true,
      });
      console.log("🔧 [BOOKING DEBUG] Service types response:", response);
      if (response.data.success && response.data.data.data) {
        setServiceTypes(response.data.data.data);
        console.log("🔧 [BOOKING DEBUG] Service types loaded successfully:", response.data.data.data.length, "items");
      } else {
        console.warn("🔧 [BOOKING DEBUG] Service types response not successful:", response.data);
      }
    } catch (error) {
      message.error("Không thể tải danh sách dịch vụ");
      console.error("🔧 [BOOKING DEBUG] Error fetching service types:", error);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchServiceModes = async () => {
    console.log("📋 [BOOKING DEBUG] Starting to fetch service modes...");
    setLoadingServiceModes(true);
    try {
      // Sử dụng bookingService với authentication
      const response = await bookingService.getServiceModes();
      console.log("📋 [BOOKING DEBUG] Service modes response:", response);
      if (response.data.success && response.data.data) {
        setServiceModes(response.data.data);
        console.log("📋 [BOOKING DEBUG] Service modes loaded successfully:", response.data.data);
      } else {
        console.warn("📋 [BOOKING DEBUG] Service modes response not successful:", response.data);
      }
    } catch (error) {
      message.error("Không thể tải danh sách loại dịch vụ");
      console.error("📋 [BOOKING DEBUG] Error fetching service modes:", error);
    } finally {
      setLoadingServiceModes(false);
    }
  };

  const handleVehicleTypeChange = (value: string) => {
    console.log("🚗 [BOOKING DEBUG] Vehicle type changed to:", value);
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
    console.log("📝 [BOOKING DEBUG] Form submitted with values:", values);
    try {
      const dateValue = values["dateTime"];
      const formattedDate = isDayjs(dateValue)
        ? (dateValue as Dayjs).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
        : new Date().toISOString();

      console.log("📅 [BOOKING DEBUG] Formatted date:", formattedDate);

      // Xử lý service selection theo logic mới
      const processedServiceIds = processServiceSelection(values.services || [], serviceTreeData);
      console.log("🔧 [BOOKING DEBUG] Processed service IDs:", processedServiceIds);

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

      console.log("📤 [BOOKING DEBUG] Sending appointment data:", appointmentData);
      console.log("👤 [BOOKING DEBUG] Current user:", user);

      const response = await bookingService.createAppointment(appointmentData);

      console.log("📥 [BOOKING DEBUG] Appointment creation response:", response);

      if (response.data.success) {
        console.log("✅ [BOOKING DEBUG] APPOINTMENT CREATED SUCCESSFULLY:", {
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
        console.log("❌ [BOOKING DEBUG] APPOINTMENT CREATION FAILED:", {
          appointmentData: appointmentData,
          response: response.data,
          errorMessage: response.data.message
        });
        message.error(response.data.message || "Đặt lịch hẹn thất bại!");
      }
    } catch (error: any) {
      console.error("💥 [BOOKING DEBUG] Error creating appointment:", {
        error: error,
        errorMessage: error?.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại!",
        errorResponse: error?.response?.data,
        errorStatus: error?.response?.status
      });
      const errorMessage = error?.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại!";
      message.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                         radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)`
      }}></div>

      {/* Custom Styles */}
      <style>{`
        .ant-input, .ant-select-selector, .ant-picker, .ant-input-textarea {
          border-radius: 12px !important;
          border: 2px solid #e5e7eb !important;
          transition: all 0.3s ease !important;
        }
        .ant-input:hover, .ant-select-selector:hover, .ant-picker:hover, .ant-input-textarea:hover {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
        .ant-input:focus, .ant-input-focused, .ant-select-focused .ant-select-selector,
        .ant-picker-focused, .ant-input-textarea:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
        }
        .ant-form-item-label > label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }
        .ant-select-selection-placeholder {
          color: #9ca3af !important;
        }
      `}</style>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-6xl w-full bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              ĐẶT LỊCH DỊCH VỤ
            </h2>
            <p className="text-gray-600 text-lg">Đặt lịch sửa chữa và bảo dưỡng xe điện VinFast</p>
            {!user?.userId && (
              <p className="text-red-600 text-sm mt-2">
                ⚠️ Vui lòng đăng nhập để sử dụng chức năng đặt lịch hẹn.
              </p>
            )}
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="space-y-8"
            disabled={!user?.userId}
          >
            {/* Grid 2 cột */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Thông tin khách hàng */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-xl mb-6 text-gray-800 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  Thông tin khách hàng
                </h3>
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
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-xl mb-6 text-gray-800 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  Thông tin xe
                </h3>
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
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-xl mb-6 text-gray-800 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                Dịch vụ
              </h3>
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
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-xl mb-6 text-gray-800 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">4</span>
                </div>
                Loại hình dịch vụ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item
                  label="Chọn thể loại dịch vụ"
                  name="serviceType"
                  rules={[{ required: true, message: "Vui lòng chọn thể loại" }]}
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
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-xl mb-6 text-gray-800 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-slate-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">5</span>
                </div>
                Ghi chú
              </h3>
              <Form.Item name="notes">
                <TextArea rows={4} placeholder="Nhập ghi chú (nếu có)" />
              </Form.Item>
            </div>

            {/* Nút Submit */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 border border-blue-200">
              <div className="text-center space-x-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 border-0 text-white font-semibold px-8 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Đặt lịch hẹn
                </Button>
                {user?.userId && (
                  <Button
                    type="default"
                    onClick={handleOldData}
                    size="large"
                    className="bg-white/80 backdrop-blur-sm border-2 border-blue-200 text-blue-700 font-semibold px-8 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:bg-blue-50"
                  >
                    Sử dụng hồ sơ xe
                  </Button>
                )}
                <Button
                  type="default"
                  onClick={handleResetForm}
                  size="large"
                  className="bg-white/80 backdrop-blur-sm border-2 border-orange-200 text-orange-700 font-semibold px-8 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:bg-orange-50"
                >
                  Nhập lại từ đầu
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </div>

      {/* Modal for old data - chỉ hiển thị khi đã đăng nhập */}
      {user?.userId && (
        <ViewOldDataModal
          open={isUseOldData}
          onCancel={handleCancelModal}
          onSelectVehicle={handleSelectVehicle}
        />
      )}
    </div>
  );
};
