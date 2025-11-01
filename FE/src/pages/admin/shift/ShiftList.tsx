import { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Pagination, 
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@mui/material";
import { Plus } from 'iconoir-react';
import ViewListIcon from '@mui/icons-material/ViewList';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import { useNavigate } from 'react-router-dom';
import { pathAdmin } from "../../../constants/paths.constant";
import { TableAdmin } from "../../../components/admin/ui/Table";
import { useShift } from "../../../hooks/useShift";

import type { ShiftResponse } from '../../../types/shift.types';
import { FormSearch } from '../../../components/admin/ui/FormSearch';

type ViewMode = 'list' | 'calendar';

const ShiftList = () => {
  const navigate = useNavigate();
  const { list, loading, totalPages, search, updateStatus, shiftTypes, shiftStatuses, getAllTypes, getAllStatuses } = useShift();
  
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [shiftTypeFilter, setShiftTypeFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ShiftResponse | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const pageSize = 10;

  // Load enums
  useEffect(() => {
    getAllTypes();
    getAllStatuses();
  }, [getAllTypes, getAllStatuses]);

  // Load data
  const loadData = useCallback(async () => {
    await search({ 
      keyword: keyword.trim() || undefined, 
      page: currentPage - 1, 
      pageSize,
      status: statusFilter || undefined,
      shiftType: shiftTypeFilter || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined
    });
  }, [keyword, statusFilter, shiftTypeFilter, fromDate, toDate, currentPage, pageSize, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Table headers
  const headers = [
    { key: 'stt', label: 'STT' },
    { key: 'appointmentInfo', label: 'Thông tin cuộc hẹn' },
    { key: 'shiftType', label: 'Loại ca' },
    { key: 'startTime', label: 'Thời gian bắt đầu' },
    { key: 'endTime', label: 'Thời gian kết thúc' },
    { key: 'status', label: 'Trạng thái' },
    { key: 'totalHours', label: 'Tổng giờ' },
    { key: 'actions', label: 'Hành động' },
  ];

  // Format shift type to Vietnamese
  const formatShiftType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'APPOINTMENT': 'Theo lịch hẹn',
      'ON_DUTY': 'Trực',
      'INVENTORY_CHECK': 'Kiểm kê',
      'OTHER': 'Khác'
    };
    return typeMap[type] || type;
  };

  // Format status to Vietnamese
  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'PENDING_ASSIGNMENT': 'Chờ phân công',
      'LATE_ASSIGNMENT': 'Quá giờ chưa phân công',
      'SCHEDULED': 'Đã lên lịch',
      'IN_PROGRESS': 'Đang thực hiện',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  // Format datetime
  const formatDateTime = (dateTimeStr: string | null | undefined) => {
    if (!dateTimeStr) return 'N/A';
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  // Prepare data for table
  const dataWithIndex = list.map((shift: ShiftResponse, index: number) => {
    const originalStatus = shift.status; // Giữ status gốc để check logic
    
    // DEBUG: Log status để check
    console.log('🔍 Shift:', shift.shiftId, 'Status:', originalStatus, 'Can assign:', 
      originalStatus === 'PENDING_ASSIGNMENT' || originalStatus === 'LATE_ASSIGNMENT');
    
    return {
      ...shift,
      id: shift.shiftId, // Add id field for TableAdmin compatibility
      stt: (currentPage - 1) * pageSize + index + 1,
      appointmentInfo: shift.appointment ? 
        `${shift.appointment.customerFullName || 'N/A'} - ${shift.appointment.vehicleNumberPlate || 'N/A'}` : 
        'N/A',
      shiftType: formatShiftType(shift.shiftType),
      startTime: formatDateTime(shift.startTime),
      endTime: formatDateTime(shift.endTime),
      status: formatStatus(shift.status), // Formatted for display
      totalHours: shift.totalHours ? `${shift.totalHours}h` : 'N/A',
      // Add custom actions column với logic check status gốc
      // ALWAYS show div, button is conditional
      actions: (
        <div className="flex gap-[0.8rem]" onClick={(e) => e.stopPropagation()}>
          {(originalStatus === 'PENDING_ASSIGNMENT' || originalStatus === 'LATE_ASSIGNMENT') ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAssign(shift.shiftId);
              }}
              className="px-[1.2rem] py-[0.6rem] text-[1.2rem] font-[500] text-white bg-amber-500 rounded-[0.4rem] hover:bg-amber-600 transition-colors"
            >
              Phân công
            </button>
          ) : originalStatus === 'SCHEDULED' ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenStatusDialog(shift);
              }}
              className="px-[1.2rem] py-[0.6rem] text-[1.2rem] font-[500] text-white bg-blue-600 rounded-[0.4rem] hover:bg-blue-700 transition-colors"
            >
              Bắt đầu
            </button>
          ) : (
            <span className="text-[1.2rem] text-gray-400">-</span>
          )}
        </div>
      ),
    };
  });

  // Handle search
  const handleSearch = (searchValue: string) => {
    setKeyword(searchValue);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  // Handle assign
  const handleAssign = (shiftId: string) => {
    navigate(`/${pathAdmin}/shift/assign/${shiftId}`);
  };

  // Handle open status dialog (for "Bắt đầu" button)
  const handleOpenStatusDialog = (shift: ShiftResponse) => {
    if (shift.status === 'SCHEDULED') {
      setSelectedShift(shift);
      setNewStatus('IN_PROGRESS');
      setOpenStatusDialog(true);
    }
  };

  // Handle close status dialog
  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setSelectedShift(null);
    setNewStatus('');
  };

  // Handle update status
  const handleUpdateStatus = async () => {
    if (!selectedShift || !newStatus) return;

    const success = await updateStatus(selectedShift.shiftId, newStatus);
    if (success) {
      handleCloseStatusDialog();
      loadData(); // Reload list
    }
  };

  // Handle manual create (with warning)
  const handleManualCreate = () => {
    const confirmed = window.confirm(
      "⚠️ CẢNH BÁO - TẠO CA LÀM THỦ CÔNG\n\n" +
      "Thông thường, ca làm việc sẽ TỰ ĐỘNG TẠO khi có lịch hẹn.\n\n" +
      "Chỉ nên tạo thủ công trong các trường hợp:\n" +
      "✓ Lỗi hệ thống (auto-create thất bại)\n" +
      "✓ Shift không liên quan lịch hẹn (ca trực, kiểm kê, bảo trì,...)\n" +
      "✓ Bù ca làm cho appointment cũ (không có shift)\n\n" +
      "Bạn có chắc muốn tạo ca làm thủ công?"
    );

    if (confirmed) {
      navigate(`/${pathAdmin}/shift/create`);
    }
  };

  // Render calendar view
  const renderCalendarView = () => {
    // Group shifts by date
    const shiftsByDate: { [key: string]: ShiftResponse[] } = {};
    list.forEach((shift) => {
      const date = new Date(shift.startTime).toLocaleDateString('vi-VN');
      if (!shiftsByDate[date]) {
        shiftsByDate[date] = [];
      }
      shiftsByDate[date].push(shift);
    });

    const sortedDates = Object.keys(shiftsByDate).sort((a, b) => {
      const dateA = new Date(a.split('/').reverse().join('-'));
      const dateB = new Date(b.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });

    return (
      <div className="space-y-[2.4rem]">
        {sortedDates.length === 0 ? (
          <div className="text-center py-24 px-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-[1.2rem] border-2 border-dashed border-gray-300">
            <p className="text-[2rem] text-gray-700 font-[600] mb-3">
              Chưa có ca làm việc nào
            </p>
            <p className="text-[1.4rem] text-gray-500 max-w-[500px] mx-auto leading-relaxed">
              Ca làm việc sẽ tự động được tạo khi khách hàng đặt lịch hẹn mới
            </p>
          </div>
        ) : (
          sortedDates.map((date) => {
            const shifts = shiftsByDate[date];
            const stats = {
              pending: shifts.filter(s => s.status === 'PENDING_ASSIGNMENT' || s.status === 'LATE_ASSIGNMENT').length,
              scheduled: shifts.filter(s => s.status === 'SCHEDULED').length,
              inProgress: shifts.filter(s => s.status === 'IN_PROGRESS').length,
              completed: shifts.filter(s => s.status === 'COMPLETED').length,
            };

            return (
              <div key={date} className="bg-white rounded-[1.2rem] shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                {/* Date Header with Stats */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-[2.4rem] py-[2rem]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[1.8rem] font-[600] text-white mb-[0.4rem]">{date}</h3>
                      <p className="text-[1.3rem] text-blue-100">{shifts.length} ca làm việc</p>
                    </div>
                    {/* Quick Stats Pills */}
                    <div className="flex gap-[1rem]">
                      {stats.pending > 0 && (
                        <div className="bg-amber-500/20 backdrop-blur-sm px-[1.4rem] py-[0.6rem] rounded-[0.8rem] border border-amber-300/30">
                          <span className="text-[1.2rem] text-white font-[600]">Chờ: {stats.pending}</span>
                        </div>
                      )}
                      {stats.scheduled > 0 && (
                        <div className="bg-white/20 backdrop-blur-sm px-[1.4rem] py-[0.6rem] rounded-[0.8rem] border border-white/30">
                          <span className="text-[1.2rem] text-white font-[600]">Đã lên lịch: {stats.scheduled}</span>
                        </div>
                      )}
                      {stats.inProgress > 0 && (
                        <div className="bg-cyan-500/20 backdrop-blur-sm px-[1.4rem] py-[0.6rem] rounded-[0.8rem] border border-cyan-300/30">
                          <span className="text-[1.2rem] text-white font-[600]">Đang làm: {stats.inProgress}</span>
                        </div>
                      )}
                      {stats.completed > 0 && (
                        <div className="bg-green-500/20 backdrop-blur-sm px-[1.4rem] py-[0.6rem] rounded-[0.8rem] border border-green-300/30">
                          <span className="text-[1.2rem] text-white font-[600]">Hoàn thành: {stats.completed}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shifts List */}
                <div className="p-[2rem]">
                  <div className="space-y-[1.4rem]">
                    {shifts.map((shift) => {
                      const borderColor = 
                        shift.status === 'COMPLETED' ? 'border-l-green-500' :
                        shift.status === 'IN_PROGRESS' ? 'border-l-blue-500' :
                        shift.status === 'SCHEDULED' ? 'border-l-gray-400' :
                        shift.status === 'PENDING_ASSIGNMENT' ? 'border-l-amber-500' :
                        'border-l-red-500';
                      
                      const bgColor =
                        shift.status === 'COMPLETED' ? 'bg-green-50/40' :
                        shift.status === 'IN_PROGRESS' ? 'bg-blue-50/40' :
                        shift.status === 'SCHEDULED' ? 'bg-gray-50/40' :
                        shift.status === 'PENDING_ASSIGNMENT' ? 'bg-amber-50/40' :
                        'bg-red-50/40';

                      return (
                        <div
                          key={shift.shiftId}
                          className={`group relative border-l-[5px] ${borderColor} ${bgColor} rounded-[0.8rem] p-[2rem] hover:shadow-md transition-all duration-200 cursor-pointer`}
                          onClick={() => navigate(`/${pathAdmin}/shift/view/${shift.shiftId}`)}
                        >
                          <div className="flex items-start justify-between gap-[2rem]">
                            {/* Left: Info */}
                            <div className="flex-1 space-y-[1.2rem]">
                              {/* Time Range */}
                              <div className="flex items-center gap-[1.2rem]">
                                <div className="flex items-center gap-[0.8rem]">
                                  <span className="text-[1.5rem] font-[700] text-gray-800">
                                    {formatDateTime(shift.startTime)}
                                  </span>
                                  <span className="text-[1.4rem] text-gray-400 font-[600]">→</span>
                                  <span className="text-[1.5rem] font-[700] text-gray-800">
                                    {formatDateTime(shift.endTime)}
                                  </span>
                                </div>
                                <div className="px-[1.2rem] py-[0.4rem] bg-blue-100 text-blue-700 rounded-[0.6rem] text-[1.2rem] font-[600]">
                                  {shift.totalHours ? `${shift.totalHours}h` : 'N/A'}
                                </div>
                              </div>

                              {/* Customer & Vehicle */}
                              <div className="flex items-center gap-[1.6rem] text-[1.3rem]">
                                <div className="flex items-center gap-[0.6rem]">
                                  <span className="font-[600] text-gray-700">Khách hàng:</span>
                                  <span className="text-gray-900 font-[500]">
                                    {shift.appointment?.customerFullName || 'N/A'}
                                  </span>
                                </div>
                                <div className="h-[1.6rem] w-[1px] bg-gray-300"></div>
                                <div className="flex items-center gap-[0.6rem]">
                                  <span className="font-[600] text-gray-700">Biển số:</span>
                                  <span className="text-gray-900 font-[500] bg-gray-100 px-[0.8rem] py-[0.2rem] rounded-[0.4rem]">
                                    {shift.appointment?.vehicleNumberPlate || 'N/A'}
                                  </span>
                                </div>
                              </div>

                              {/* Staff Info */}
                              {(shift.assignee || shift.technicians && shift.technicians.length > 0) && (
                                <div className="flex items-center gap-[2rem] text-[1.2rem] text-gray-600 pt-[0.8rem] border-t border-gray-200">
                                  {shift.assignee && (
                                    <div className="flex items-center gap-[0.6rem]">
                                      <span className="font-[600]">Phụ trách:</span>
                                      <span className="text-gray-900">{shift.assignee.fullName || shift.assignee.username}</span>
                                    </div>
                                  )}
                                  {shift.technicians && shift.technicians.length > 0 && (
                                    <div className="flex items-center gap-[0.6rem]">
                                      <span className="font-[600]">Kỹ thuật viên:</span>
                                      <span className="text-gray-900">{shift.technicians.length} người</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Services */}
                              {shift.appointment?.serviceTypeResponses && shift.appointment.serviceTypeResponses.length > 0 && (
                                <div className="flex flex-wrap gap-[0.8rem] pt-[0.4rem]">
                                  {shift.appointment.serviceTypeResponses.slice(0, 3).map((service: any) => (
                                    <span
                                      key={service.serviceTypeId}
                                      className="px-[1rem] py-[0.4rem] text-[1.1rem] bg-purple-50 text-purple-700 border border-purple-200 rounded-[0.6rem] font-[500]"
                                    >
                                      {service.serviceName}
                                    </span>
                                  ))}
                                  {shift.appointment.serviceTypeResponses.length > 3 && (
                                    <span className="px-[1rem] py-[0.4rem] text-[1.1rem] bg-gray-100 text-gray-600 border border-gray-200 rounded-[0.6rem] font-[500]">
                                      +{shift.appointment.serviceTypeResponses.length - 3} khác
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Right: Status & Actions */}
                            <div className="flex flex-col items-end gap-[1.2rem]">
                              {/* Status Badge */}
                              <div className={`px-[1.6rem] py-[0.8rem] rounded-[0.8rem] font-[700] text-[1.3rem] shadow-sm whitespace-nowrap ${
                                shift.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border border-green-200' :
                                shift.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                shift.status === 'SCHEDULED' ? 'bg-gray-100 text-gray-700 border border-gray-200' :
                                shift.status === 'PENDING_ASSIGNMENT' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                'bg-red-100 text-red-700 border border-red-200'
                              }`}>
                                {formatStatus(shift.status)}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-[0.8rem] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {(shift.status === 'PENDING_ASSIGNMENT' || shift.status === 'LATE_ASSIGNMENT') && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAssign(shift.shiftId);
                                    }}
                                    className="px-[1.6rem] py-[0.8rem] text-[1.3rem] font-[600] text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-[0.6rem] hover:shadow-lg transition-all"
                                  >
                                    Phân công
                                  </button>
                                )}
                                {shift.status === 'SCHEDULED' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenStatusDialog(shift);
                                    }}
                                    className="px-[1.6rem] py-[0.8rem] text-[1.3rem] font-[600] text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[0.6rem] hover:shadow-lg transition-all"
                                  >
                                    Bắt đầu
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/${pathAdmin}/shift/edit/${shift.shiftId}`);
                                  }}
                                  className="px-[1.6rem] py-[0.8rem] text-[1.3rem] font-[600] text-blue-600 bg-white border-2 border-blue-200 rounded-[0.6rem] hover:border-blue-400 hover:bg-blue-50 transition-all"
                                >
                                  Sửa
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        {/* Header */}
        <div className="p-[2.4rem] flex items-center justify-between">
          <div className="flex items-center gap-[1.6rem]">
            <h2 className="text-admin-secondary text-[1.6rem] font-[500] leading-[1.2]">
              Quản lý ca làm việc
            </h2>
            {/* View Toggle */}
            <div className="flex items-center gap-[0.4rem] bg-gray-100 rounded-[0.6rem] p-[0.4rem]">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-[0.4rem] px-[1.2rem] py-[0.6rem] text-[1.2rem] font-[500] rounded-[0.4rem] transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <ViewListIcon sx={{ fontSize: '1.6rem' }} />
                <span>Danh sách</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-[0.4rem] px-[1.2rem] py-[0.6rem] text-[1.2rem] font-[500] rounded-[0.4rem] transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <CalendarMonthIcon sx={{ fontSize: '1.6rem' }} />
                <span>Lịch</span>
              </button>
            </div>
          </div>
          <button
            onClick={handleManualCreate}
            className="flex items-center text-gray-700 text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] border border-gray-300 rounded-[0.64rem] hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-[2rem] h-[2rem] mr-[0.5rem]" />
            <span>Tạo ca làm thủ công</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-[2.4rem] pb-[1.6rem]">
          <FormSearch
            onSearch={handleSearch}
          />
          
          {/* ✅ Bộ lọc nâng cao */}
          <Box className="mt-4 p-4 bg-gray-50 rounded-lg">
            <Typography className="text-[1.3rem] font-semibold mb-3">
              🔍 Bộ lọc
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status Filter */}
              <FormControl size="small" fullWidth>
                <InputLabel className="text-[1.2rem]">Trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  label="Trạng thái"
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-[1.2rem]"
                >
                  <MenuItem value="">
                    <em>Tất cả</em>
                  </MenuItem>
                  <MenuItem value="PENDING_ASSIGNMENT">Chờ phân công</MenuItem>
                  <MenuItem value="LATE_ASSIGNMENT">Quá giờ chưa phân công</MenuItem>
                  <MenuItem value="SCHEDULED">Đã lên lịch</MenuItem>
                  <MenuItem value="IN_PROGRESS">Đang thực hiện</MenuItem>
                  <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
                  <MenuItem value="CANCELLED">Đã hủy</MenuItem>
                </Select>
              </FormControl>

              {/* Shift Type Filter */}
              <FormControl size="small" fullWidth>
                <InputLabel className="text-[1.2rem]">Loại ca</InputLabel>
                <Select
                  value={shiftTypeFilter}
                  label="Loại ca"
                  onChange={(e) => {
                    setShiftTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-[1.2rem]"
                >
                  <MenuItem value="">
                    <em>Tất cả</em>
                  </MenuItem>
                  <MenuItem value="APPOINTMENT">Theo lịch hẹn</MenuItem>
                  <MenuItem value="ON_DUTY">Trực</MenuItem>
                  <MenuItem value="INVENTORY_CHECK">Kiểm kê</MenuItem>
                  <MenuItem value="OTHER">Khác</MenuItem>
                </Select>
              </FormControl>

              {/* From Date */}
              <TextField
                size="small"
                fullWidth
                type="date"
                label="Từ ngày"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setCurrentPage(1);
                }}
                InputLabelProps={{ shrink: true }}
                inputProps={{ className: "text-[1.2rem]" }}
              />

              {/* To Date */}
              <TextField
                size="small"
                fullWidth
                type="date"
                label="Đến ngày"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setCurrentPage(1);
                }}
                InputLabelProps={{ shrink: true }}
                inputProps={{ className: "text-[1.2rem]" }}
              />
            </div>
          </Box>
        </div>

        {/* Content */}
        <div className="px-[2.4rem] pb-[2.4rem]">
          {loading ? (
            <div className="text-center py-16">
              <p className="text-[1.4rem] text-gray-600">Đang tải dữ liệu...</p>
            </div>
          ) : viewMode === 'list' ? (
            <>
              {dataWithIndex.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-[6rem] mb-4">📅</div>
                  <p className="text-[1.6rem] text-gray-600 font-[500] mb-2">
                    Chưa có ca làm việc nào
                  </p>
                  <p className="text-[1.3rem] text-gray-500">
                    Ca làm việc sẽ tự động tạo khi có lịch hẹn mới
                  </p>
                </div>
              ) : (
                <>
                  <TableAdmin
                    headers={headers}
                    data={dataWithIndex}
                    loading={loading}
                    editPath={`/${pathAdmin}/shift/edit`}
                    viewPath={`/${pathAdmin}/shift/view`}
                  />
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-[2.4rem]">
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                      />
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            renderCalendarView()
          )}
        </div>
      </Card>

      {/* Dialog xác nhận bắt đầu ca làm việc */}
      <Dialog 
        open={openStatusDialog} 
        onClose={handleCloseStatusDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1.5, pt: 2.5 }}>
          <Typography variant="h6" className="text-[1.6rem] font-[600]">
            Bắt đầu ca làm việc
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pb: 2 }}>
          <Typography className="text-[1.3rem] mb-4">
            Bạn có chắc muốn bắt đầu ca làm việc này?
          </Typography>
          
          {selectedShift && (
            <Box className="bg-gray-50 p-4 rounded-lg">
              <Typography className="text-[1.2rem] mb-2">
                <strong>Thông tin ca làm việc:</strong>
              </Typography>
              <Typography className="text-[1.2rem] mb-1">
                <strong>Thời gian:</strong> {formatDateTime(selectedShift.startTime)} - {formatDateTime(selectedShift.endTime)}
              </Typography>
              {selectedShift.appointment && (
                <Typography className="text-[1.2rem] mb-1">
                  <strong>Khách hàng:</strong> {selectedShift.appointment.customerFullName || 'N/A'}
                </Typography>
              )}
              {selectedShift.assignee && (
                <Typography className="text-[1.2rem]">
                  <strong>Người phụ trách:</strong> {selectedShift.assignee.fullName || selectedShift.assignee.username}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions 
          sx={{ 
            px: 3, 
            pb: 3, 
            pt: 1,
            gap: 1.5,
            backgroundColor: '#fafafa'
          }}
        >
          <Button 
            onClick={handleCloseStatusDialog}
            variant="outlined"
            size="large"
            sx={{
              flex: 1,
              py: 1.2,
              fontWeight: 600,
              borderColor: '#ddd',
              color: '#666',
              '&:hover': {
                borderColor: '#999',
                backgroundColor: 'rgba(0,0,0,0.02)'
              }
            }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleUpdateStatus}
            variant="contained"
            size="large"
            startIcon={<PlayCircleFilledIcon />}
            sx={{
              flex: 1,
              py: 1.2,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 14px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #653993 100%)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.3s'
            }}
          >
            Bắt đầu
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ShiftList;


