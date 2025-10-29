

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, List, Typography, Card, Empty, Spin } from 'antd';
import { CarOutlined } from '@ant-design/icons';
import { bookingService } from '../../../service/bookingService';
import { useAuthContext } from '../../../context/useAuthContext';
import type { UserAppointment } from '../../../types/booking.types';

const { Title, Text } = Typography;

// Interface cho dữ liệu hồ sơ xe cơ bản
export interface VehicleProfileData {
  appointmentId: string;
  vehicleName: string;
  vehicleTypeId: string;
  licensePlate: string;
  customerName: string;
  phone: string;
  email: string;
  mileage: string;
  lastServiceDate: string;
  serviceType: string;
  serviceTypeIds: string[];
  userAddress?: string;
}

interface ViewOldDataModalProps {
  open: boolean;
  onCancel: () => void;
  onSelectVehicle: (vehicleData: VehicleProfileData) => void;
}

const ViewOldDataModal: React.FC<ViewOldDataModalProps> = ({
  open,
  onCancel,
  onSelectVehicle,
}) => {
  const { user } = useAuthContext();
  const [vehicleProfiles, setVehicleProfiles] = useState<VehicleProfileData[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch vehicle profiles from API
  const fetchVehicleProfiles = useCallback(async () => {
    if (!user?.userId) return;
    
    setLoading(true);
    try {
      const response = await bookingService.getUserAppointments(user.userId, {
        page: 0,
        pageSize: 100,
        keyword: undefined
      });
      
      if (response.data.success) {
        const profiles: VehicleProfileData[] = response.data.data.data.map((appointment: UserAppointment) => ({
          appointmentId: appointment.appointmentId,
          vehicleName: appointment.vehicleTypeResponse.vehicleTypeName,
          vehicleTypeId: appointment.vehicleTypeResponse.vehicleTypeId,
          licensePlate: appointment.vehicleNumberPlate,
          customerName: appointment.customerFullName,
          phone: appointment.customerPhoneNumber,
          email: appointment.customerEmail,
          mileage: appointment.vehicleKmDistances,
          lastServiceDate: appointment.scheduledAt,
          serviceType: appointment.serviceMode,
          serviceTypeIds: appointment.serviceTypeResponses?.map(service => service.serviceTypeId) || [],
          userAddress: appointment.userAddress
        }));
        setVehicleProfiles(profiles);
      }
    } catch (error) {
      console.error("Error fetching vehicle profiles:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  // Fetch data when modal opens
  useEffect(() => {
    if (open) {
      fetchVehicleProfiles();
    }
  }, [open, fetchVehicleProfiles]);

  const handleVehicleSelect = (vehicle: VehicleProfileData) => {
    onSelectVehicle(vehicle);
    onCancel(); // Đóng modal sau khi chọn
  };

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center' }}>
          <CarOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '8px' }} />
          <Title level={4} style={{ display: 'inline', margin: 0 }}>
            Chọn xe để điền thông tin cơ bản
          </Title>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      centered
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>Đang tải dữ liệu hồ sơ xe...</div>
        </div>
      ) : vehicleProfiles.length > 0 ? (
        <List
          dataSource={vehicleProfiles}
          renderItem={(item) => (
            <List.Item
              style={{
                cursor: 'pointer',
                padding: '16px 0',
                borderBottom: '1px solid #f0f0f0',
              }}
              onClick={() => handleVehicleSelect(item)}
            >
              <Card
                hoverable
                style={{
                  width: '100%',
                  border: '1px solid #d9d9d9',
                  borderRadius: '8px',
                }}
                bodyStyle={{
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                      {item.vehicleName}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                      Biển số: <Text strong>{item.licensePlate}</Text>
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Khách hàng: {item.customerName}
                    </Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Dịch vụ: {item.serviceType === 'STATIONARY' ? 'Tại trạm' : 'Di động'}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Ngày: {new Date(item.lastServiceDate).toLocaleDateString('vi-VN')}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '11px', color: '#999' }}>
                      (Chỉ điền thông tin cơ bản)
                    </Text>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Empty
          description="Không có dữ liệu hồ sơ xe"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </Modal>
  );
};

export default ViewOldDataModal;
