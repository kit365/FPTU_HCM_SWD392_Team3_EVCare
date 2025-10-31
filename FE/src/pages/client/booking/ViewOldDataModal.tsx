

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, List, Typography, Card, Empty, Spin } from 'antd';
import { CarOutlined } from '@ant-design/icons';
import { vehicleProfileService } from '../../../service/vehicleProfileService';
import { useAuthContext } from '../../../context/useAuthContext';
import type { VehicleProfileResponse } from '../../../types/vehicle-profile.types';

const { Title, Text } = Typography;

// Interface cho dữ liệu hồ sơ xe cơ bản
export interface VehicleProfileData {
  appointmentId: string;
  vehicleName: string;
  licensePlate: string;
  customerName: string;
  phone: string;
  email: string;
  mileage: string;
  lastServiceDate: string;
  serviceType: string;
  // Thêm thông tin để fill tự động
  vehicleTypeId: string;
  vehicleTypeName: string;
  serviceTypeIds: string[];
  serviceTypeNames: string[];
  serviceMode: string;
  userAddress?: string;
  notes?: string;
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
      // Load vehicle profiles của user từ vehicleProfileService
      const vehicles = await vehicleProfileService.getByUserId(user.userId);
      
      // Map từ VehicleProfileResponse sang VehicleProfileData
      const profiles: VehicleProfileData[] = vehicles
        .filter(vehicle => !vehicle.isDeleted) // Chỉ lấy xe chưa bị xóa
        .map((vehicle: VehicleProfileResponse) => ({
          appointmentId: vehicle.vehicleId, // Dùng vehicleId làm ID tạm thời
          vehicleName: vehicle.vehicleType?.vehicleTypeName || '',
          licensePlate: vehicle.plateNumber || '',
          customerName: vehicle.user?.fullName || vehicle.user?.username || '',
          phone: vehicle.user?.numberPhone || '',
          email: vehicle.user?.email || '',
          mileage: vehicle.currentKm ? vehicle.currentKm.toString() : '0',
          lastServiceDate: vehicle.lastMaintenanceDate || vehicle.createdAt || new Date().toISOString(),
          serviceType: '', // Không có trong vehicle profile
          // Thông tin để fill tự động
          vehicleTypeId: vehicle.vehicleType?.vehicleTypeId || '',
          vehicleTypeName: vehicle.vehicleType?.vehicleTypeName || '',
          serviceTypeIds: [], // Không có trong vehicle profile, sẽ để trống
          serviceTypeNames: [], // Không có trong vehicle profile, sẽ để trống
          serviceMode: '', // Không có trong vehicle profile
          userAddress: vehicle.user?.address || '',
          notes: vehicle.notes || ''
        }));
      
      setVehicleProfiles(profiles);
    } catch (error) {
      console.error("Error fetching vehicle profiles:", error);
      setVehicleProfiles([]);
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
            Chọn xe để tự động điền thông tin
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
                    {item.mileage && (
                      <>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Số km: <Text strong>{parseInt(item.mileage).toLocaleString('vi-VN')}</Text>
                        </Text>
                        <br />
                      </>
                    )}
                    {item.lastServiceDate && (
                      <>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Bảo trì: {new Date(item.lastServiceDate).toLocaleDateString('vi-VN')}
                        </Text>
                        <br />
                      </>
                    )}
                    <Text type="secondary" style={{ fontSize: '11px', color: '#1890ff' }}>
                      ✓ Hồ sơ xe
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '11px', color: '#999' }}>
                      (Tự động điền thông tin)
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
