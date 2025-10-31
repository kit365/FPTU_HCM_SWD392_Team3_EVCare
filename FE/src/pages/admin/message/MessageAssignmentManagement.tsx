import { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Select, 
  Input, 
  Tag, 
  Tooltip,
  Space,
  Spin,
  Card
} from 'antd';
import { 
  UserAddOutlined, 
  SwapOutlined, 
  DeleteOutlined,
  MessageOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';
import { messageAssignmentService } from '../../../service/messageAssignmentService';
import { userService } from '../../../service/userService';
import { notify } from '../../../components/admin/common/Toast';
import { useAuthContext } from '../../../context/useAuthContext';
import type { MessageAssignmentResponse } from '../../../types/message.types';
import type { UserResponse } from '../../../types/user.types';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;

export const MessageAssignmentManagement = () => {
  const { user } = useAuthContext();
  const [assignments, setAssignments] = useState<MessageAssignmentResponse[]>([]);
  const [unassignedCustomers, setUnassignedCustomers] = useState<UserResponse[]>([]);
  const [staffList, setStaffList] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isReassignModalVisible, setIsReassignModalVisible] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<MessageAssignmentResponse | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10, total: 0 });

  useEffect(() => {
    loadAssignments();
    loadUnassignedCustomers();
    loadStaffList();
  }, [pagination.page, pagination.pageSize]);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const response = await messageAssignmentService.getAllAssignments(
        pagination.page,
        pagination.pageSize
      );
      if (response?.data?.success) {
        setAssignments(response.data.data.data);
        setPagination(prev => ({ ...prev, total: response.data.data.totalElements }));
      }
    } catch (error: any) {
      notify.error('Không thể tải danh sách phân công');
    } finally {
      setLoading(false);
    }
  };

  const loadUnassignedCustomers = async () => {
    try {
      const response = await messageAssignmentService.getUnassignedCustomers(0, 100);
      if (response?.data?.success) {
        setUnassignedCustomers(response.data.data.data);
      }
    } catch (error: any) {
      console.error('Error loading unassigned customers:', error);
    }
  };

  const loadStaffList = async () => {
    setStaffLoading(true);
    try {
      const staffUsers = await userService.getUsersByRole('STAFF');
      console.log('📋 Staff list loaded:', staffUsers);
      const activeStaff = staffUsers.filter((u) => u.isActive);
      console.log('✅ Active staff:', activeStaff);
      setStaffList(activeStaff);
    } catch (error: any) {
      console.error('❌ Error loading staff list:', error);
      notify.error('Không thể tải danh sách staff');
    } finally {
      setStaffLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedCustomerId || !selectedStaffId || !user?.userId) {
      notify.error('Vui lòng chọn customer và staff');
      return;
    }

    setLoading(true);
    try {
      await messageAssignmentService.assignCustomerToStaff(
        {
          customerId: selectedCustomerId,
          staffId: selectedStaffId,
          notes,
        },
        user.userId
      );
      notify.success('Phân công thành công!');
      setIsModalVisible(false);
      resetForm();
      loadAssignments();
      loadUnassignedCustomers();
    } catch (error: any) {
      notify.error(error?.response?.data?.message || 'Phân công thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleReassign = async () => {
    if (!selectedAssignment || !selectedStaffId || !user?.userId) {
      notify.error('Vui lòng chọn staff mới');
      return;
    }

    setLoading(true);
    try {
      await messageAssignmentService.reassignCustomer(
        selectedAssignment.customerId,
        selectedStaffId,
        user.userId
      );
      notify.success('Chuyển phân công thành công!');
      setIsReassignModalVisible(false);
      setSelectedAssignment(null);
      setSelectedStaffId('');
      loadAssignments();
    } catch (error: any) {
      notify.error(error?.response?.data?.message || 'Chuyển phân công thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (assignmentId: string) => {
    if (!user?.userId) return;

    Modal.confirm({
      title: 'Xác nhận hủy phân công',
      content: 'Bạn có chắc chắn muốn hủy phân công này?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        setLoading(true);
        try {
          await messageAssignmentService.deactivateAssignment(assignmentId, user.userId);
          notify.success('Hủy phân công thành công!');
          loadAssignments();
          loadUnassignedCustomers();
        } catch (error: any) {
          notify.error(error?.response?.data?.message || 'Hủy phân công thất bại');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const resetForm = () => {
    setSelectedCustomerId('');
    setSelectedStaffId('');
    setNotes('');
  };

  const columns: ColumnsType<MessageAssignmentResponse> = [
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (name: string, record) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900">{name}</div>
            <div className="text-sm text-gray-500">{record.customerEmail}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Staff phụ trách',
      dataIndex: 'assignedStaffName',
      key: 'assignedStaffName',
      render: (name: string, record) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900">{name}</div>
            <div className="text-sm text-gray-500">{record.assignedStaffEmail}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tin nhắn chưa đọc',
      dataIndex: 'unreadMessageCount',
      key: 'unreadMessageCount',
      width: 150,
      align: 'center',
      render: (count: number) => (
        <Tag color={count > 0 ? 'red' : 'default'} className="text-sm font-medium">
          <MessageOutlined /> {count || 0}
        </Tag>
      ),
    },
    {
      title: 'Tin nhắn gần nhất',
      dataIndex: 'lastMessageAt',
      key: 'lastMessageAt',
      width: 180,
      render: (date: string) => (
        date ? (
          <div className="flex items-center text-gray-600">
            <ClockCircleOutlined className="mr-2" />
            <span>{new Date(date).toLocaleString('vi-VN')}</span>
          </div>
        ) : (
          <span className="text-gray-400">Chưa có tin nhắn</span>
        )
      ),
    },
    {
      title: 'Phân công bởi',
      dataIndex: 'assignedByName',
      key: 'assignedByName',
      width: 150,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      align: 'center',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Chuyển phân công">
            <Button
              type="text"
              icon={<SwapOutlined />}
              onClick={() => {
                setSelectedAssignment(record);
                setIsReassignModalVisible(true);
              }}
              className="text-blue-500 hover:text-blue-700"
            />
          </Tooltip>
          <Tooltip title="Hủy phân công">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeactivate(record.assignmentId)}
              className="hover:text-red-700"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <Card className="shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý phân công chat</h1>
            <p className="text-gray-500 mt-1">Phân công staff phụ trách chat với customer</p>
          </div>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setIsModalVisible(true)}
            size="large"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Phân công mới
          </Button>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{assignments.length}</div>
            <div className="text-gray-500 mt-1">Tổng phân công</div>
          </div>
        </Card>
        <Card className="shadow-sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{unassignedCustomers.length}</div>
            <div className="text-gray-500 mt-1">Customer chưa phân công</div>
          </div>
        </Card>
        <Card className="shadow-sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{staffList.length}</div>
            <div className="text-gray-500 mt-1">Staff khả dụng</div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={assignments}
          rowKey="assignmentId"
          loading={loading}
          pagination={{
            current: pagination.page + 1,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, page: page - 1, pageSize });
            },
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} phân công`,
          }}
          className="custom-table"
        />
      </Card>

      {/* Modal phân công mới */}
      <Modal
        title={<div className="text-xl font-bold">Phân công chat mới</div>}
        open={isModalVisible}
        onOk={handleAssign}
        onCancel={() => {
          setIsModalVisible(false);
          resetForm();
        }}
        okText="Phân công"
        cancelText="Hủy"
        confirmLoading={loading}
        width={600}
      >
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer <span className="text-red-500">*</span>
            </label>
            <Select
              showSearch
              placeholder="Chọn customer"
              value={selectedCustomerId}
              onChange={setSelectedCustomerId}
              className="w-full"
              size="large"
              filterOption={(input, option) =>
                (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {unassignedCustomers.map((customer) => (
                <Option key={customer.userId} value={customer.userId}>
                  {customer.fullName} ({customer.email})
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Staff phụ trách <span className="text-red-500">*</span>
            </label>
            <Select
              showSearch
              placeholder="Chọn staff"
              value={selectedStaffId}
              onChange={setSelectedStaffId}
              className="w-full"
              size="large"
              loading={staffLoading}
              notFoundContent={staffLoading ? <Spin size="small" /> : 'Không có staff khả dụng'}
              filterOption={(input, option) =>
                (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {staffList.map((staff) => (
                <Option key={staff.userId} value={staff.userId}>
                  {staff.fullName} ({staff.email})
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
            <Input.TextArea
              placeholder="Ghi chú về phân công (không bắt buộc)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              size="large"
            />
          </div>
        </div>
      </Modal>

      {/* Modal chuyển phân công */}
      <Modal
        title={<div className="text-xl font-bold">Chuyển phân công</div>}
        open={isReassignModalVisible}
        onOk={handleReassign}
        onCancel={() => {
          setIsReassignModalVisible(false);
          setSelectedAssignment(null);
          setSelectedStaffId('');
        }}
        okText="Xác nhận chuyển"
        cancelText="Hủy"
        confirmLoading={loading}
        width={600}
      >
        {selectedAssignment && (
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Customer:</p>
              <p className="text-lg font-semibold text-gray-900">{selectedAssignment.customerName}</p>
              <p className="text-sm text-gray-500 mt-1">Hiện tại: {selectedAssignment.assignedStaffName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chuyển sang staff <span className="text-red-500">*</span>
              </label>
              <Select
                showSearch
                placeholder="Chọn staff mới"
                value={selectedStaffId}
                onChange={setSelectedStaffId}
                className="w-full"
                size="large"
                loading={staffLoading}
                notFoundContent={staffLoading ? <Spin size="small" /> : 'Không có staff khả dụng'}
                filterOption={(input, option) =>
                  (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {staffList
                  .filter((staff) => staff.userId !== selectedAssignment.assignedStaffId)
                  .map((staff) => (
                    <Option key={staff.userId} value={staff.userId}>
                      {staff.fullName} ({staff.email})
                    </Option>
                  ))}
              </Select>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .custom-table .ant-table-thead > tr > th {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
        }
        
        .custom-table .ant-table-tbody > tr:hover {
          background: #f9fafb;
          transition: all 0.2s ease;
        }
        
        .ant-modal-header {
          border-bottom: 2px solid #e5e7eb;
        }
      `}</style>
    </div>
  );
};

export default MessageAssignmentManagement;

