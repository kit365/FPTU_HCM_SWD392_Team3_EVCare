import { Modal, Spin, Avatar, Typography, Tag, Divider, Card, Button, Input, Select, Popconfirm, Image } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, IdcardOutlined, SafetyOutlined, CheckCircleOutlined, CloseCircleOutlined, TrophyOutlined, CalendarOutlined, DollarOutlined, StarOutlined, ContactsOutlined, FileTextOutlined, EditOutlined, PlusOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { userService } from '../../../service/userService';
import { employeeProfileService } from '../../../service/employeeProfileService';
import type { UserResponse } from '../../../types/user.types';
import type { EmployeeProfileResponse, CreationEmployeeProfileRequest, UpdationEmployeeProfileRequest, Certification } from '../../../types/employee-profile.types';
import { notify } from '../common/Toast';
import { SkillLevelEnum } from '../../../types/employee-profile.types';
import HasRole from '../../../components/common/HasRole';
import { RoleEnum } from '../../../constants/roleConstants';
import { ImageUpload } from '../common/ImageUpload';

const { Title, Text } = Typography;

interface StaffDetailModalProps {
  userId: string | null;
  open: boolean;
  onClose: () => void;
}

export const StaffDetailModal: React.FC<StaffDetailModalProps> = ({ userId, open, onClose }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [employeeProfile, setEmployeeProfile] = useState<EmployeeProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileFormOpen, setProfileFormOpen] = useState(false);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    skillLevel: '' as SkillLevelEnum | '',
    certifications: [] as Certification[],
    performanceScore: '',
    hireDate: null as Dayjs | null,
    salaryBase: '',
    emergencyContact: '',
    position: '',
    notes: '',
  });

  useEffect(() => {
    if (userId && open) {
      fetchUserDetail();
      fetchEmployeeProfile();
    } else if (!open) {
      // Reset state when modal closes
      setUser(null);
      setEmployeeProfile(null);
    }
  }, [userId, open]);

  const fetchUserDetail = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Force refresh to get latest data including backgroundUrl
      const data = await userService.getById(userId, true);
      console.log('StaffDetailModal - Fetched user data:', data);
      console.log('StaffDetailModal - backgroundUrl:', data.backgroundUrl);
      setUser(data);
    } catch (error: any) {
      notify.error(error?.message || 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeProfile = async () => {
    if (!userId) return;
    
    setLoadingProfile(true);
    try {
      // Try to get employee profile directly by userId
      const profile = await employeeProfileService.getByUserId(userId);
      
      if (profile) {
        console.log('Found employee profile:', profile);
        setEmployeeProfile(profile);
      } else {
        console.log('Employee profile not found for user:', userId);
        // Clear profile if not found
        setEmployeeProfile(null);
      }
    } catch (error: any) {
      // Employee profile might not exist, that's okay
      console.error('Error fetching employee profile:', error);
      setEmployeeProfile(null);
    } finally {
      setLoadingProfile(false);
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

  const getSkillLevelLabel = (skillLevel?: SkillLevelEnum | string) => {
    if (!skillLevel) return '-';
    const labels: Record<string, string> = {
      INTERNSHIP: 'Thực tập',
      FRESHER: 'Fresher',
      JUNIOR: 'Junior',
      MIDDLE: 'Middle',
      SENIOR: 'Senior',
    };
    return labels[skillLevel] || skillLevel;
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleOpenProfileForm = (isEdit: boolean) => {
    if (isEdit && employeeProfile) {
      setProfileFormData({
        skillLevel: employeeProfile.skillLevel || '',
        certifications: employeeProfile.certifications || [],
        performanceScore: employeeProfile.performanceScore?.toString() || '',
        hireDate: employeeProfile.hireDate ? dayjs(employeeProfile.hireDate) : null,
        salaryBase: employeeProfile.salaryBase?.toString() || '',
        emergencyContact: employeeProfile.emergencyContact || '',
        position: employeeProfile.position || '',
        notes: employeeProfile.notes || '',
      });
    } else {
      setProfileFormData({
        skillLevel: '',
        certifications: [],
        performanceScore: '',
        hireDate: null,
        salaryBase: '',
        emergencyContact: '',
        position: '',
        notes: '',
      });
    }
    setProfileFormOpen(true);
  };

  const handleDeleteProfile = async () => {
    if (!employeeProfile || !userId) return;
    
    try {
      await employeeProfileService.remove(employeeProfile.employeeProfileId);
      notify.success('Xóa hồ sơ nhân viên thành công!');
      fetchEmployeeProfile(); // Refresh profile data
    } catch (error: any) {
      notify.error(error?.message || 'Có lỗi xảy ra khi xóa hồ sơ');
    }
  };

  const handleProfileFormSubmit = async () => {
    if (!userId) return;

    if (!profileFormData.skillLevel) {
      notify.error('Vui lòng chọn trình độ kỹ năng');
      return;
    }

    try {
      setSubmittingProfile(true);

      const submitData: any = {
        skillLevel: profileFormData.skillLevel,
        certifications: profileFormData.certifications && profileFormData.certifications.length > 0 ? profileFormData.certifications : undefined,
        performanceScore: profileFormData.performanceScore ? Number(profileFormData.performanceScore) : undefined,
        // totalHoursWorked is not included - it's auto-calculated from shifts
        hireDate: profileFormData.hireDate ? profileFormData.hireDate.toISOString() : undefined,
        salaryBase: profileFormData.salaryBase ? Number(profileFormData.salaryBase) : undefined,
        emergencyContact: profileFormData.emergencyContact || undefined,
        position: profileFormData.position || undefined,
        notes: profileFormData.notes || undefined,
      };

      if (employeeProfile) {
        // Update mode
        await employeeProfileService.update(employeeProfile.employeeProfileId, submitData);
        notify.success('Cập nhật hồ sơ nhân viên thành công!');
      } else {
        // Create mode
        await employeeProfileService.create({
          userId: userId,
          ...submitData,
        });
        notify.success('Tạo hồ sơ nhân viên thành công!');
        
        // Activate user after creating profile
        try {
          // Include email in update request as it's required by backend validation
          if (user && user.email) {
            await userService.update(userId, { 
              email: user.email,
              isActive: true 
            });
          }
        } catch (error) {
          console.warn('Could not activate user:', error);
        }
        
        // Wait a bit for database to commit the transaction
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      setProfileFormOpen(false);
      // Refresh both user detail and employee profile after creating/updating
      await fetchUserDetail();
      await fetchEmployeeProfile();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra';
      notify.error(errorMessage);
    } finally {
      setSubmittingProfile(false);
    }
  };

  const skillLevelOptions = [
    { value: SkillLevelEnum.INTERNSHIP, label: 'Thực tập (Internship)' },
    { value: SkillLevelEnum.FRESHER, label: 'Fresher' },
    { value: SkillLevelEnum.JUNIOR, label: 'Junior' },
    { value: SkillLevelEnum.MIDDLE, label: 'Middle' },
    { value: SkillLevelEnum.SENIOR, label: 'Senior' },
  ];

  return (
    <>
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1200}
      className="staff-detail-modal"
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
        <div className="min-h-[600px]">
          {/* Header with Background and Avatar */}
          <div className="relative -mx-6 -mt-6 mb-16">
            {/* Background Image */}
            <div className="relative w-full h-[380px] overflow-hidden" key={user.backgroundUrl || 'no-bg'}>
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
                  size={220}
                  src={user.avatarUrl || undefined}
                  icon={<UserOutlined className="text-[100px] text-white" />}
                  className="border-6 border-white shadow-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex-shrink-0"
                />
                <div className="pb-4 flex-1 min-w-0">
                  <Title 
                    level={1} 
                    className="!mb-2 !text-white !text-5xl !font-bold !leading-tight" 
                    style={{ textShadow: '3px 3px 8px rgba(0,0,0,0.7)' }}
                  >
                    {user.fullName || 'Chưa có tên'}
                  </Title>
                  <Text 
                    className="text-white text-2xl block mb-4 font-semibold" 
                    style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.7)' }}
                  >
                    {getRoleLabel(user.roleName)}
                  </Text>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="mt-28 space-y-6 px-6 pb-6">
            {/* User ID Section */}
            <Card size="small" className="bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <IdcardOutlined className="text-blue-600 text-3xl" />
                <Text strong className="text-2xl">Mã người dùng</Text>
              </div>
              <code className="text-xl bg-white px-5 py-4 rounded border border-gray-300 block w-full font-mono font-semibold">
                {user.userId}
              </code>
            </Card>

            {/* Contact Information */}
            <Card 
              title={<span className="text-2xl font-bold"><MailOutlined className="mr-3" />Thông tin liên hệ</span>} 
              className="shadow-sm border border-gray-200"
              styles={{ header: { fontSize: '24px', fontWeight: 'bold', padding: '20px 24px' } }}
            >
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
            </Card>

            {/* Employee Profile Section */}
            {loadingProfile ? (
              <Card className="shadow-sm">
                <div className="flex justify-center py-8">
                  <Spin />
                </div>
              </Card>
            ) : employeeProfile ? (
              <Card 
                title={
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold flex items-center gap-3">
                      <TrophyOutlined className="text-3xl" />
                      <span>Hồ sơ nhân viên</span>
                    </span>
                    <HasRole allow={RoleEnum.ADMIN}>
                      <div className="flex gap-2">
                        <Button 
                          type="primary" 
                          icon={<EditOutlined />}
                          onClick={() => handleOpenProfileForm(true)}
                        >
                          Sửa hồ sơ
                        </Button>
                        <Popconfirm
                          title="Xóa hồ sơ nhân viên"
                          description="Bạn có chắc chắn muốn xóa hồ sơ này không?"
                          onConfirm={handleDeleteProfile}
                          okText="Xóa"
                          cancelText="Hủy"
                        >
                          <Button 
                            danger 
                            icon={<DeleteOutlined />}
                          >
                            Xóa
                          </Button>
                        </Popconfirm>
                      </div>
                    </HasRole>
                  </div>
                } 
                className="shadow-sm border border-gray-200"
                styles={{ header: { fontSize: '24px', fontWeight: 'bold', padding: '20px 24px' } }}
              >
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Skill Level */}
                    <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <div className="flex items-center gap-4 mb-4">
                        <SafetyOutlined className="text-blue-600 text-3xl flex-shrink-0" />
                        <Text type="secondary" className="text-lg font-medium">Trình độ kỹ năng</Text>
                      </div>
                      <Text strong className="text-2xl">
                        {getSkillLevelLabel(employeeProfile.skillLevel)}
                      </Text>
                    </div>

                    {/* Performance Score */}
                    <div className="p-6 bg-green-50 rounded-lg border-2 border-green-200">
                      <div className="flex items-center gap-4 mb-4">
                        <StarOutlined className="text-green-600 text-3xl flex-shrink-0" />
                        <Text type="secondary" className="text-lg font-medium">Điểm hiệu suất</Text>
                      </div>
                      <Text strong className="text-2xl">
                        {employeeProfile.performanceScore !== null && employeeProfile.performanceScore !== undefined
                          ? `${employeeProfile.performanceScore.toFixed(2)}/10`
                          : '-'}
                      </Text>
                    </div>

                    {/* Hire Date */}
                    <div className="p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
                      <div className="flex items-center gap-4 mb-4">
                        <CalendarOutlined className="text-purple-600 text-3xl flex-shrink-0" />
                        <Text type="secondary" className="text-lg font-medium">Ngày tuyển dụng</Text>
                      </div>
                      <Text strong className="text-xl">
                        {formatDate(employeeProfile.hireDate)}
                      </Text>
                    </div>

                    {/* Salary Base */}
                    <div className="p-6 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                      <div className="flex items-center gap-4 mb-4">
                        <DollarOutlined className="text-yellow-600 text-3xl flex-shrink-0" />
                        <Text type="secondary" className="text-lg font-medium">Lương cơ bản</Text>
                      </div>
                      <Text strong className="text-xl">
                        {formatCurrency(employeeProfile.salaryBase)}
                      </Text>
                    </div>

                    {/* Emergency Contact */}
                    {employeeProfile.emergencyContact && (
                      <div className="p-6 bg-red-50 rounded-lg border-2 border-red-200">
                        <div className="flex items-center gap-4 mb-4">
                          <ContactsOutlined className="text-red-600 text-3xl flex-shrink-0" />
                          <Text type="secondary" className="text-lg font-medium">Liên hệ khẩn cấp</Text>
                        </div>
                        <Text strong className="text-xl">
                          {employeeProfile.emergencyContact}
                        </Text>
                      </div>
                    )}

                    {/* Position */}
                    {employeeProfile.position && (
                      <div className="p-6 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                        <div className="flex items-center gap-4 mb-4">
                          <IdcardOutlined className="text-indigo-600 text-3xl flex-shrink-0" />
                          <Text type="secondary" className="text-lg font-medium">Vị trí</Text>
                        </div>
                        <Text strong className="text-xl">
                          {employeeProfile.position}
                        </Text>
                      </div>
                    )}
                  </div>

                  {/* Certifications */}
                  {employeeProfile.certifications && employeeProfile.certifications.length > 0 && (
                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-4 mb-6">
                        <TrophyOutlined className="text-gray-600 text-3xl flex-shrink-0" />
                        <Text type="secondary" className="text-lg font-medium">Chứng chỉ</Text>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {employeeProfile.certifications.map((cert, index) => (
                          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <div className="relative">
                              <div className="w-full h-48 mb-3 rounded-lg overflow-hidden">
                                <Image
                                  src={cert.imageUrl}
                                  alt={cert.name}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  preview
                                />
                              </div>
                              <Text strong className="text-lg block text-center mt-2">{cert.name}</Text>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {employeeProfile.notes && (
                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-4 mb-4">
                        <FileTextOutlined className="text-gray-600 text-3xl flex-shrink-0" />
                        <Text type="secondary" className="text-lg font-medium">Ghi chú</Text>
                      </div>
                      <Text className="text-xl whitespace-pre-wrap">{employeeProfile.notes}</Text>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card 
                title={
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">Hồ sơ nhân viên</span>
                    <HasRole allow={RoleEnum.ADMIN}>
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={() => handleOpenProfileForm(false)}
                      >
                        Tạo hồ sơ
                      </Button>
                    </HasRole>
                  </div>
                } 
                className="shadow-sm border border-gray-200"
                styles={{ header: { fontSize: '24px', fontWeight: 'bold', padding: '20px 24px' } }}
              >
                <div className="text-center py-12 text-gray-500">
                  <UserOutlined className="text-6xl mb-4 block mx-auto opacity-50" />
                  <Text type="secondary" className="text-xl">Nhân viên này chưa có hồ sơ</Text>
                </div>
              </Card>
            )}

            {/* Account Information */}
            <Card 
              title={<span className="text-2xl font-bold"><SafetyOutlined className="mr-3" />Thông tin tài khoản</span>} 
              className="shadow-sm border border-gray-200"
              styles={{ header: { fontSize: '24px', fontWeight: 'bold', padding: '20px 24px' } }}
            >
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
            </Card>

            {/* Timestamps */}
            {(user.createdAt || user.updatedAt || employeeProfile?.createdAt) && (
              <Card 
                title={<span className="text-2xl font-bold">Thông tin hệ thống</span>} 
                className="shadow-sm border border-gray-200"
                styles={{ header: { fontSize: '24px', fontWeight: 'bold', padding: '20px 24px' } }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {user.createdAt && (
                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                      <Text type="secondary" className="text-lg block mb-3 font-medium">Ngày tạo tài khoản</Text>
                      <Text strong className="text-xl">
                        {new Date(user.createdAt).toLocaleString('vi-VN')}
                      </Text>
                    </div>
                  )}
                  {user.updatedAt && (
                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                      <Text type="secondary" className="text-lg block mb-3 font-medium">Ngày cập nhật tài khoản</Text>
                      <Text strong className="text-xl">
                        {new Date(user.updatedAt).toLocaleString('vi-VN')}
                      </Text>
                    </div>
                  )}
                  {employeeProfile?.createdAt && (
                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                      <Text type="secondary" className="text-lg block mb-3 font-medium">Ngày tạo hồ sơ</Text>
                      <Text strong className="text-xl">
                        {new Date(employeeProfile.createdAt).toLocaleString('vi-VN')}
                      </Text>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          Không tìm thấy thông tin người dùng
        </div>
      )}
    </Modal>

      {/* Employee Profile Form Modal */}
      <Modal
        open={profileFormOpen}
        onCancel={() => setProfileFormOpen(false)}
        onOk={handleProfileFormSubmit}
        okText={employeeProfile ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        title={<span className="text-2xl font-bold">{employeeProfile ? 'Chỉnh sửa hồ sơ nhân viên' : 'Tạo hồ sơ nhân viên'}</span>}
        width={800}
        confirmLoading={submittingProfile}
      >
        <div className="space-y-4 mt-6">
          <div>
            <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
              Trình độ kỹ năng <span className="text-red-500">*</span>
            </label>
            <Select
              value={profileFormData.skillLevel}
              onChange={(value) => setProfileFormData(prev => ({ ...prev, skillLevel: value as SkillLevelEnum }))}
              placeholder="-- Chọn trình độ --"
              className="w-full"
              size="large"
            >
              {skillLevelOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                Ngày tuyển dụng
              </label>
              <DatePicker
                value={profileFormData.hireDate}
                onChange={(date) => setProfileFormData(prev => ({ ...prev, hireDate: date }))}
                format="DD/MM/YYYY"
                className="w-full"
                size="large"
              />
            </div>

            <div>
              <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                Điểm hiệu suất (0-10)
              </label>
              <Input
                type="number"
                value={profileFormData.performanceScore}
                onChange={(e) => setProfileFormData(prev => ({ ...prev, performanceScore: e.target.value }))}
                min="0"
                max="10"
                step="0.01"
                placeholder="0.00 - 10.00"
                size="large"
              />
            </div>

            <div>
              <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                Lương cơ bản (VNĐ)
              </label>
              <Input
                type="number"
                value={profileFormData.salaryBase}
                onChange={(e) => setProfileFormData(prev => ({ ...prev, salaryBase: e.target.value }))}
                min="0"
                placeholder="0"
                size="large"
              />
            </div>

            <div>
              <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                Liên hệ khẩn cấp
              </label>
              <Input
                value={profileFormData.emergencyContact}
                onChange={(e) => setProfileFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                placeholder="Số điện thoại liên hệ khẩn cấp"
                size="large"
              />
            </div>

            <div>
              <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
                Vị trí
              </label>
              <Input
                value={profileFormData.position}
                onChange={(e) => setProfileFormData(prev => ({ ...prev, position: e.target.value }))}
                placeholder="Vị trí công việc (ví dụ: Kỹ thuật viên, Nhân viên tư vấn)"
                size="large"
              />
            </div>
          </div>

          <div>
            <label className="block text-[1.3rem] font-medium text-gray-700 mb-4">
              Chứng chỉ
            </label>
            <div className="space-y-4">
              {profileFormData.certifications.map((cert, index) => (
                <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <label className="block text-[1.2rem] font-medium text-gray-700 mb-2">
                        Tên chứng chỉ
                      </label>
                      <Input
                        value={cert.name}
                        onChange={(e) => {
                          const newCerts = [...profileFormData.certifications];
                          newCerts[index].name = e.target.value;
                          setProfileFormData(prev => ({ ...prev, certifications: newCerts }));
                        }}
                        placeholder="Nhập tên chứng chỉ"
                        size="large"
                      />
                    </div>
                    <Button
                      type="text"
                      danger
                      icon={<CloseOutlined />}
                      onClick={() => {
                        const newCerts = profileFormData.certifications.filter((_, i) => i !== index);
                        setProfileFormData(prev => ({ ...prev, certifications: newCerts }));
                      }}
                      className="mt-8"
                    />
                  </div>
                  <div className="mt-4">
                    <ImageUpload
                      value={cert.imageUrl}
                      onChange={(url) => {
                        const newCerts = [...profileFormData.certifications];
                        newCerts[index].imageUrl = url;
                        setProfileFormData(prev => ({ ...prev, certifications: newCerts }));
                      }}
                      label="Ảnh chứng chỉ"
                    />
                  </div>
                </div>
              ))}
              <Button
                type="dashed"
                onClick={() => {
                  setProfileFormData(prev => ({
                    ...prev,
                    certifications: [...prev.certifications, { name: '', imageUrl: '' }]
                  }));
                }}
                icon={<PlusOutlined />}
                className="w-full"
                size="large"
              >
                Thêm chứng chỉ
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-[1.3rem] font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <Input.TextArea
              value={profileFormData.notes}
              onChange={(e) => setProfileFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Ghi chú về nhân viên"
              rows={4}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

