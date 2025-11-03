import { useState, useEffect, useCallback } from 'react';
import { Card, Pagination, Stack, Modal, Button, Box } from "@mui/material";
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { FormSearch } from "../../../components/admin/ui/FormSearch";
import { FormEmpty } from "../../../components/admin/ui/FormEmpty";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { employeeProfileService } from '../../../service/employeeProfileService';
import { userService } from '../../../service/userService';
import { useNavigate } from 'react-router-dom';
import { notify } from '../../../components/admin/common/Toast';
import type { EmployeeProfileResponse } from '../../../types/employee-profile.types';
import type { UserResponse } from '../../../types/user.types';
import HasRole from '../../../components/common/HasRole';
import { RoleEnum } from '../../../constants/roleConstants';
import EmployeeProfileForm from './EmployeeProfileForm';

interface TableColumn {
  title: string;
  width: number;
}

const columns: TableColumn[] = [
  { title: "STT", width: 4 },
  { title: "Ảnh đại diện", width: 8 },
  { title: "Nhân viên", width: 18 },
  { title: "Email", width: 16 },
  { title: "Trình độ", width: 10 },
  { title: "Ngày tuyển dụng", width: 12 },
  { title: "Điểm hiệu suất", width: 10 },
  { title: "Trạng thái", width: 8 },
  { title: "Thao tác", width: 14 },
];

