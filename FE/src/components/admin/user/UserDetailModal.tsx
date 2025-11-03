import { Modal, Spin, Avatar, Typography, Tag, Divider } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, IdcardOutlined, SafetyOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { userService } from '../../../service/userService';
import type { UserResponse } from '../../../types/user.types';
import { notify } from '../common/Toast';

const { Title, Text } = Typography;

interface UserDetailModalProps {
  userId: string | null;
  open: boolean;
  onClose: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ userId, open, onClose }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId && open) {
      fetchUserDetail();
    } else if (!open) {
      // Reset user state when modal closes
      setUser(null);
    }
  }, [userId, open]);

  const fetchUserDetail = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Force refresh to get latest data including backgroundUrl
      const data = await userService.getById(userId, true);
      console.log('UserDetailModal - Fetched user data:', data);
      console.log('UserDetailModal - backgroundUrl:', data.backgroundUrl);
      setUser(data);
    } catch (error: any) {
      notify.error(error?.message || 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (roleName?: string[]) => {
    if (!roleName || roleName.length === 0) return 'default';
    const role = roleName[0];
    switch (role) {
      case 'ADMIN': return 'red';
      case 'STAFF': return 'blue';
      case 'TECHNICIAN': return 'green';
      case 'CUSTOMER': return 'orange';
      default: return 'default';
    }
  };

  const getRoleLabel = (roleName?: string[]) => {
    if (!roleName || roleName.length === 0) return 'Người dùng';
    const labels: Record<string, string> = {
      'ADMIN': 'Quản trị viên',
      'STAFF': 'Nhân viên',
      'TECHNICIAN': 'Kỹ thuật viên',
      'CUSTOMER': 'Khách hàng',
    };
    return roleName.map(role => labels[role] || role).join(', ');
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      className="user-detail-modal"
      styles={{
        body: {
          padding: 0,
        }
      }}
    >
      {loading ? (
        <div className="flex justify-center items-center py-20 px-6">
          <Spin size="large" />
        </div>
      ) : user ? (
        <div className="min-h-[500px]">
          {/* Header with Background and Avatar */}
          <div className="relative -mx-6 -mt-6 mb-16">
            {/* Background Image */}
            <div className="relative w-full h-[350px] overflow-hidden" key={user.backgroundUrl || 'no-bg'}>
              {user.backgroundUrl ? (
                <div
                  className="w-full h-full bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${user.backgroundUrl})` }}
                >
                  <div className="absolute inset-0 bg-black/20"></div>
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600"></div>
              )}
            </div>
            
            {/* Avatar and Basic Info - Positioned over background */}
            <div className="absolute -bottom-20 left-6 right-6 z-10">
              <div className="flex items-end gap-6 flex-wrap">
                <Avatar
                  size={200}
                  src={user.avatarUrl || undefined}
                  icon={<UserOutlined className="text-9xl text-white" />}
                  className="border-6 border-white shadow-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex-shrink-0"
                />
                <div className="pb-4 flex-1 min-w-0">
                  <Title 
                    level={1} 
                    className="!mb-2 !text-white !text-4xl !font-bold !leading-tight" 
                    style={{ textShadow: '3px 3px 8px rgba(0,0,0,0.7)' }}
                  >
                    {user.fullName || 'Chưa có tên'}
                  </Title>
                  <Text 
                    className="text-white text-xl block mb-4 font-semibold" 
                    style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.7)' }}
                  >
                    {getRoleLabel(user.roleName)}
                  </Text>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="mt-24 space-y-6 px-6 pb-6">
            {/* User ID Section */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <IdcardOutlined className="text-blue-600 text-3xl" />
                <Text strong className="text-2xl">Mã người dùng</Text>
              </div>
              <code className="text-xl bg-white px-5 py-4 rounded border border-gray-300 block w-full font-mono font-semibold">
                {user.userId}
              </code>
            </div>

            {/* Contact Information */}
            <div>
              <Title level={2} className="!mb-6 !text-3xl !font-bold">Thông tin liên hệ</Title>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-5 p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <MailOutlined className="text-blue-600 text-4xl mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <Text type="secondary" className="text-lg block mb-3 font-medium">Email</Text>
                    <Text strong className="text-xl break-words">{user.email}</Text>
                  </div>
                </div>
                
                <div className="flex items-start gap-5 p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <PhoneOutlined className="text-green-600 text-4xl mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <Text type="secondary" className="text-lg block mb-3 font-medium">Số điện thoại</Text>
                    <Text strong className="text-xl">{user.numberPhone || '-'}</Text>
                  </div>
                </div>
                
                {user.address && (
                  <div className="flex items-start gap-5 p-6 bg-gray-50 rounded-lg md:col-span-2 border border-gray-200">
                    <HomeOutlined className="text-purple-600 text-4xl mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <Text type="secondary" className="text-lg block mb-3 font-medium">Địa chỉ</Text>
                      <Text strong className="text-xl break-words">{user.address}</Text>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Divider className="!my-6" />

            {/* Account Information */}
            <div>
              <Title level={2} className="!mb-6 !text-3xl !font-bold">Thông tin tài khoản</Title>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <Text type="secondary" className="text-lg block mb-3 font-medium">Tên đăng nhập</Text>
                  <Text strong className="text-xl">{user.username || '-'}</Text>
                </div>
                
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <Text type="secondary" className="text-lg block mb-3 font-medium">Nhà cung cấp</Text>
                  <Tag color={user.provider === 'GOOGLE' ? 'blue' : 'default'} style={{ marginTop: '6px', fontSize: '18px', padding: '8px 16px', height: 'auto', fontWeight: 500 }}>
                    {user.provider || 'LOCAL'}
                  </Tag>
                </div>
                
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <Text type="secondary" className="text-lg block mb-3 font-medium">Trạng thái tài khoản</Text>
                  <div className="flex items-center gap-3 mt-2">
                    {user.isActive ? (
                      <>
                        <CheckCircleOutlined className="text-green-600 text-2xl" />
                        <Text strong className="text-green-600 text-xl">Hoạt động</Text>
                      </>
                    ) : (
                      <>
                        <CloseCircleOutlined className="text-gray-500 text-2xl" />
                        <Text strong className="text-gray-500 text-xl">Không hoạt động</Text>
                      </>
                    )}
                  </div>
                </div>
                
                {user.isDeleted !== undefined && (
                  <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <Text type="secondary" className="text-lg block mb-3 font-medium">Trạng thái xóa</Text>
                    <div className="flex items-center gap-3 mt-2">
                      {user.isDeleted ? (
                        <>
                          <CloseCircleOutlined className="text-red-600 text-2xl" />
                          <Text strong className="text-red-600 text-xl">Đã xóa</Text>
                        </>
                      ) : (
                        <>
                          <CheckCircleOutlined className="text-green-600 text-2xl" />
                          <Text strong className="text-green-600 text-xl">Chưa xóa</Text>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            {(user.createdAt || user.updatedAt) && (
              <>
                <Divider className="!my-6" />
                <div>
                  <Title level={2} className="!mb-6 !text-3xl !font-bold">Thông tin hệ thống</Title>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {user.createdAt && (
                      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                        <Text type="secondary" className="text-lg block mb-3 font-medium">Ngày tạo</Text>
                        <Text strong className="text-xl">
                          {new Date(user.createdAt).toLocaleString('vi-VN')}
                        </Text>
                      </div>
                    )}
                    {user.updatedAt && (
                      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                        <Text type="secondary" className="text-lg block mb-3 font-medium">Ngày cập nhật</Text>
                        <Text strong className="text-xl">
                          {new Date(user.updatedAt).toLocaleString('vi-VN')}
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          Không tìm thấy thông tin người dùng
        </div>
      )}
    </Modal>
  );
};
