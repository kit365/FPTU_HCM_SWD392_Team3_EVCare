import React, { useState } from 'react';
import { Modal, Descriptions, Tag, Button, Space, Popconfirm, message } from 'antd';
import { EditOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { UserAppointment } from '../../../types/booking.types';
import dayjs from 'dayjs';
import { bookingService } from '../../../service/bookingService';
import { useNavigate } from 'react-router-dom';

interface AppointmentDetailProps {
    dataDetail: UserAppointment | null;
    setDataDetail: React.Dispatch<React.SetStateAction<UserAppointment | null>>;
    isOpenDetail: boolean;
    setIsOpenDetail: React.Dispatch<React.SetStateAction<boolean>>;
    onSuccess?: () => void; // Callback để reload danh sách sau khi hủy/cập nhật
}

const AppointmentDetail: React.FC<AppointmentDetailProps> = ({ 
    dataDetail, 
    setDataDetail, 
    isOpenDetail, 
    setIsOpenDetail,
    onSuccess
}) => {
    const navigate = useNavigate();
    const [cancelling, setCancelling] = useState(false);

    const handleCancel = () => {
        setIsOpenDetail(false);
        setDataDetail(null);
    };

    // Hủy appointment
    const handleCancelAppointment = async () => {
        if (!dataDetail) return;

        setCancelling(true);
        try {
            const response = await bookingService.cancelAppointmentForCustomer(dataDetail.appointmentId);
            if (response.data.success) {
                message.success('Hủy cuộc hẹn thành công');
                handleCancel();
                // Reload danh sách
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                message.error(response.data.message || 'Hủy cuộc hẹn thất bại');
            }
        } catch (error: any) {
            console.error('Error cancelling appointment:', error);
            message.error(error?.response?.data?.message || 'Hủy cuộc hẹn thất bại');
        } finally {
            setCancelling(false);
        }
    };

    // Cập nhật appointment - redirect đến ServiceBooking với data pre-filled
    const handleUpdateAppointment = () => {
        if (!dataDetail) return;
        
        // Chuyển đến trang booking với appointmentId để pre-fill form
        navigate(`/client/booking?appointmentId=${dataDetail.appointmentId}&mode=edit`);
        handleCancel();
    };

    // Function to get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'orange';
            case 'CONFIRMED':
                return 'blue';
            case 'IN_PROGRESS':
                return 'purple';
            case 'COMPLETED':
                return 'green';
            case 'CANCELLED':
                return 'red';
            default:
                return 'default';
        }
    };

    // Function to get status text in Vietnamese
    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'Chờ xác nhận';
            case 'CONFIRMED':
                return 'Đã xác nhận';
            case 'IN_PROGRESS':
                return 'Đang thực hiện';
            case 'COMPLETED':
                return 'Hoàn thành';
            case 'CANCELLED':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    // Function to get service mode text in Vietnamese
    const getServiceModeText = (serviceMode: string) => {
        switch (serviceMode) {
            case 'STATIONARY':
                return 'Tại trạm';
            case 'MOBILE':
                return 'Di động';
            default:
                return serviceMode;
        }
    };

    if (!dataDetail) return null;

    const isPending = dataDetail?.status === 'PENDING';

    return (
        <Modal
            title="Chi tiết cuộc hẹn"
            open={isOpenDetail}
            onCancel={handleCancel}
            footer={
                isPending ? (
                    <Space>
                        <Popconfirm
                            title="Hủy cuộc hẹn"
                            description="Bạn có chắc chắn muốn hủy cuộc hẹn này?"
                            onConfirm={handleCancelAppointment}
                            okText="Đồng ý"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true, loading: cancelling }}
                        >
                            <Button 
                                danger 
                                icon={<CloseCircleOutlined />}
                                loading={cancelling}
                            >
                                Hủy cuộc hẹn
                            </Button>
                        </Popconfirm>
                        <Button 
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={handleUpdateAppointment}
                        >
                            Cập nhật
                        </Button>
                    </Space>
                ) : null
            }
            width={800}
        >
            <div className="space-y-6">
                {/* Thông tin khách hàng */}
                <div>
                    <h3 className="text-lg font-semibold mb-3 text-blue-600">Thông tin khách hàng</h3>
                    <Descriptions column={2} bordered size="small">
                        <Descriptions.Item label="Tên khách hàng" span={2}>
                            {dataDetail.customerFullName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
                            {dataDetail.customerPhoneNumber}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            {dataDetail.customerEmail}
                        </Descriptions.Item>
                    </Descriptions>
                </div>

                {/* Thông tin xe */}
                <div>
                    <h3 className="text-lg font-semibold mb-3 text-green-600">Thông tin xe</h3>
                    <Descriptions column={2} bordered size="small">
                        <Descriptions.Item label="Tên xe" span={2}>
                            {dataDetail.vehicleTypeResponse.vehicleTypeName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Hãng xe">
                            {dataDetail.vehicleTypeResponse.manufacturer}
                        </Descriptions.Item>
                        <Descriptions.Item label="Năm sản xuất">
                            {dataDetail.vehicleTypeResponse.modelYear}
                        </Descriptions.Item>
                        <Descriptions.Item label="Biển số xe">
                            {dataDetail.vehicleNumberPlate}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số km hiện tại">
                            {dataDetail.vehicleKmDistances} km
                        </Descriptions.Item>
                    </Descriptions>
                </div>

                {/* Thông tin cuộc hẹn */}
                <div>
                    <h3 className="text-lg font-semibold mb-3 text-purple-600">Thông tin cuộc hẹn</h3>
                    <Descriptions column={2} bordered size="small">
                        <Descriptions.Item label="Thời gian hẹn">
                            {dayjs(dataDetail.scheduledAt).format('DD/MM/YYYY HH:mm')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tình trạng">
                            <Tag color={getStatusColor(dataDetail.status)}>
                                {getStatusText(dataDetail.status)}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Hình thức dịch vụ">
                            <Tag color={dataDetail.serviceMode === 'STATIONARY' ? 'blue' : 'green'}>
                                {getServiceModeText(dataDetail.serviceMode)}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ">
                            {dataDetail.userAddress || 'Không có thông tin'}
                        </Descriptions.Item>
                    </Descriptions>
                </div>

                {/* Danh sách dịch vụ */}
                <div>
                    <h3 className="text-lg font-semibold mb-3 text-orange-600">Danh sách dịch vụ</h3>
                    <div className="space-y-2">
                        {dataDetail.serviceTypeResponses.map((service, index) => (
                            <div key={service.serviceTypeId} className="p-3 bg-gray-50 rounded-lg">
                                <div className="font-medium text-gray-800">
                                    {index + 1}. {service.serviceName}
                                </div>
                                {service.description && (
                                    <div className="text-sm text-gray-600 mt-1">
                                        {service.description}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ghi chú */}
                {dataDetail.notes && (
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-red-600">Ghi chú</h3>
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-gray-700">{dataDetail.notes}</p>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AppointmentDetail;