export const EmployeeProfileManagement = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<EmployeeProfileResponse[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<EmployeeProfileResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [keyword, setKeyword] = useState<string>("");
  const [selectedProfile, setSelectedProfile] = useState<EmployeeProfileResponse | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<EmployeeProfileResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [usersWithoutProfile, setUsersWithoutProfile] = useState<UserResponse[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const pageSize = 10;

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all employee profiles - TODO: Implement search API when backend is ready
      const response = await employeeProfileService.search({
        page: 0,
        size: 1000,
        keyword: '',
      });
      const data = response.data?.data || [];
      setProfiles(data);
      setFilteredProfiles(data);
      
      // After fetching profiles, fetch users without profile
      await fetchUsersWithoutProfile(data);
    } catch (error: any) {
      notify.error(error?.message || 'Không thể tải danh sách hồ sơ nhân viên');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsersWithoutProfile = useCallback(async (existingProfiles: EmployeeProfileResponse[]) => {
    try {
      const [staffData, techData] = await Promise.all([
        userService.getUsersByRole('STAFF'),
        userService.getTechnicians(),
      ]);
      const allStaffAndTech = [...staffData, ...techData];
      
      // Filter users that don't have employee profile yet
      const existingProfileUserIds = new Set(
        existingProfiles.map((p: EmployeeProfileResponse) => p.userId.userId)
      );
      
      const usersWithout = allStaffAndTech.filter(
        user => !existingProfileUserIds.has(user.userId) && !user.isDeleted && !user.isActive
      );
      setUsersWithoutProfile(usersWithout);
    } catch (error: any) {
      console.error('Error fetching users without profile:', error);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    // Filter profiles based on search keyword
    if (keyword.trim() === '') {
      setFilteredProfiles(profiles);
    } else {
      const filtered = profiles.filter(profile =>
        profile.userId?.fullName?.toLowerCase().includes(keyword.toLowerCase()) ||
        profile.userId?.email?.toLowerCase().includes(keyword.toLowerCase()) ||
        profile.certifications?.toLowerCase().includes(keyword.toLowerCase()) ||
        profile.emergencyContact?.includes(keyword)
      );
      setFilteredProfiles(filtered);
    }
    setCurrentPage(1);
  }, [keyword, profiles]);

  const handleCreate = () => {
    setSelectedProfile(null);
    setSelectedUserId(null);
    setFormModalOpen(true);
  };

  const handleEdit = (profile: EmployeeProfileResponse) => {
    setSelectedProfile(profile);
    setSelectedUserId(profile.userId.userId);
    setFormModalOpen(true);
  };

  const handleDeleteClick = (profile: EmployeeProfileResponse) => {
    setProfileToDelete(profile);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!profileToDelete) return;

    setDeleting(true);
    try {
      await employeeProfileService.remove(profileToDelete.employeeProfileId);
      notify.success('Xóa hồ sơ nhân viên thành công!');
      setDeleteModalOpen(false);
      setProfileToDelete(null);
      await fetchProfiles();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể xóa hồ sơ nhân viên này';
      notify.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    setFormModalOpen(false);
    setSelectedProfile(null);
    setSelectedUserId(null);
    fetchProfiles();
    fetchUsersWithoutProfile();
  };

  const handleFormCancel = () => {
    setFormModalOpen(false);
    setSelectedProfile(null);
    setSelectedUserId(null);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredProfiles.length / pageSize);
  const paginatedData = filteredProfiles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getSkillLevelLabel = (skillLevel?: string) => {
    const labels: Record<string, string> = {
      INTERNSHIP: 'Thực tập',
      FRESHER: 'Fresher',
      JUNIOR: 'Junior',
      MIDDLE: 'Middle',
      SENIOR: 'Senior',
    };
    return skillLevel ? labels[skillLevel] || skillLevel : '-';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        {/* Header */}
        <CardHeaderAdmin title="Quản lý hồ sơ nhân viên" />

        <div className="px-[2.4rem] pb-[2.4rem] h-full">
          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[#eff6ff] rounded-lg p-4 border border-[#bfdbfe]">
              <div className="text-[#1e40af] text-[1.2rem] font-medium mb-1">
                Tổng số hồ sơ
              </div>
              <div className="text-[#1e3a8a] text-[2.4rem] font-bold">
                {profiles.length}
              </div>
            </div>
            <div className="bg-[#f0fdf4] rounded-lg p-4 border border-[#bbf7d0]">
              <div className="text-[#15803d] text-[1.2rem] font-medium mb-1">
                Hồ sơ hoạt động
              </div>
              <div className="text-[#14532d] text-[2.4rem] font-bold">
                {profiles.filter(p => p.isActive && !p.isDeleted).length}
              </div>
            </div>
            <div className="bg-[#fef3c7] rounded-lg p-4 border border-[#fde68a]">
              <div className="text-[#92400e] text-[1.2rem] font-medium mb-1">
                Chưa có hồ sơ
              </div>
              <div className="text-[#78350f] text-[2.4rem] font-bold">
                {usersWithoutProfile.length}
              </div>
            </div>
          </div>

          {/* Search and Add Button */}
          <div className="flex justify-between items-center gap-4 mb-6">
            <div className="flex-1">
              <FormSearch onSearch={(value) => setKeyword(value)} />
            </div>
            <HasRole allow={RoleEnum.ADMIN}>
              <button
                onClick={handleCreate}
                disabled={usersWithoutProfile.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[1.3rem] font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
                title={usersWithoutProfile.length === 0 ? 'Không có nhân viên nào chưa có hồ sơ' : ''}
              >
                <AddIcon className="!text-[1.8rem]" />
                Thêm hồ sơ nhân viên
              </button>
            </HasRole>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Table */}
              <table className="w-full">
                <thead className="text-[#000000] text-[1.3rem] border-dashed bg-[#f4f6f9]">
                  <tr>
                    {columns.map((col, index) => (
                      <th
                        key={index}
                        className={`p-[1.2rem] font-[500] text-center
                          ${index === 0 ? "rounded-l-[8px]" : ""}
                          ${index === columns.length - 1 ? "rounded-r-[8px]" : ""}`}
                        style={{ width: `${col.width}%` }}
                      >
                        {col.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-[#2b2d3b] text-[1.3rem]">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((profile, index) => (
                      <tr
                        key={profile.employeeProfileId}
                        className={`border-b border-gray-200 text-center ${
                          index !== paginatedData.length - 1
                            ? "border-dashed"
                            : "border-none"
                        } ${index % 2 !== 0 ? "bg-transparent" : "bg-[#FBFBFD]"}`}
                      >
                        <td className="p-[1.2rem]">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="p-[1.2rem]">
                          <div className="flex justify-center">
                            <Avatar 
                              src={profile.userId?.avatarUrl || undefined} 
                              icon={<UserOutlined className="text-lg" />} 
                              size={40}
                              className="bg-gradient-to-br from-blue-600 to-cyan-600"
                            />
                          </div>
                        </td>
                        <td className="p-[1.2rem]">
                          {profile.userId?.fullName || (
                            <span className="text-gray-400">Chưa có tên</span>
                          )}
                        </td>
                        <td className="p-[1.2rem]">{profile.userId?.email || '-'}</td>
                        <td className="p-[1.2rem]">
                          <span className="px-2 py-1 rounded-full text-[1.1rem] font-medium bg-blue-100 text-blue-800">
                            {getSkillLevelLabel(profile.skillLevel)}
                          </span>
                        </td>
                        <td className="p-[1.2rem]">
                          {formatDate(profile.hireDate)}
                        </td>
                        <td className="p-[1.2rem]">
                          {profile.performanceScore !== null && profile.performanceScore !== undefined
                            ? profile.performanceScore.toFixed(2)
                            : '-'}
                        </td>
                        <td className="p-[1.2rem]">
                          <span
                            className={`px-2 py-1 rounded-full text-[1.1rem] font-medium ${
                              profile.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {profile.isActive ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                        <td className="p-[1.2rem] text-center">
                          <div className="flex justify-center gap-2 items-center">
                            <HasRole allow={RoleEnum.ADMIN}>
                              <>
                                <button
                                  onClick={() => handleEdit(profile)}
                                  className="text-blue-500 w-[2rem] h-[2rem] inline-flex items-center justify-center hover:opacity-80"
                                  title="Chỉnh sửa"
                                >
                                  <EditIcon className="!w-full !h-full" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(profile)}
                                  className="text-red-500 w-[2rem] h-[2rem] inline-flex items-center justify-center hover:opacity-80"
                                  title="Xóa"
                                >
                                  <DeleteIcon className="!w-full !h-full" />
                                </button>
                              </>
                            </HasRole>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <FormEmpty colspan={columns.length} />
                  )}
                </tbody>
              </table>

              {paginatedData.length > 0 && (
                <Stack spacing={2} className="mt-[2rem]">
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    color="primary"
                    onChange={(_, value) => setCurrentPage(value)}
                  />
                </Stack>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Create/Edit Form Modal */}
      <EmployeeProfileForm
        open={formModalOpen}
        profile={selectedProfile}
        userId={selectedUserId}
        usersWithoutProfile={usersWithoutProfile}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setProfileToDelete(null);
        }}
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <h2
            id="delete-modal-title"
            className="text-[2rem] font-bold mb-4 text-[#2b2d3b]"
          >
            Xác nhận xóa
          </h2>
          <p id="delete-modal-description" className="text-[1.4rem] text-[#666] mb-6">
            Bạn có chắc chắn muốn xóa hồ sơ nhân viên của{' '}
            <strong className="text-[#2b2d3b]">
              {profileToDelete?.userId?.fullName || profileToDelete?.userId?.email || 'người dùng này'}
            </strong>
            ?
          </p>
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => {
                setDeleteModalOpen(false);
                setProfileToDelete(null);
              }}
              variant="outlined"
              disabled={deleting}
              sx={{
                textTransform: 'none',
                fontSize: '1.3rem',
                px: 3,
                py: 1,
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              disabled={deleting}
              sx={{
                textTransform: 'none',
                fontSize: '1.3rem',
                px: 3,
                py: 1,
              }}
            >
              {deleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

