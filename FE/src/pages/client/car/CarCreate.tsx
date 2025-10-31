import React, { useState, useEffect } from "react";
import { Button, Input, Modal, Select, Form, message } from "antd";
import { useAuthContext } from "../../../context/useAuthContext";
import { useVehicleProfile } from "../../../hooks/useVehicleProfile";
import { useVehicleType } from "../../../hooks/useVehicleType";
import ViewOldDataModal, { type VehicleProfileData } from "../../client/booking/ViewOldDataModal";
import type { CreationVehicleProfileRequest } from "../../../types/vehicle-profile.types";
import dayjs from "dayjs";

const { Search, TextArea } = Input;

interface CarCreateProps {
    onSearch?: (value: string) => void;
    onSuccess?: () => void;
}

const CarCreate: React.FC<CarCreateProps> = ({ onSearch, onSuccess }) => {
    const [form] = Form.useForm();
    const { user } = useAuthContext();
    const { create, update, list, search: searchVehicles } = useVehicleProfile();
    const { vehicleTypeOptions, fetchVehicleTypeNames } = useVehicleType();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isUseOldData, setIsUseOldData] = useState(false);

    useEffect(() => {
        fetchVehicleTypeNames();
    }, [fetchVehicleTypeNames]);

    const handleSearch = (value: string) => {
        if (onSearch) {
            onSearch(value);
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
        // Pre-fill userId nếu user đã login
        if (user?.userId) {
            form.setFieldValue("userId", user.userId);
        }
    };

    const handleSelectVehicle = (vehicleData: VehicleProfileData) => {
        // Auto-fill form với dữ liệu từ xe đã chọn
        form.setFieldsValue({
            vehicleTypeId: vehicleData.vehicleTypeId,
            plateNumber: vehicleData.licensePlate,
            mileage: vehicleData.mileage ? parseInt(vehicleData.mileage) : undefined,
            notes: vehicleData.notes || "",
        });
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // Format date nếu có
            let formattedDate = undefined;
            if (values.lastMaintenanceDate) {
                formattedDate = dayjs(values.lastMaintenanceDate).format("YYYY-MM-DDTHH:mm:ss");
            }

            const payload: CreationVehicleProfileRequest = {
                userId: user?.userId || "",
                vehicleTypeId: values.vehicleTypeId,
                plateNumber: values.plateNumber,
                vin: values.vin,
                currentKm: values.currentKm || 0,
                lastMaintenanceDate: formattedDate,
                lastMaintenanceKm: values.lastMaintenanceKm || 0,
                notes: values.notes || "",
            };

            // Tìm kiếm xe với plateNumber để kiểm tra trùng lặp
            await searchVehicles({
                keyword: values.plateNumber,
                page: 0,
                size: 100,
            });

            // Kiểm tra xem xe với userId + plateNumber đã tồn tại chưa
            const existingVehicle = list.find(
                v => v.user.userId === payload.userId && 
                     v.plateNumber.toLowerCase() === payload.plateNumber.toLowerCase()
            );

            if (existingVehicle) {
                // Nếu đã tồn tại -> Update
                const updateResult = await update(existingVehicle.vehicleId, {
                    vehicleTypeId: payload.vehicleTypeId,
                    vin: payload.vin,
                    currentKm: payload.currentKm,
                    lastMaintenanceDate: formattedDate,
                    lastMaintenanceKm: payload.lastMaintenanceKm,
                    notes: payload.notes,
                });
                
                if (updateResult) {
                    message.success("Đã cập nhật hồ sơ xe hiện có!");
                    resetAndCloseModal();
                    if (onSuccess) onSuccess();
                }
            } else {
                // Nếu chưa tồn tại -> Create
                const vehicleId = await create(payload);
                if (vehicleId) {
                    resetAndCloseModal();
                    if (onSuccess) onSuccess();
                }
            }
        } catch (error) {
            console.error("Validation failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const resetAndCloseModal = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    return (
        <div className="car-form" style={{ margin: "10px 0", marginBottom: "40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 className="text-[20px] font-semibold">Bảng Hồ Sơ Xe</h3>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <Search 
                        placeholder="Tìm kiếm xe" 
                        onSearch={handleSearch}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ width: 300 }}
                        enterButton 
                        allowClear
                    />
                    <Button
                        onClick={handleOpenModal}
                        type="primary"
                    >
                        Tạo Hồ Sơ Xe
                    </Button>
                </div>
            </div>

            <Modal
                title="Thêm mới hồ sơ xe"
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={resetAndCloseModal}
                maskClosable={false}
                okText="Tạo hồ sơ"
                cancelText="Hủy"
                confirmLoading={loading}
                width={800}
            >
                <div style={{ marginBottom: "16px" }}>
                    <Button 
                        type="dashed" 
                        onClick={() => setIsUseOldData(true)}
                        style={{ width: "100%" }}
                    >
                        Chọn từ xe đã đặt lịch trước
                    </Button>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        userId: user?.userId || "",
                    }}
                >
                    <Form.Item name="userId" hidden>
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Loại xe"
                        name="vehicleTypeId"
                        rules={[{ required: true, message: "Vui lòng chọn loại xe" }]}
                    >
                        <Select
                            placeholder="-- Chọn loại xe --"
                            options={vehicleTypeOptions}
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        label="Biển số xe"
                        name="plateNumber"
                        rules={[
                            { required: true, message: "Vui lòng nhập biển số xe" },
                            {
                                pattern: /^\d{2,3}[A-Z]{1,2}-\d{3,5}(\.\d{2})?$/,
                                message: "Biển số xe không đúng định dạng (VD: 51A-123.45 hoặc 29B-12345)"
                            }
                        ]}
                    >
                        <Input placeholder="VD: 51A-123.45 hoặc 29B-12345" />
                    </Form.Item>

                    <Form.Item
                        label="Số khung (VIN)"
                        name="vin"
                        rules={[{ required: true, message: "Vui lòng nhập số khung xe" }]}
                    >
                        <Input placeholder="Nhập số khung xe..." />
                    </Form.Item>

                    <Form.Item
                        label="Km hiện tại (Tùy chọn)"
                        name="currentKm"
                        rules={[
                            {
                                validator: (_, value) => {
                                    if (value === undefined || value === null || value === '') {
                                        return Promise.resolve();
                                    }
                                    const numValue = Number(value);
                                    if (isNaN(numValue) || numValue < 0) {
                                        return Promise.reject(new Error('Km phải là số >= 0'));
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <Input type="number" placeholder="Nhập số km hiện tại..." />
                    </Form.Item>

                    <Form.Item
                        label="Ghi chú (Tùy chọn)"
                        name="notes"
                    >
                        <TextArea 
                            rows={4}
                            placeholder="Nhập ghi chú về xe (tình trạng, lịch sử sửa chữa, đặc điểm...)..."
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <ViewOldDataModal
                open={isUseOldData}
                onCancel={() => setIsUseOldData(false)}
                onSelectVehicle={handleSelectVehicle}
            />
        </div>
    );
};

export default CarCreate;