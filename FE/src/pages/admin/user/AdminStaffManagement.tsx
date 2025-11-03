import { useState, useEffect, useCallback } from 'react';
import { Card, Pagination, Stack, Tabs, Tab, Box } from "@mui/material";
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { FormSearch } from "../../../components/admin/ui/FormSearch";
import { FormEmpty } from "../../../components/admin/ui/FormEmpty";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Modal, Button } from "@mui/material";
import { userService } from '../../../service/userService';
import { useNavigate } from 'react-router-dom';
import { StaffDetailModal } from '../../../components/admin/user/StaffDetailModal';
import { notify } from '../../../components/admin/common/Toast';
import type { UserResponse } from '../../../types/user.types';
import HasRole from '../../../components/common/HasRole';
import { RoleEnum } from '../../../constants/roleConstants';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`staff-tabpanel-${index}`}
      aria-labelledby={`staff-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface TableColumn {
  title: string;
  width: number;
}

const columns: TableColumn[] = [
  { title: "STT", width: 4 },
  { title: "Ảnh đại diện", width: 8 },
  { title: "Họ và tên", width: 16 },
  { title: "Email", width: 20 },
  { title: "Số điện thoại", width: 12 },
  { title: "Nhà cung cấp", width: 8 },
  { title: "Trạng thái", width: 8 },
  { title: "Thao tác", width: 24 },
];

export const AdminStaffManagement = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [staff, setStaff] = useState<UserResponse[]>([]);
  const [technicians, setTechnicians] = useState<UserResponse[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<UserResponse[]>([]);
  const [filteredTechnicians, setFilteredTechnicians] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPageStaff, setCurrentPageStaff] = useState<number>(1);
  const [currentPageTech, setCurrentPageTech] = useState<number>(1);
  const [keywordStaff, setKeywordStaff] = useState<string>("");
  const [keywordTech, setKeywordTech] = useState<string>("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const pageSize = 10;

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [staffData, techData] = await Promise.all([
        userService.getUsersByRole('STAFF'),
        userService.getTechnicians(),
      ]);
      setStaff(staffData);
      setFilteredStaff(staffData);
      setTechnicians(techData);
      setFilteredTechnicians(techData);
    } catch (error: any) {
      notify.error(error?.message || 'Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    // Filter staff
    if (keywordStaff.trim() === '') {
      setFilteredStaff(staff);
    } else {
      const filtered = staff.filter(s =>
        s.fullName?.toLowerCase().includes(keywordStaff.toLowerCase()) ||
        s.email?.toLowerCase().includes(keywordStaff.toLowerCase()) ||
        s.userId?.toLowerCase().includes(keywordStaff.toLowerCase()) ||
        s.numberPhone?.includes(keywordStaff)
      );
      setFilteredStaff(filtered);
    }
    setCurrentPageStaff(1);
  }, [keywordStaff, staff]);

  useEffect(() => {
    // Filter technicians
    if (keywordTech.trim() === '') {
      setFilteredTechnicians(technicians);
    } else {
      const filtered = technicians.filter(t =>
        t.fullName?.toLowerCase().includes(keywordTech.toLowerCase()) ||
        t.email?.toLowerCase().includes(keywordTech.toLowerCase()) ||
        t.userId?.toLowerCase().includes(keywordTech.toLowerCase()) ||
        t.numberPhone?.includes(keywordTech)
      );
      setFilteredTechnicians(filtered);
    }
    setCurrentPageTech(1);
  }, [keywordTech, technicians]);

  const handleViewDetail = (userId: string) => {
    setSelectedUserId(userId);
    setModalOpen(true);
  };

  const handleEdit = (userId: string) => {
    navigate(`/admin/users/edit/${userId}`);
  };

  const handleDeleteClick = (user: UserResponse) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    try {
      await userService.remove(userToDelete.userId);
      notify.success('Xóa nhân viên/kỹ thuật viên thành công!');
      setDeleteModalOpen(false);
      setUserToDelete(null);
      // Refresh data
      await fetchAllData();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể xóa nhân viên/kỹ thuật viên này';
      notify.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Staff pagination
  const totalPagesStaff = Math.ceil(filteredStaff.length / pageSize);
  const paginatedStaff = filteredStaff.slice(
    (currentPageStaff - 1) * pageSize,
    currentPageStaff * pageSize
  );

  // Technician pagination
  const totalPagesTech = Math.ceil(filteredTechnicians.length / pageSize);
  const paginatedTech = filteredTechnicians.slice(
    (currentPageTech - 1) * pageSize,
    currentPageTech * pageSize
  );

  const renderTable = (
    data: UserResponse[],
    currentPage: number,
    isLoading: boolean
  ) => (
    <>
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
          {data.length > 0 ? (
            data.map((user, index) => (
              <tr
                key={user.userId}
                className={`border-b border-gray-200 text-center ${index !== data.length - 1
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
                      src={user.avatarUrl || undefined} 
                      icon={<UserOutlined className="text-lg" />} 
                      size={40}
                      className="bg-gradient-to-br from-blue-600 to-cyan-600"
                    />
                  </div>
                </td>
                <td className="p-[1.2rem]">
                  {user.fullName || (
                    <span className="text-gray-400">Chưa có tên</span>
                  )}
                </td>
                <td className="p-[1.2rem]">{user.email}</td>
                <td className="p-[1.2rem]">
                  {user.numberPhone || (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="p-[1.2rem]">
                  <span
                    className={`px-2 py-1 rounded-full text-[1.1rem] font-medium ${user.provider === 'GOOGLE'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    {user.provider || 'LOCAL'}
                  </span>
                </td>
                <td className="p-[1.2rem]">
                  <span
                    className={`px-2 py-1 rounded-full text-[1.1rem] font-medium ${user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </td>
                <td className="p-[1.2rem] text-center">
                  <div className="flex justify-center gap-2 items-center">
                    <button
                      onClick={() => handleViewDetail(user.userId)}
                      className="text-green-500 w-[2rem] h-[2rem] inline-flex items-center justify-center hover:opacity-80"
                      title="Xem chi tiết"
                    >
                      <RemoveRedEyeIcon className="!w-full !h-full" />
                    </button>
                    <HasRole allow={RoleEnum.ADMIN}>
                      <>
                        <button
                          onClick={() => handleEdit(user.userId)}
                          className="text-blue-500 w-[2rem] h-[2rem] inline-flex items-center justify-center hover:opacity-80"
                          title="Chỉnh sửa"
                        >
                          <EditIcon className="!w-full !h-full" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
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
    </>
  );

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        {/* Header */}
        <CardHeaderAdmin title="Quản lý nhân viên & kĩ thuật viên" />

        <div className="px-[2.4rem] pb-[2.4rem] h-full">
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="staff tabs">
              <Tab label="Nhân viên" id="staff-tab-0" aria-controls="staff-tabpanel-0" />
              <Tab label="Kĩ thuật viên" id="staff-tab-1" aria-controls="staff-tabpanel-1" />
            </Tabs>
          </Box>

          {/* Staff Tab */}
          <TabPanel value={tabValue} index={0}>
            {/* Staff Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#eff6ff] rounded-lg p-4 border border-[#bfdbfe]">
                <div className="text-[#1e40af] text-[1.2rem] font-medium mb-1">
                  Tổng số nhân viên
                </div>
                <div className="text-[#1e3a8a] text-[2.4rem] font-bold">
                  {staff.length}
                </div>
              </div>
              <div className="bg-[#f0fdf4] rounded-lg p-4 border border-[#bbf7d0]">
                <div className="text-[#15803d] text-[1.2rem] font-medium mb-1">
                  Nhân viên hoạt động
                </div>
                <div className="text-[#14532d] text-[2.4rem] font-bold">
                  {staff.filter(s => s.isActive && !s.isDeleted).length}
                </div>
              </div>
            </div>

            {/* Search and Add Button */}
            <div className="flex justify-between items-center gap-4 mb-6">
              <div className="flex-1">
                <FormSearch onSearch={(value) => setKeywordStaff(value)} />
              </div>
              <HasRole allow={RoleEnum.ADMIN}>
                <button
                  onClick={() => navigate('/admin/users/create')}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[1.3rem] font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  <AddIcon className="!text-[1.8rem]" />
                  Thêm nhân viên
                </button>
              </HasRole>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {renderTable(paginatedStaff, currentPageStaff, loading)}
                {paginatedStaff.length > 0 && (
                  <Stack spacing={2} className="mt-[2rem]">
                    <Pagination
                      count={totalPagesStaff}
                      page={currentPageStaff}
                      color="primary"
                      onChange={(_, value) => setCurrentPageStaff(value)}
                    />
                  </Stack>
                )}
              </>
            )}
          </TabPanel>

          {/* Technician Tab */}
          <TabPanel value={tabValue} index={1}>
            {/* Technician Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#f0fdf4] rounded-lg p-4 border border-[#86efac]">
                <div className="text-[#16a34a] text-[1.2rem] font-medium mb-1">
                  Tổng số kĩ thuật viên
                </div>
                <div className="text-[#14532d] text-[2.4rem] font-bold">
                  {technicians.length}
                </div>
              </div>
              <div className="bg-[#f0fdf4] rounded-lg p-4 border border-[#bbf7d0]">
                <div className="text-[#15803d] text-[1.2rem] font-medium mb-1">
                  Kỹ thuật viên hoạt động
                </div>
                <div className="text-[#14532d] text-[2.4rem] font-bold">
                  {technicians.filter(t => t.isActive && !t.isDeleted).length}
                </div>
              </div>
            </div>

            {/* Search and Add Button */}
            <div className="flex justify-between items-center gap-4 mb-6">
              <div className="flex-1">
                <FormSearch onSearch={(value) => setKeywordTech(value)} />
              </div>
              <HasRole allow={RoleEnum.ADMIN}>
                <button
                  onClick={() => navigate('/admin/users/create')}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[1.3rem] font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  <AddIcon className="!text-[1.8rem]" />
                  Thêm kỹ thuật viên
                </button>
              </HasRole>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {renderTable(paginatedTech, currentPageTech, loading)}
                {paginatedTech.length > 0 && (
                  <Stack spacing={2} className="mt-[2rem]">
                    <Pagination
                      count={totalPagesTech}
                      page={currentPageTech}
                      color="primary"
                      onChange={(_, value) => setCurrentPageTech(value)}
                    />
                  </Stack>
                )}
              </>
            )}
          </TabPanel>
        </div>
      </Card>

      {/* Detail Modal */}
      <StaffDetailModal
        userId={selectedUserId}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedUserId(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={handleDeleteCancel}
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
            Bạn có chắc chắn muốn xóa{' '}
            <strong className="text-[#2b2d3b]">
              {userToDelete?.fullName || userToDelete?.email || 'người dùng này'}
            </strong>
            ?<br />
            <span className="text-[1.2rem] text-[#999] mt-2 block">
              Lưu ý: Chỉ có thể xóa khi người dùng không được phân công ở bất kỳ appointment nào, 
              hoặc các appointment được phân công phải ở trạng thái PENDING hoặc COMPLETED.
            </span>
          </p>
          <div className="flex justify-end gap-3">
            <Button
              onClick={handleDeleteCancel}
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
