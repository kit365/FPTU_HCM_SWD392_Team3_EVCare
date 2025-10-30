import React, { useEffect, useState } from 'react';
import { Input, Modal, Select, Form, message } from "antd";
import { useVehicleProfile } from "../../../hooks/useVehicleProfile";
import { useVehicleType } from "../../../hooks/useVehicleType";
import type { VehicleProfileResponse, UpdationVehicleProfileRequest } from "../../../types/vehicle-profile.types";
import dayjs from "dayjs";

const { TextArea } = Input;

interface CarUpdateProps {
    dataUpdate: VehicleProfileResponse | null;
    setDataUpdate: React.Dispatch<React.SetStateAction<VehicleProfileResponse | null>>;
    isOpenUpdate: boolean;
    setIsOpenUpdate: React.Dispatch<React.SetStateAction<boolean>>;
    onSuccess?: () => void;
}

const CarUpdate: React.FC<CarUpdateProps> = ({
    dataUpdate,
    setDataUpdate,
    isOpenUpdate,
    setIsOpenUpdate,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const { update, loading } = useVehicleProfile();
    const { vehicleTypeOptions, fetchVehicleTypeNames } = useVehicleType();

    useEffect(() => {
        fetchVehicleTypeNames();
    }, [fetchVehicleTypeNames]);

    useEffect(() => {
        // Set data truyền vào để hiện lên modal
        if (dataUpdate) {
            form.setFieldsValue({
                vehicleTypeId: dataUpdate.vehicleType?.vehicleTypeId || "",
                plateNumber: dataUpdate.plateNumber || "",
                vin: dataUpdate.vin || "",
                currentKm: dataUpdate.currentKm || undefined,
                lastMaintenanceDate: dataUpdate.lastMaintenanceDate 
                    ? dayjs(dataUpdate.lastMaintenanceDate) 
                    : undefined,
                lastMaintenanceKm: dataUpdate.lastMaintenanceKm || undefined,
                notes: dataUpdate.notes || "",
            });
        }
    }, [dataUpdate, form]);

    const handleSubmit = async () => {
        if (!dataUpdate) return;

        try {
            const values = await form.validateFields();

            // Format date nếu có
            let formattedDate = undefined;
            if (values.lastMaintenanceDate) {
                formattedDate = dayjs(values.lastMaintenanceDate).format("YYYY-MM-DDTHH:mm:ss");
            }

            const payload: UpdationVehicleProfileRequest = {
                userId: dataUpdate.user.userId,
                vehicleTypeId: values.vehicleTypeId,
                plateNumber: values.plateNumber,
                vin: values.vin,
                currentKm: values.currentKm,
                lastMaintenanceDate: formattedDate,
                lastMaintenanceKm: values.lastMaintenanceKm,
                notes: values.notes,
            };

            const result = await update(dataUpdate.vehicleId, payload);
            if (result) {
                resetAndCloseModal();
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    const resetAndCloseModal = () => {
        setIsOpenUpdate(false);
        form.resetFields();
        setDataUpdate(null);
    };

    return (
        <Modal
            title="Cập nhật hồ sơ xe"
            open={isOpenUpdate}
            onOk={handleSubmit}
            onCancel={resetAndCloseModal}
            maskClosable={false}
            okText="Cập nhật"
            cancelText="Hủy"
            confirmLoading={loading}
            width={800}
        >
            <Form
                form={form}
                layout="vertical"
            >
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
    );
};

export default CarUpdate;