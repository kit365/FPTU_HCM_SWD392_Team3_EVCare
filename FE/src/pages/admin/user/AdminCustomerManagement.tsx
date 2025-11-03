import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Pagination, Stack } from "@mui/material";
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { FormSearch } from "../../../components/admin/ui/FormSearch";
import { FormEmpty } from "../../../components/admin/ui/FormEmpty";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { userService } from '../../../service/userService';
import HasRole from '../../../components/common/HasRole';
import { RoleEnum } from '../../../constants/roleConstants';
import { UserDetailModal } from '../../../components/admin/user/UserDetailModal';
import { notify } from '../../../components/admin/common/Toast';
import type { UserResponse } from '../../../types/user.types';

interface TableColumn {
  title: string;
  width: number;
}

const columns: TableColumn[] = [
  { title: "STT", width: 4 },
  { title: "Ảnh đại diện", width: 8 },
  { title: "Họ và tên", width: 18 },
  { title: "Email", width: 22 },
  { title: "Số điện thoại", width: 13 },
  { title: "Nhà cung cấp", width: 9 },
  { title: "Trạng thái", width: 9 },
  { title: "Chi tiết", width: 17 },
];

export const AdminCustomerManagement = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<UserResponse[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [keyword, setKeyword] = useState<string>("");
  const pageSize = 10;

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getUsersByRole('CUSTOMER');
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error: any) {
      notify.error(error?.message || 'Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    // Filter customers based on search keyword
    if (keyword.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.fullName?.toLowerCase().includes(keyword.toLowerCase()) ||
        customer.email?.toLowerCase().includes(keyword.toLowerCase()) ||
        customer.userId?.toLowerCase().includes(keyword.toLowerCase()) ||
        customer.numberPhone?.includes(keyword)
      );
      setFilteredCustomers(filtered);
    }
    setCurrentPage(1); // Reset to first page on search
  }, [keyword, customers]);

  const handleSearch = useCallback((value: string) => {
    setKeyword(value);
  }, []);

  const handleViewDetail = (userId: string) => {
    setSelectedUserId(userId);
    setModalOpen(true);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const paginatedData = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Statistics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.isActive && !c.isDeleted).length;
  const googleCustomers = customers.filter(c => c.provider === 'GOOGLE').length;

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        {/* Header */}
        <CardHeaderAdmin title="Danh sách khách hàng" />

        <div className="px-[2.4rem] pb-[2.4rem] h-full">
          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[#f0f9ff] rounded-lg p-4 border border-[#bae6fd]">
              <div className="text-[#0369a1] text-[1.2rem] font-medium mb-1">
                Tổng số khách hàng
              </div>
              <div className="text-[#0c4a6e] text-[2.4rem] font-bold">
                {totalCustomers}
              </div>
            </div>
            <div className="bg-[#f0fdf4] rounded-lg p-4 border border-[#bbf7d0]">
              <div className="text-[#15803d] text-[1.2rem] font-medium mb-1">
                Khách hàng hoạt động
              </div>
              <div className="text-[#14532d] text-[2.4rem] font-bold">
                {activeCustomers}
              </div>
            </div>
            <div className="bg-[#fef2f2] rounded-lg p-4 border border-[#fecaca]">
              <div className="text-[#b91c1c] text-[1.2rem] font-medium mb-1">
                Đăng ký qua Google
              </div>
              <div className="text-[#7f1d1d] text-[2.4rem] font-bold">
                {googleCustomers}
              </div>
            </div>
          </div>

          {/* Search and Add Button */}
          <div className="flex justify-between items-center gap-4 mb-6">
            <div className="flex-1">
              <FormSearch onSearch={handleSearch} />
            </div>
            <HasRole allow={[RoleEnum.ADMIN, RoleEnum.STAFF]}>
              <button
                onClick={() => navigate('/admin/customers/create')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[1.3rem] font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                <AddIcon className="!text-[1.8rem]" />
                Thêm khách hàng
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
                    paginatedData.map((customer, index) => (
                      <tr
                        key={customer.userId}
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
                              src={customer.avatarUrl || undefined} 
                              icon={<UserOutlined className="text-lg" />} 
                              size={40}
                              className="bg-gradient-to-br from-blue-600 to-cyan-600"
                            />
                          </div>
                        </td>
                        <td className="p-[1.2rem]">
                          {customer.fullName || (
                            <span className="text-gray-400">Chưa có tên</span>
                          )}
                        </td>
                        <td className="p-[1.2rem]">{customer.email}</td>
                        <td className="p-[1.2rem]">
                          {customer.numberPhone || (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-[1.2rem]">
                          <span
                            className={`px-2 py-1 rounded-full text-[1.1rem] font-medium ${
                              customer.provider === 'GOOGLE'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {customer.provider || 'LOCAL'}
                          </span>
                        </td>
                        <td className="p-[1.2rem]">
                          <span
                            className={`px-2 py-1 rounded-full text-[1.1rem] font-medium ${
                              customer.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {customer.isActive ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                        <td className="p-[1.2rem] text-center flex justify-center gap-2">
                          <button
                            onClick={() => handleViewDetail(customer.userId)}
                            className="text-green-500 w-[2rem] h-[2rem] inline-block hover:opacity-80"
                            title="Xem chi tiết"
                          >
                            <RemoveRedEyeIcon className="!w-full !h-full" />
                          </button>
                          <HasRole allow={[RoleEnum.ADMIN, RoleEnum.STAFF]}>
                            <button
                              onClick={() => navigate(`/admin/customers/edit/${customer.userId}`)}
                              className="text-blue-500 w-[2rem] h-[2rem] inline-block hover:opacity-80"
                              title="Chỉnh sửa"
                            >
                              <EditIcon className="!w-full !h-full" />
                            </button>
                          </HasRole>
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

      {/* Detail Modal */}
      <UserDetailModal
        userId={selectedUserId}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedUserId(null);
        }}
      />
    </div>
  );
};
