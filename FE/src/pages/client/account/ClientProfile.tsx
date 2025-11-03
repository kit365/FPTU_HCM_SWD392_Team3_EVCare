import React, { useEffect, useState } from 'react';
import { Card, Spin, Typography, message, Avatar, Space, Button, Modal, Form, Input, Popconfirm } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, EditOutlined, CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuthContext } from '../../../context/useAuthContext';
import { userService } from '../../../service/userService';
import type { UserResponse } from '../../../types/user.types';
import { useNavigate } from 'react-router-dom';
import { ImageUpload } from '../../../components/admin/common/ImageUpload';

const { Title, Text } = Typography;

const ClientProfile: React.FC = () => {
  const { user, refreshUser } = useAuthContext();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [form] = Form.useForm();
  const [textColor, setTextColor] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      // Ưu tiên email, nếu không có dùng username hoặc số điện thoại
      const userInformation = user.email || user.username || user.numberPhone || '';
      if (!userInformation) {
        console.warn('No user information available for profile lookup');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await userService.getProfile(userInformation);
        setProfile(data);
      } catch (e: any) {
        console.error('Error loading profile:', e);
        const errorMsg = e?.response?.data?.message || e?.message || 'Không thể tải hồ sơ';
        message.error(errorMsg);
        // Still set loading to false even on error
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // Detect background brightness and adjust text color
  useEffect(() => {
    const detectBrightness = () => {
      if (!profile?.backgroundUrl) {
        setTextColor('dark'); // Default gradient is bright
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Sample some pixels from the bottom area where text appears
        const samplePoints = [
          { x: canvas.width * 0.2, y: canvas.height * 0.8 },
          { x: canvas.width * 0.5, y: canvas.height * 0.8 },
          { x: canvas.width * 0.8, y: canvas.height * 0.8 },
          { x: canvas.width * 0.2, y: canvas.height * 0.9 },
          { x: canvas.width * 0.5, y: canvas.height * 0.9 },
          { x: canvas.width * 0.8, y: canvas.height * 0.9 },
        ];

        let totalBrightness = 0;
        samplePoints.forEach(point => {
          const imageData = ctx.getImageData(Math.floor(point.x), Math.floor(point.y), 1, 1);
          const [r, g, b] = imageData.data;
          // Calculate brightness using luminance formula
          const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
          totalBrightness += brightness;
        });

        const avgBrightness = totalBrightness / samplePoints.length;
        // If average brightness is below 0.5, use light text
        setTextColor(avgBrightness < 0.5 ? 'light' : 'dark');
      };

      img.onerror = () => {
        // If image fails to load, default to dark text
        setTextColor('dark');
      };

      img.src = profile.backgroundUrl;
    };

    detectBrightness();
  }, [profile?.backgroundUrl]);

  const handleEdit = () => {
    if (profile) {
      form.setFieldsValue({
        email: profile.email,
        fullName: profile.fullName || '',
        numberPhone: profile.numberPhone || '',
        address: profile.address || '',
        avatarUrl: profile.avatarUrl || '',
        backgroundUrl: profile.backgroundUrl || '',
      });
      setEditModalVisible(true);
    }
  };

  const handleCancel = () => {
    setEditModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (!user?.userId) {
        message.error('Không tìm thấy thông tin người dùng');
        return;
      }

      setEditing(true);
      
      // Update profile using the updateProfile service
      const updatedProfile = await userService.updateProfile(user.userId, {
        email: values.email,
        fullName: values.fullName || undefined,
        numberPhone: values.numberPhone || undefined,
        address: values.address || undefined,
        avatarUrl: values.avatarUrl || undefined,
        backgroundUrl: values.backgroundUrl || undefined,
      });

      message.success('Cập nhật thông tin thành công!');
      setProfile(updatedProfile);
      setEditModalVisible(false);
      
      // Refresh user context to update displayed info
      await refreshUser();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi cập nhật thông tin';
      message.error(errorMsg);
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.userId) {
      message.error('Không tìm thấy thông tin người dùng');
      return;
    }

    try {
      setDeleting(true);
      await userService.deleteMyAccount(user.userId);
      message.success('Xóa tài khoản thành công!');
      
      // Clear tokens and logout
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Navigate to home page
      navigate('/client');
      window.location.reload();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi xóa tài khoản';
      message.error(errorMsg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {/* Profile Container */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Cover Photo/Header Section - Facebook style */}
        <div className="relative w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
          {profile?.backgroundUrl ? (
            <div 
              className="w-full h-[400px] object-cover"
              style={{
                backgroundImage: `url(${profile.backgroundUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* Optional subtle overlay for better contrast */}
              <div className="absolute inset-0 bg-black/10"></div>
            </div>
          ) : (
            <div className="w-full h-[400px] bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600"></div>
          )}
          
          {/* Profile Info Section - Positioned over cover photo */}
          <div className="relative -mt-[120px] pb-8 px-8">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              <div className="relative">
                <Avatar 
                  size={200} 
                  src={profile?.avatarUrl || undefined} 
                  icon={<UserOutlined className="text-8xl text-white" />}
                  className="border-4 border-white shadow-2xl bg-gradient-to-br from-blue-600 to-cyan-600"
                />
              </div>
              <div className="flex-1 pb-4 md:pb-0">
                <Title 
                  level={1} 
                  className={textColor === 'light' ? "!mb-2 !text-white !text-6xl" : "!mb-2 !text-gray-900 !text-6xl"}
                  style={textColor === 'light' ? { textShadow: '2px 2px 4px rgba(0,0,0,0.5)' } : {}}
                >
                  {profile?.fullName || 'Chưa có tên'}
                </Title>
                <Text 
                  className={textColor === 'light' ? "text-white text-3xl mb-4 block" : "text-gray-600 text-3xl mb-4 block"}
                  style={textColor === 'light' ? { textShadow: '1px 1px 3px rgba(0,0,0,0.5)' } : {}}
                >
                  {profile?.email || '-'}
                </Text>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  size="large"
                  onClick={handleEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-xl py-6 px-8 h-auto"
                >
                  Chỉnh sửa hồ sơ
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section - Below cover photo */}
        <div className="mt-8 bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
            {loading ? (
              <div className="text-center py-12">
                <Spin size="large" />
                <div className="mt-4 text-gray-500 text-2xl">Đang tải thông tin...</div>
              </div>
            ) : profile ? (
              <Space direction="vertical" size="large" className="w-full">
                {/* Họ tên */}
                <Card className="shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-blue-500">
                  <Space size="large" className="w-full">
                    <UserOutlined className="text-5xl text-blue-600" style={{ minWidth: '50px' }} />
                    <div className="flex-1">
                      <Text type="secondary" className="text-3xl block mb-3">Họ tên</Text>
                      <Text strong className="text-4xl">{profile.fullName || '-'}</Text>
                    </div>
                  </Space>
                </Card>

                {/* Email */}
                <Card className="shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-cyan-500">
                  <Space size="large" className="w-full">
                    <MailOutlined className="text-5xl text-cyan-600" style={{ minWidth: '50px' }} />
                    <div className="flex-1">
                      <Text type="secondary" className="text-3xl block mb-3">Email</Text>
                      <Text strong className="text-4xl">{profile.email}</Text>
                    </div>
                  </Space>
                </Card>

                {/* Số điện thoại */}
                <Card className="shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-green-500">
                  <Space size="large" className="w-full">
                    <PhoneOutlined className="text-5xl text-green-600" style={{ minWidth: '50px' }} />
                    <div className="flex-1">
                      <Text type="secondary" className="text-3xl block mb-3">Số điện thoại</Text>
                      <Text strong className="text-4xl">{profile.numberPhone || '-'}</Text>
                    </div>
                  </Space>
                </Card>

                {/* Địa chỉ */}
                <Card className="shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-orange-500">
                  <Space size="large" className="w-full">
                    <IdcardOutlined className="text-5xl text-orange-600" style={{ minWidth: '50px' }} />
                    <div className="flex-1">
                      <Text type="secondary" className="text-3xl block mb-3">Địa chỉ</Text>
                      <Text strong className="text-4xl">{profile.address || 'Chưa có địa chỉ'}</Text>
                    </div>
                  </Space>
                </Card>

                {/* Tài khoản */}
                <Card className="shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-purple-500">
                  <Space size="large" className="w-full">
                    <IdcardOutlined className="text-5xl text-purple-600" style={{ minWidth: '50px' }} />
                    <div className="flex-1">
                      <Text type="secondary" className="text-3xl block mb-3">Tài khoản</Text>
                      <Text strong className="text-4xl">{profile.username}</Text>
                    </div>
                  </Space>
                </Card>

                {/* Delete Account Button */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <Popconfirm
                    title="Xóa tài khoản"
                    description="Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!"
                    onConfirm={handleDeleteAccount}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true, loading: deleting }}
                    placement="top"
                  >
                    <Button
                      danger
                      type="primary"
                      icon={<DeleteOutlined />}
                      size="large"
                      loading={deleting}
                      className="w-full text-xl py-6"
                    >
                      Xóa tài khoản
                    </Button>
                  </Popconfirm>
                </div>
              </Space>
            ) : (
              <div className="text-center py-12 text-gray-500 text-2xl">
                Không có dữ liệu hồ sơ.
              </div>
            )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        title={<span className="text-2xl font-bold">Chỉnh sửa thông tin cá nhân</span>}
        open={editModalVisible}
        onCancel={handleCancel}
        onOk={handleSubmit}
        confirmLoading={editing || uploadingAvatar || uploadingBackground}
        okText="Cập nhật"
        cancelText="Hủy"
        width={800}
        okButtonProps={{
          icon: <CheckOutlined />,
          size: 'large',
          className: 'bg-blue-600 hover:bg-blue-700'
        }}
        cancelButtonProps={{
          icon: <CloseOutlined />,
          size: 'large'
        }}
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-6"
        >
          <Form.Item
            label={<span className="text-xl font-semibold">Email</span>}
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input 
              size="large" 
              className="text-xl py-3" 
              placeholder="Nhập email"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-xl font-semibold">Họ và tên</span>}
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input 
              size="large" 
              className="text-xl py-3" 
              placeholder="Nhập họ và tên"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-xl font-semibold">Số điện thoại</span>}
            name="numberPhone"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^\d{10}$/, message: 'Số điện thoại phải có 10 chữ số!' }
            ]}
          >
            <Input 
              size="large" 
              className="text-xl py-3" 
              placeholder="Nhập số điện thoại"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-xl font-semibold">Địa chỉ</span>}
            name="address"
          >
            <Input.TextArea 
              rows={3}
              className="text-xl" 
              placeholder="Nhập địa chỉ"
            />
          </Form.Item>

          {/* Avatar Upload */}
          <Form.Item
            label={<span className="text-xl font-semibold">Ảnh đại diện</span>}
            name="avatarUrl"
          >
            <ImageUpload
              value={form.getFieldValue('avatarUrl')}
              onChange={(url) => form.setFieldValue('avatarUrl', url)}
              onUploadingChange={setUploadingAvatar}
              label=""
            />
          </Form.Item>

          {/* Background Upload */}
          <Form.Item
            label={<span className="text-xl font-semibold">Ảnh nền</span>}
            name="backgroundUrl"
          >
            <ImageUpload
              value={form.getFieldValue('backgroundUrl')}
              onChange={(url) => form.setFieldValue('backgroundUrl', url)}
              onUploadingChange={setUploadingBackground}
              label=""
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClientProfile;