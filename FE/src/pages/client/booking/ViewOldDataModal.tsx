

import React from 'react';
import { Modal, List, Typography, Card, Empty } from 'antd';
import { CarOutlined } from '@ant-design/icons';
import { mockOldBookingData, type OldBookingData } from './mockOldBookingData';

const { Title, Text } = Typography;

interface ViewOldDataModalProps {
  open: boolean;
  onCancel: () => void;
  onSelectVehicle: (bookingData: OldBookingData['bookingHistory']) => void;
}

const ViewOldDataModal: React.FC<ViewOldDataModalProps> = ({
  open,
  onCancel,
  onSelectVehicle,
}) => {
  const handleVehicleSelect = (vehicle: OldBookingData) => {
    onSelectVehicle(vehicle.bookingHistory);
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
      {mockOldBookingData.length > 0 ? (
        <List
          dataSource={mockOldBookingData}
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
                      Khách hàng: {item.bookingHistory.customerName}
                    </Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Dịch vụ: {item.bookingHistory.serviceType}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Ngày: {new Date(item.bookingHistory.dateTime).toLocaleDateString('vi-VN')}
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
          description="Không có dữ liệu lịch sử"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </Modal>
  );
};

export default ViewOldDataModal;
