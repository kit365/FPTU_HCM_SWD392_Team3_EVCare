import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Card, 
  Pagination, 
  Stack, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField
} from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { FormSearch } from "../../../components/admin/ui/FormSearch";
import { FormEmpty } from "../../../components/admin/ui/FormEmpty";
import { useAppointment } from "../../../hooks/useAppointment";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import PersonIcon from "@mui/icons-material/Person";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import HasRole from "../../../components/common/HasRole";
import { RoleEnum } from "../../../constants/roleConstants";
import { useAuthContext } from "../../../context/useAuthContext";

const columns = [
  { title: "STT", width: 5 },
  { title: "Khách hàng", width: 12 },
  { title: "Số điện thoại", width: 10 },
  { title: "Email", width: 15 },
  { title: "Biển số xe", width: 10 },
  { title: "Loại xe", width: 12 },
  { title: "Ngày hẹn", width: 10 },
  { title: "Dịch vụ", width: 8 },
  { title: "Trạng thái", width: 8 },
  { title: "Hành động", width: 10 },
];

const AppointmentManage = () => {
  const { user } = useAuthContext();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const [keyword, setKeyword] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [serviceModeFilter, setServiceModeFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<string>("");

  const { list, totalPages, search, loading, updateStatus } = useAppointment();

  const load = useCallback(() => {
    search({ 
      page: currentPage - 1, 
      pageSize, 
      keyword,
      status: statusFilter || undefined,
      serviceMode: serviceModeFilter || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined
    });
  }, [currentPage, pageSize, keyword, statusFilter, serviceModeFilter, fromDate, toDate, search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = useCallback((value: string) => {
    setKeyword(value);
    setCurrentPage(1);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string } } = {
      'PENDING': { label: 'Chờ xử lý', color: 'bg-orange-100 text-orange-700' },
      'CONFIRMED': { label: 'Đã xác nhận', color: 'bg-sky-100 text-sky-700' },
      'IN_PROGRESS': { label: 'Đang thực hiện', color: 'bg-blue-100 text-blue-700' },
      'PENDING_PAYMENT': { label: 'Chờ thanh toán', color: 'bg-purple-100 text-purple-700' },
      'COMPLETED': { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
      'CANCELLED': { label: 'Đã hủy', color: 'bg-red-100 text-red-700' }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  const getServiceModeLabel = (mode: string) => {
    return mode === 'STATIONARY' ? 'Tại cửa hàng' : 'Dịch vụ tại nhà';
  };

  // Tự động xác định trạng thái tiếp theo theo flow BE
  // PENDING → CONFIRMED: Trang Shift phân công (KHÔNG phải trang này)
  // CONFIRMED → IN_PROGRESS: Trang này xử lý (Bắt đầu)
  // IN_PROGRESS → COMPLETED: Trang khác xử lý
  const getNextStatus = (currentStatus: string): string | null => {
    switch (currentStatus) {
      case 'PENDING':
        return null; // Cần có shift được phân công ở trang Shift mới chuyển sang CONFIRMED
      case 'CONFIRMED':
        return 'IN_PROGRESS'; // Trang này xử lý: Bắt đầu
      case 'IN_PROGRESS':
        return null; // Trang khác sẽ xử lý chuyển sang COMPLETED
      case 'COMPLETED':
        return null; // Không thể chuyển nữa
      default:
        return null;
    }
  };

  const getNextStatusLabel = (currentStatus: string): string => {
    const next = getNextStatus(currentStatus);
    const statusLabels: { [key: string]: string } = {
      'CONFIRMED': 'Đã xác nhận',
      'IN_PROGRESS': 'Đang thực hiện',
      'COMPLETED': 'Hoàn thành'
    };
    return next ? statusLabels[next] : '';
  };

  const getApproveButtonText = (currentStatus: string): string => {
    switch (currentStatus) {
      case 'CONFIRMED':
        return 'Bắt đầu';
      default:
        return 'Approve';
    }
  };

  const getApproveButtonColor = (currentStatus: string): string => {
    switch (currentStatus) {
      case 'CONFIRMED':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  const handleOpenStatusDialog = (appointment: any) => {
    const nextStatus = getNextStatus(appointment.status);
    if (!nextStatus) return;

    setSelectedAppointment(appointment);
    setNewStatus(nextStatus);
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setSelectedAppointment(null);
    setNewStatus("");
  };

  const handleUpdateStatus = async () => {
    if (!selectedAppointment || !newStatus) return;

    const success = await updateStatus(selectedAppointment.appointmentId, newStatus);
    if (success) {
      handleCloseStatusDialog();
      load(); // Reload list
    }
  };

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        <CardHeaderAdmin title="Danh sách cuộc hẹn" />

        <div className="px-[2.4rem] pb-[2.4rem] h-full">
          <FormSearch onSearch={handleSearch} />

          {/* ✅ Bộ lọc nâng cao */}
          <Box className="mt-4 mb-6 p-4 bg-gray-50 rounded-lg">
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
                  <MenuItem value="PENDING">Chờ xử lý</MenuItem>
                  <MenuItem value="CONFIRMED">Đã xác nhận</MenuItem>
                  <MenuItem value="IN_PROGRESS">Đang thực hiện</MenuItem>
                  <MenuItem value="PENDING_PAYMENT">Chờ thanh toán</MenuItem>
                  <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
                  <MenuItem value="CANCELLED">Đã hủy</MenuItem>
                </Select>
              </FormControl>

              {/* Service Mode Filter */}
              <FormControl size="small" fullWidth>
                <InputLabel className="text-[1.2rem]">Loại dịch vụ</InputLabel>
                <Select
                  value={serviceModeFilter}
                  label="Loại dịch vụ"
                  onChange={(e) => {
                    setServiceModeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-[1.2rem]"
                >
                  <MenuItem value="">
                    <em>Tất cả</em>
                  </MenuItem>
                  <MenuItem value="STATIONARY">Tại chỗ</MenuItem>
                  <MenuItem value="MOBILE">Di động</MenuItem>
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

            {/* Clear Filters Button */}
            {(statusFilter || serviceModeFilter || fromDate || toDate) && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setStatusFilter("");
                  setServiceModeFilter("");
                  setFromDate("");
                  setToDate("");
                  setCurrentPage(1);
                }}
                className="mt-3 text-[1.1rem]"
              >
                Xóa bộ lọc
              </Button>
            )}
          </Box>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="text-[#000000] text-[1.3rem] border-dashed bg-[#f4f6f9]">
                  <tr>
                    {columns.map((col, index) => (
                      <th
                        key={index}
                        className={`p-[1.2rem] font-[500] text-center ${
                          index === 0 ? "rounded-l-[8px]" : ""
                        } ${
                          index === columns.length - 1 ? "rounded-r-[8px]" : ""
                        }`}
                        style={{ width: `${col.width}%` }}
                      >
                        {col.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-[#2b2d3b] text-[1.3rem]">
                  {Array.isArray(list) && list.length > 0 ? (
                    list.map((item: any, index: number) => {
                      const statusInfo = getStatusLabel(item.status);
                      return (
                        <tr
                          key={item.appointmentId}
                          className={`border-b border-gray-200 text-center ${
                            index !== (Array.isArray(list) ? list.length - 1 : 0)
                              ? "border-dashed"
                              : "border-none"
                          } ${
                            index % 2 !== 0 ? "bg-transparent" : "bg-[#FBFBFD]"
                          }`}
                        >
                          <td className="p-[1.2rem]">
                            {(currentPage - 1) * pageSize + index + 1}
                          </td>
                          <td className="p-[1.2rem]">{item.customerFullName}</td>
                          <td className="p-[1.2rem]">{item.customerPhoneNumber}</td>
                          <td className="p-[1.2rem]">{item.customerEmail}</td>
                          <td className="p-[1.2rem]">{item.vehicleNumberPlate}</td>
                          <td className="p-[1.2rem]">
                            {item.vehicleTypeResponse?.vehicleTypeName || "-"}
                          </td>
                          <td className="p-[1.2rem]">
                            {formatDate(item.scheduledAt)}
                          </td>
                          <td className="p-[1.2rem]">
                            {getServiceModeLabel(item.serviceMode)}
                          </td>
                          <td className="p-[1.2rem]">
                            <span
                              className={`px-2 py-1 rounded-full text-[1rem] font-medium ${statusInfo.color}`}
                            >
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="p-[1.2rem] text-center">
                            <div className="flex justify-center items-center gap-2">
                              <HasRole allow={[RoleEnum.ADMIN, RoleEnum.STAFF]}>
                                {item.status === 'CONFIRMED' && (
                                  <button
                                    onClick={() => handleOpenStatusDialog(item)}
                                    className={`px-3 py-1.5 rounded-md text-white text-[0.75rem] font-semibold transition-all shadow-sm hover:shadow-md ${getApproveButtonColor(item.status)}`}
                                    title={`Chuyển sang: ${getNextStatusLabel(item.status)}`}
                                  >
                                    <span className="flex items-center gap-1">
                                      <ChangeCircleIcon className="!w-[1rem] !h-[1rem]" />
                                      {getApproveButtonText(item.status)}
                                    </span>
                                  </button>
                                )}
                                {item.status === 'PENDING_PAYMENT' && (
                                  <Link
                                    to={`/admin/invoice/${item.appointmentId}`}
                                    className="px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-[0.75rem] font-semibold transition-all shadow-sm hover:shadow-md inline-flex items-center gap-1"
                                    title="Thanh toán"
                                  >
                                    <PaymentIcon className="!w-[1rem] !h-[1rem]" />
                                    Thanh toán
                                  </Link>
                                )}
                                {item.status === 'COMPLETED' && (
                                  <Link
                                    to={`/admin/invoice/${item.appointmentId}`}
                                    className="px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-[0.75rem] font-semibold transition-all shadow-sm hover:shadow-md inline-flex items-center gap-1"
                                    title="Xem hóa đơn"
                                  >
                                    <ReceiptIcon className="!w-[1rem] !h-[1rem]" />
                                    Hóa đơn
                                  </Link>
                                )}
                              </HasRole>
                              <Link
                                to={`/admin/appointment/view/${item.appointmentId}`}
                                className="text-green-500 w-[2rem] h-[2rem] inline-flex items-center justify-center hover:opacity-80 transition-opacity"
                                title="Xem chi tiết"
                              >
                                <RemoveRedEyeIcon className="!w-full !h-full" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <FormEmpty colspan={columns.length} />
                  )}
                </tbody>
              </table>

              {Array.isArray(list) && list.length > 0 && (
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

      {/* Dialog xác nhận đổi trạng thái - Redesigned */}
      <Dialog 
        open={openStatusDialog} 
        onClose={handleCloseStatusDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            overflow: 'hidden'
          }
        }}
      >
        {/* Header với gradient */}
        <Box 
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            p: 3,
            pb: 2.5,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative circles */}
          <Box 
            sx={{ 
              position: 'absolute',
              top: -30,
              right: -30,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
            }} 
          />
          <Box 
            sx={{ 
              position: 'absolute',
              bottom: -20,
              left: -20,
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
            }} 
          />

          {/* Icon lớn ở trung tâm */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, position: 'relative', zIndex: 1 }}>
            <Box 
              sx={{ 
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
              }}
            >
              <PlayCircleFilledIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
          </Box>

          <DialogTitle sx={{ p: 0, textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                color: 'white',
                mb: 0.5,
                textShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              Bắt đầu xử lý cuộc hẹn
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
              Xác nhận chuyển trạng thái cuộc hẹn
            </Typography>
          </DialogTitle>
        </Box>

        <DialogContent sx={{ pt: 3, pb: 2, px: 3 }}>
          {/* Thông tin khách hàng */}
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600, 
                color: '#666', 
                mb: 1.5,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}
            >
              Thông tin cuộc hẹn
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {/* Khách hàng */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  p: 1.5,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 2,
                  border: '1px solid #e9ecef'
                }}
              >
                <Box 
                  sx={{ 
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1.5,
                    flexShrink: 0
                  }}
                >
                  <PersonIcon sx={{ fontSize: 20, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem', display: 'block' }}>
                    Khách hàng
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {selectedAppointment?.customerFullName}
                  </Typography>
                </Box>
              </Box>

              {/* Biển số xe */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  p: 1.5,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 2,
                  border: '1px solid #e9ecef'
                }}
              >
                <Box 
                  sx={{ 
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1.5,
                    flexShrink: 0
                  }}
                >
                  <DirectionsCarIcon sx={{ fontSize: 20, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem', display: 'block' }}>
                    Biển số xe
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {selectedAppointment?.vehicleNumberPlate}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          {/* Chuyển đổi trạng thái với visual flow */}
          <Box>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600, 
                color: '#666', 
                mb: 1.5,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}
            >
              Chuyển đổi trạng thái
            </Typography>
            
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                p: 2.5,
                backgroundColor: '#f8f9fa',
                borderRadius: 2,
                border: '2px solid #e9ecef'
              }}
            >
              <Chip 
                label={getStatusLabel(selectedAppointment?.status || '').label}
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  px: 1,
                  height: 36,
                  backgroundColor: '#e3f2fd',
                  color: '#1976d2',
                  border: '2px solid #1976d2'
                }}
              />
              
              <ArrowForwardIcon sx={{ color: '#667eea', fontSize: 28, fontWeight: 'bold' }} />
              
              <Chip 
                label={getStatusLabel(newStatus).label}
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  px: 1,
                  height: 36,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: '2px solid #667eea'
                }}
              />
            </Box>
          </Box>
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
            {getApproveButtonText(selectedAppointment?.status || '')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AppointmentManage;