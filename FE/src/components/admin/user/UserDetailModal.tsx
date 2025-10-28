import { Modal, Descriptions, Tag, Spin, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { userService } from '../../../service/userService';
import type { UserResponse } from '../../../types/user.types';
import { notify } from '../common/Toast';

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
    }
  }, [userId, open]);

  const fetchUserDetail = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const data = await userService.getById(userId);
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

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <UserOutlined />
          <span>Chi tiết người dùng</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      ) : user ? (
        <div className="space-y-4">
          {/* Avatar & Basic Info */}
          <div className="flex items-center gap-4 pb-4 border-b">
            <Avatar 
              size={80} 
              src={user.avatarUrl} 
              icon={<UserOutlined />}
              className="bg-blue-500"
            />
            <div>
              <h3 className="text-xl font-semibold">{user.fullName || 'Chưa có tên'}</h3>
              <p className="text-gray-500">{user.email}</p>
              {user.roleName && (
                <Tag color={getRoleColor(user.roleName)} className="mt-2">
                  {user.roleName[0]}
                </Tag>
              )}
            </div>
          </div>

          {/* Detailed Information */}
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Mã người dùng">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">{user.userId}</code>
            </Descriptions.Item>
            
            <Descriptions.Item label="Tên đăng nhập">
              {user.username || '-'}
            </Descriptions.Item>
            
            <Descriptions.Item label="Email">
              {user.email}
            </Descriptions.Item>
            
            <Descriptions.Item label="Số điện thoại">
              {user.numberPhone || '-'}
            </Descriptions.Item>
            
            <Descriptions.Item label="Địa chỉ">
              {user.address || '-'}
            </Descriptions.Item>
            
            <Descriptions.Item label="Nhà cung cấp">
              <Tag color={user.provider === 'GOOGLE' ? 'blue' : 'default'}>
                {user.provider || 'LOCAL'}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="Trạng thái">
              <Tag color={user.isDeleted ? 'red' : 'green'}>
                {user.isDeleted ? 'Đã xóa' : 'Hoạt động'}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="Vai trò">
              {user.roleName?.map((role) => (
                <Tag key={role} color={getRoleColor(user.roleName)}>
                  {role}
                </Tag>
              ))}
            </Descriptions.Item>
          </Descriptions>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Không tìm thấy thông tin người dùng
        </div>
      )}
    </Modal>
  );
};

