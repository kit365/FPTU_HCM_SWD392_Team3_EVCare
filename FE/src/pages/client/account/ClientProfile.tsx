import React, { useEffect, useState } from 'react';
import { Card, Spin, Typography, message, Avatar, Space } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined } from '@ant-design/icons';
import { useAuthContext } from '../../../context/useAuthContext';
import { userService } from '../../../service/userService';
import type { UserResponse } from '../../../types/user.types';

const { Title, Text } = Typography;

const ClientProfile: React.FC = () => {
  const { user } = useAuthContext();
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      // Ưu tiên email, nếu không có dùng username hoặc số điện thoại
      const userInformation = user.email || user.username || user.numberPhone || '';
      if (!userInformation) return;
      setLoading(true);
      try {
        const data = await userService.getProfile(userInformation);
        setProfile(data);
      } catch (e: any) {
        message.error(e?.response?.data?.message || 'Không thể tải hồ sơ');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                         radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)`
      }}></div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-3xl w-full bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-white">
            <div className="flex items-center gap-6">
              <Avatar 
                size={100} 
                src={profile?.avatarUrl} 
                icon={<UserOutlined />}
                className="border-4 border-white shadow-lg"
              />
              <div>
                <Title level={2} className="!mb-2 !text-white">
                  {profile?.fullName || 'Chưa có tên'}
                </Title>
                <Text className="text-blue-100 text-lg">
                  {profile?.email || '-'}
                </Text>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {loading ? (
              <div className="text-center py-12">
                <Spin size="large" />
                <div className="mt-4 text-gray-500">Đang tải thông tin...</div>
              </div>
            ) : profile ? (
              <Space direction="vertical" size="large" className="w-full">
                {/* Họ tên */}
                <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                  <Space size="middle" className="w-full">
                    <UserOutlined className="text-2xl text-blue-600" />
                    <div>
                      <Text type="secondary" className="text-sm block mb-1">Họ tên</Text>
                      <Text strong className="text-lg">{profile.fullName || '-'}</Text>
                    </div>
                  </Space>
                </Card>

                {/* Email */}
                <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-cyan-500">
                  <Space size="middle" className="w-full">
                    <MailOutlined className="text-2xl text-cyan-600" />
                    <div>
                      <Text type="secondary" className="text-sm block mb-1">Email</Text>
                      <Text strong className="text-lg">{profile.email}</Text>
                    </div>
                  </Space>
                </Card>

                {/* Số điện thoại */}
                <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                  <Space size="middle" className="w-full">
                    <PhoneOutlined className="text-2xl text-green-600" />
                    <div>
                      <Text type="secondary" className="text-sm block mb-1">Số điện thoại</Text>
                      <Text strong className="text-lg">{profile.numberPhone || '-'}</Text>
                    </div>
                  </Space>
                </Card>

                {/* Tài khoản */}
                <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
                  <Space size="middle" className="w-full">
                    <IdcardOutlined className="text-2xl text-purple-600" />
                    <div>
                      <Text type="secondary" className="text-sm block mb-1">Tài khoản</Text>
                      <Text strong className="text-lg">{profile.username}</Text>
                    </div>
                  </Space>
                </Card>
              </Space>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Không có dữ liệu hồ sơ.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;


