import React, { useState, useEffect, useRef } from "react";
import { Table, Input, Button, Space, Typography, Tag, message, Card, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import { bookingService } from "../../service/bookingService";
import { useNavigate } from "react-router-dom";
import { Receipt } from "@mui/icons-material";
import { useAuthContext } from "../../context/useAuthContext";
import moment from "moment";
import {
  Box,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography as MuiTypography,
  Card as MuiCard,
  CardContent,
  Grid,
  Paper,
  Stack,
} from "@mui/material";
import { 
  Payment,
  Person,
  DirectionsCar,
  CalendarToday,
  LocationOn,
  Build,
  AttachMoney,
  Assignment,
  Edit,
  Close,
  Phone,
  Email,
  Info,
  CheckCircle,
  Schedule,
} from "@mui/icons-material";
import QRCode from "react-qr-code";
import { useInvoice } from "../../hooks/useInvoice";

const { Title } = Typography;

interface AppointmentRow {
  key: string;
  appointmentId: string;
  customerFullName: string;
  customerPhoneNumber: string;
  customerEmail: string;
  vehicleNumberPlate: string;
  serviceMode: string;
  status: string;
  scheduledAt: string;
}

const LookupAppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [keyword, setKeyword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<AppointmentRow[]>([]);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  
  // Invoice modal states
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const { invoice, loading: invoiceLoading, paying, getByAppointmentId, payCash, createVnPayPayment } = useInvoice();
  const [openPayDialog, setOpenPayDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("VNPAY");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingStartTimeRef = useRef<number | null>(null);
  const hasNavigatedRef = useRef<boolean>(false);

  // OTP modal states for guest
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [guestEmail, setGuestEmail] = useState<string>("");
  const [otpCode, setOtpCode] = useState<string>("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [guestAppointmentDetail, setGuestAppointmentDetail] = useState<any>(null);
  const [guestAppointmentModalOpen, setGuestAppointmentModalOpen] = useState(false);

  // Load invoice when modal opens
  useEffect(() => {
    if (invoiceModalOpen && selectedAppointmentId) {
      getByAppointmentId(selectedAppointmentId);
    }
  }, [invoiceModalOpen, selectedAppointmentId, getByAppointmentId]);

  useEffect(() => {
    if (invoice) {
      setPaidAmount(invoice.totalAmount);
    }
  }, [invoice]);

  const previousStatusRef = useRef<string | undefined>(undefined);
  
  useEffect(() => {
    if (invoice) {
      if (previousStatusRef.current !== invoice.status) {
        previousStatusRef.current = invoice.status;
      }
      
      if (invoice.status === "PAID" && openQrDialog && !hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        if (pollingTimeoutRef.current) {
          clearTimeout(pollingTimeoutRef.current);
          pollingTimeoutRef.current = null;
        }
        pollingStartTimeRef.current = null;
        
        setOpenQrDialog(false);
        setPaymentUrl(null);
        setInvoiceModalOpen(false);
        setSelectedAppointmentId(null);
        // Reload appointment list
        fetchData(page, pageSize, keyword);
        navigate(`/client/payment/success?appointmentId=${selectedAppointmentId}`, { replace: true });
      }
    }
  }, [invoice, openQrDialog, navigate, selectedAppointmentId, page, pageSize, keyword]);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, []);

  const handleViewInvoice = (appointmentId: string) => {
    // Cho phép cả khách vãng lai và đã đăng nhập xem hóa đơn để thanh toán
    setSelectedAppointmentId(appointmentId);
    setInvoiceModalOpen(true);
  };

  const handleViewDetailForGuest = (record: AppointmentRow) => {
    // Nếu user đã đăng nhập, chuyển đến trang chi tiết cuộc hẹn
    if (user) {
      navigate(`/client/appointment/${record.appointmentId}`);
      return;
    }
    // Nếu là guest, mở modal OTP verification
    setSelectedAppointmentId(record.appointmentId);
    setGuestEmail(record.customerEmail);
    setOtpModalOpen(true);
  };

  const handleCloseInvoiceModal = () => {
    setInvoiceModalOpen(false);
    setSelectedAppointmentId(null);
    setOpenPayDialog(false);
    setOpenQrDialog(false);
    setPaymentUrl(null);
    setPaymentMethod("VNPAY");
    setNotes("");
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    hasNavigatedRef.current = false;
  };

  const handleOpenPayDialog = () => {
    setOpenPayDialog(true);
  };

  const handleClosePayDialog = () => {
    setOpenPayDialog(false);
    setPaymentMethod("VNPAY");
    setNotes("");
  };

  const handleCloseQrDialog = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    pollingStartTimeRef.current = null;
    setOpenQrDialog(false);
    setPaymentUrl(null);
    hasNavigatedRef.current = false;
  };

  const MAX_POLLING_TIME = 5 * 60 * 1000; // 5 phút

  const checkPaymentStatus = async () => {
    if (!selectedAppointmentId) return;
    
    // Kiểm tra nếu đã quá thời gian polling
    if (pollingStartTimeRef.current) {
      const elapsed = Date.now() - pollingStartTimeRef.current;
      if (elapsed > MAX_POLLING_TIME) {
        console.log("⏰ Polling timeout reached, stopping...");
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        if (pollingTimeoutRef.current) {
          clearTimeout(pollingTimeoutRef.current);
          pollingTimeoutRef.current = null;
        }
        message.warning("Đã hết thời gian chờ thanh toán. Vui lòng kiểm tra lại sau.");
        setOpenQrDialog(false);
        return;
      }
    }
    
    try {
      await getByAppointmentId(selectedAppointmentId);
    } catch (error: any) {
      console.error("Error checking payment status:", error);
      // Nếu là timeout error, không cần log nhiều
      if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
        console.log("⏰ Request timeout, will retry...");
      }
    }
  };

  const startPolling = () => {
    // Clear existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
    }
    
    // Set start time
    pollingStartTimeRef.current = Date.now();
    
    // Set timeout để dừng polling sau MAX_POLLING_TIME
    pollingTimeoutRef.current = setTimeout(() => {
      console.log("⏰ Polling timeout reached, stopping...");
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      message.warning("Đã hết thời gian chờ thanh toán. Vui lòng kiểm tra lại sau.");
      setOpenQrDialog(false);
      pollingStartTimeRef.current = null;
    }, MAX_POLLING_TIME);
    
    const checkStatus = () => {
      checkPaymentStatus();
    };
    
    // Poll mỗi 3 giây thay vì 1.5 giây để giảm tải
    pollingIntervalRef.current = setInterval(checkStatus, 3000);
  };

  const handlePayment = async () => {
    if (!invoice || !selectedAppointmentId) return;
    
    switch (paymentMethod) {
      case "VNPAY":
        try {
          hasNavigatedRef.current = false;
          setOpenQrDialog(true);
          handleClosePayDialog();
          
          // Set timeout cho việc tạo payment URL
          const urlPromise = createVnPayPayment(selectedAppointmentId, "client");
          const timeoutPromise = new Promise<string>((_, reject) => {
            setTimeout(() => reject(new Error("Timeout: Không thể tạo URL thanh toán trong thời gian cho phép")), 30000);
          });
          
          const url = await Promise.race([urlPromise, timeoutPromise]);
          
          if (url && url.trim() !== "") {
            setPaymentUrl(url);
            startPolling();
          } else {
            message.error("Không thể tạo URL thanh toán. Vui lòng thử lại.");
            setOpenQrDialog(false);
          }
        } catch (error: any) {
          console.error("Error creating VNPay payment:", error);
          message.error(error?.message || "Không thể tạo URL thanh toán. Vui lòng thử lại.");
          setOpenQrDialog(false);
          hasNavigatedRef.current = false;
          return;
        }
        break;
      
      case "CASH":
        if (!paidAmount || paidAmount <= 0) {
          alert("Số tiền thanh toán không hợp lệ");
          return;
        }
        
        if (paidAmount < invoice.totalAmount) {
          alert("Số tiền thanh toán phải bằng tổng tiền hóa đơn");
          return;
        }
        
        const success = await payCash(invoice.invoiceId, {
          paymentMethod,
          paidAmount,
          notes
        });

        if (success) {
          handleClosePayDialog();
          if (selectedAppointmentId) {
            await getByAppointmentId(selectedAppointmentId);
          }
          setInvoiceModalOpen(false);
          fetchData(page, pageSize, keyword);
          navigate(`/client/payment/success?appointmentId=${selectedAppointmentId}`, { replace: true });
        }
        break;
      
      default:
        alert("Phương thức thanh toán không hợp lệ");
        break;
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return moment(dateString).format("DD/MM/YYYY HH:mm");
  };

  const isValidEmail = (text: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
  const isValidPhone = (text: string) => /^[0-9]{9,12}$/.test(text.replace(/\D/g, ""));

  const fetchData = async (_page = page, _pageSize = pageSize, _keyword = keyword) => {
    if (!_keyword || (!isValidEmail(_keyword) && !isValidPhone(_keyword))) {
      message.warning("Vui lòng nhập email hoặc số điện thoại hợp lệ");
      return;
    }
    
    // Validate pagination parameters
    const validPage = Math.max(0, _page || 0);
    const validPageSize = Math.max(1, _pageSize || 10);
    
    setLoading(true);
    try {
      // Kiểm tra xem user đã đăng nhập chưa
      // Nếu đã đăng nhập và KHÔNG phải STAFF: dùng API search/customer (yêu cầu authentication)
      // Nếu chưa đăng nhập hoặc là STAFF: dùng API search/guest (public)
      const isStaff = user?.roleName?.includes('STAFF');
      const shouldUseCustomerAPI = user && !isStaff;
      console.log("🔍 LookupAppointments - Searching:", { user: user?.email, keyword: _keyword, isStaff, shouldUseCustomerAPI });
      const res = shouldUseCustomerAPI
        ? await bookingService.searchAppointmentsForCustomer({ page: validPage, pageSize: validPageSize, keyword: _keyword })
        : await bookingService.searchAppointmentsForGuest({ page: validPage, pageSize: validPageSize, keyword: _keyword });
      
      console.log("📥 LOOKUP APPOINTMENTS RESPONSE:", res);
      const payload: any = (res as any).data?.data ?? (res as any).data;
      console.log("📋 Parsed lookup payload:", payload);
      const items: AppointmentRow[] = (payload?.data || []).map((a: any) => ({
        key: a.appointmentId,
        appointmentId: a.appointmentId,
        customerFullName: a.customerFullName,
        customerPhoneNumber: a.customerPhoneNumber,
        customerEmail: a.customerEmail,
        vehicleNumberPlate: a.vehicleNumberPlate,
        serviceMode: a.serviceMode,
        status: a.status,
        scheduledAt: a.scheduledAt,
      }));
      setData(items);
      setPage(payload?.page ?? _page);
      // Don't update pageSize from backend, keep it at 10
      setTotal(payload?.totalElements ?? items.length);
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
      message.error(error?.response?.data?.message || "Lỗi khi tìm kiếm lịch hẹn");
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      PENDING: { label: "Chờ xác nhận", color: "orange" },
      CONFIRMED: { label: "Đã xác nhận", color: "blue" },
      IN_PROGRESS: { label: "Đang thực hiện", color: "purple" },
      PENDING_PAYMENT: { label: "Chờ thanh toán", color: "gold" },
      COMPLETED: { label: "Hoàn thành", color: "green" },
      CANCELLED: { label: "Đã hủy", color: "red" },
    };
    return statusMap[status] || { label: status, color: "default" };
  };

  const columns: ColumnsType<AppointmentRow> = [
    { 
      title: "Khách hàng", 
      dataIndex: "customerFullName",
      width: 220,
      ellipsis: { showTitle: true },
    },
    { 
      title: "SĐT", 
      dataIndex: "customerPhoneNumber",
      width: 160,
    },
    { 
      title: "Email", 
      dataIndex: "customerEmail",
      width: 280,
      ellipsis: { showTitle: true },
    },
    { 
      title: "Biển số", 
      dataIndex: "vehicleNumberPlate",
      width: 160,
    },
    { 
      title: "Hình thức", 
      dataIndex: "serviceMode", 
      width: 140,
      render: (v: string) => <Tag color={v === 'MOBILE' ? 'blue' : 'green'}>{v === 'MOBILE' ? 'Tại nhà' : 'Tại trạm'}</Tag> 
    },
    { 
      title: "Trạng thái", 
      dataIndex: "status", 
      width: 160,
      render: (v: string) => {
        const statusInfo = getStatusLabel(v);
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      }
    },
    { 
      title: "Thời gian", 
      dataIndex: "scheduledAt",
      width: 220,
      render: (date: string) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      fixed: "right" as const,
      render: (_: any, record: AppointmentRow) => (
        <Space size="small" direction="vertical" style={{ width: "100%" }}>
          {/* Nút xem chi tiết cho tất cả (kể cả guest) */}
          <Button
            type="link"
            size="small"
            onClick={() => handleViewDetailForGuest(record)}
            style={{ padding: 0, fontSize: "13px" }}
          >
            Xem chi tiết
          </Button>
          {/* Hiển thị nút Thanh toán cho cả khách vãng lai và đã đăng nhập khi status = PENDING_PAYMENT */}
          {record.status === "PENDING_PAYMENT" && (
            <Button
              type="link"
              size="small"
              icon={<Payment />}
              onClick={() => handleViewInvoice(record.appointmentId)}
              style={{ padding: 0, color: "#3b82f6", fontSize: "13px" }}
            >
              Thanh toán
            </Button>
          )}
          {/* Hiển thị nút Hóa đơn khi đã hoàn thành và đã đăng nhập */}
          {user && record.status === "COMPLETED" && (
            <Button
              type="link"
              size="small"
              icon={<Receipt />}
              onClick={() => handleViewInvoice(record.appointmentId)}
              style={{ padding: 0, fontSize: "13px" }}
            >
              Hóa đơn
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5"></div>
      <div className="relative z-10 max-w-[95%] mx-auto p-6">
        <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 -m-6 mb-6 text-white">
            <Title level={3} className="!mb-0 !text-white">Tra cứu lịch hẹn</Title>
          </div>
          <Space style={{ marginBottom: 16 }}>
            <Input
              placeholder="Nhập email hoặc số điện thoại"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ width: 400 }}
            />
            <Button
              type="primary"
              onClick={() => fetchData(0, pageSize, keyword)}
              disabled={!keyword || (!isValidEmail(keyword) && !isValidPhone(keyword))}
            >
              Tìm kiếm
            </Button>
            <Button onClick={() => { setKeyword(""); setData([]); setTotal(0); }}>Xóa</Button>
          </Space>
          <div style={{ overflowX: 'auto', width: '100%' }}>
          <Table
            loading={loading}
            columns={columns}
            dataSource={data}
            pagination={{
              current: page + 1,
              pageSize: 10,
              total,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} lịch hẹn`,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: (p, ps) => { 
                const validPageSize = Math.max(1, ps || 10);
                const validPage = Math.max(0, p - 1);
                setPage(validPage); 
                setPageSize(validPageSize); 
                fetchData(validPage, validPageSize, keyword); 
              }
            }}
            bordered
            rowKey="appointmentId"
            scroll={{ x: 'max-content' }}
            size="large"
            style={{ minWidth: '100%' }}
            />
          </div>

        {/* Invoice Modal - chỉ hiển thị khi status = PENDING_PAYMENT */}
        <Dialog
          open={invoiceModalOpen}
          onClose={handleCloseInvoiceModal}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 600, fontSize: "1.25rem" }}>
            Chi tiết hóa đơn
          </DialogTitle>
          <DialogContent>
            {invoiceLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : invoice ? (
              <Box sx={{ mt: 2 }}>
                {/* Customer Info */}
                <Box sx={{ p: 2, borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb", mb: 2 }}>
                  <MuiTypography variant="h6" sx={{ fontWeight: 600, mb: 1.5, fontSize: "1rem" }}>
                    Thông tin khách hàng
                  </MuiTypography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                    <Box>
                      <MuiTypography variant="body2" color="text.secondary">Tên khách hàng:</MuiTypography>
                      <MuiTypography variant="body1" sx={{ fontWeight: 600 }}>{invoice.customerName}</MuiTypography>
                    </Box>
                    <Box>
                      <MuiTypography variant="body2" color="text.secondary">Email:</MuiTypography>
                      <MuiTypography variant="body1" sx={{ fontWeight: 600 }}>{invoice.customerEmail}</MuiTypography>
                    </Box>
                    <Box>
                      <MuiTypography variant="body2" color="text.secondary">Số điện thoại:</MuiTypography>
                      <MuiTypography variant="body1" sx={{ fontWeight: 600 }}>{invoice.customerPhone}</MuiTypography>
                    </Box>
                  </Box>
                </Box>

                {/* Vehicle Info */}
                {invoice.vehicleNumberPlate && (
                  <Box sx={{ p: 2, borderBottom: "1px solid #e5e7eb", mb: 2 }}>
                    <MuiTypography variant="h6" sx={{ fontWeight: 600, mb: 1.5, fontSize: "1rem" }}>
                      Thông tin xe
                    </MuiTypography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                      <Box>
                        <MuiTypography variant="body2" color="text.secondary">Biển số xe:</MuiTypography>
                        <MuiTypography variant="body1" sx={{ fontWeight: 600 }}>{invoice.vehicleNumberPlate}</MuiTypography>
                      </Box>
                      {invoice.vehicleTypeName && (
                        <Box>
                          <MuiTypography variant="body2" color="text.secondary">Loại xe:</MuiTypography>
                          <MuiTypography variant="body1" sx={{ fontWeight: 600 }}>
                            {invoice.vehicleTypeName} {invoice.vehicleManufacturer ? `(${invoice.vehicleManufacturer})` : ""}
                          </MuiTypography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Services & Parts */}
                {invoice.maintenanceDetails && invoice.maintenanceDetails.length > 0 && (
                  <Box sx={{ p: 2, borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb", mb: 2 }}>
                    <MuiTypography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: "1rem" }}>
                      Chi tiết dịch vụ & phụ tùng
                    </MuiTypography>
                    {invoice.maintenanceDetails.map((maintenance, index) => (
                      <Box key={index} sx={{ mb: 2, "&:last-child": { mb: 0 } }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                          <MuiTypography variant="body1" sx={{ fontWeight: 600, color: "#3b82f6" }}>
                            {index + 1}. {maintenance.serviceName}
                          </MuiTypography>
                          <MuiTypography variant="body1" sx={{ fontWeight: 600 }}>
                            {formatCurrency(maintenance.serviceCost)}
                          </MuiTypography>
                        </Box>
                        {maintenance.partsUsed && maintenance.partsUsed.length > 0 && (
                          <Box sx={{ ml: 2, mt: 1 }}>
                            <MuiTypography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                              Phụ tùng sử dụng:
                            </MuiTypography>
                            {maintenance.partsUsed.map((part, partIndex) => (
                              <Box
                                key={partIndex}
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  py: 0.5,
                                  fontSize: "0.875rem",
                                  borderBottom: partIndex < maintenance.partsUsed.length - 1 ? "1px solid #e5e7eb" : "none",
                                }}
                              >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <MuiTypography variant="body2">• {part.partName}</MuiTypography>
                                  {part.isUnderWarranty && (
                                    <Chip
                                      label="Bảo hành"
                                      size="small"
                                      sx={{
                                        backgroundColor: "#dcfce7",
                                        color: "#166534",
                                        fontSize: "0.7rem",
                                        height: "20px",
                                        fontWeight: 600,
                                      }}
                                    />
                                  )}
                                </Box>
                                <Box sx={{ textAlign: "right" }}>
                                  {part.isUnderWarranty && part.originalPrice ? (
                                    <Box>
                                      <MuiTypography variant="body2" sx={{ textDecoration: "line-through", color: "#9ca3af", fontSize: "0.75rem" }}>
                                        {formatCurrency(part.originalPrice)}
                                      </MuiTypography>
                                      <MuiTypography variant="body2" sx={{ fontWeight: 600, color: "#10b981" }}>
                                        {formatCurrency(part.totalPrice)}
                                      </MuiTypography>
                                    </Box>
                                  ) : (
                                    <MuiTypography variant="body2" sx={{ fontWeight: 600 }}>
                                      {formatCurrency(part.totalPrice)}
                                    </MuiTypography>
                                  )}
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Total */}
                <Box sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <MuiTypography variant="h6" sx={{ fontWeight: 600 }}>
                      Tổng cộng:
                    </MuiTypography>
                    <MuiTypography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
                      {formatCurrency(invoice.totalAmount)}
                    </MuiTypography>
                  </Box>
                </Box>

                {/* Payment Button - chỉ hiển thị khi status = PENDING */}
                {invoice.status === "PENDING" && (
                  <Box sx={{ mt: 3 }}>
                    <Button
                      type="primary"
                      size="large"
                      icon={<Payment />}
                      onClick={handleOpenPayDialog}
                      block
                      style={{
                        backgroundColor: "#3b82f6",
                        height: "48px",
                        fontSize: "16px",
                        fontWeight: 600,
                      }}
                    >
                      Thanh toán
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              <Alert severity="error" sx={{ mt: 2 }}>
                Không tìm thấy hóa đơn
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseInvoiceModal}>Đóng</Button>
          </DialogActions>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={openPayDialog} onClose={handleClosePayDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600, fontSize: "1.25rem" }}>
            Xác nhận thanh toán
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
              <Alert severity="info">
                Tổng tiền cần thanh toán: <strong>{invoice ? formatCurrency(invoice.totalAmount) : "0 ₫"}</strong>
              </Alert>
              
              <FormControl fullWidth>
                <InputLabel>Phương thức thanh toán</InputLabel>
                <Select
                  value={paymentMethod}
                  label="Phương thức thanh toán"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <MenuItem value="VNPAY">Thanh toán qua VNPay</MenuItem>
                  <MenuItem value="CASH">Tiền mặt (CASH)</MenuItem>
                </Select>
              </FormControl>

              {paymentMethod === "CASH" && (
                <>
                  <TextField
                    label="Số tiền thanh toán"
                    type="number"
                    value={paidAmount}
                    disabled
                    fullWidth
                    InputProps={{
                      endAdornment: <MuiTypography sx={{ color: "#6b7280" }}>₫</MuiTypography>,
                    }}
                    helperText="Thanh toán đủ số tiền hóa đơn"
                  />

                  <TextField
                    label="Ghi chú (tùy chọn)"
                    multiline
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    fullWidth
                    placeholder="Nhập ghi chú về thanh toán..."
                  />
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClosePayDialog} disabled={paying}>
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handlePayment}
              disabled={paying || paidAmount <= 0}
              startIcon={paying ? <CircularProgress size={20} /> : <Payment />}
              sx={{
                backgroundColor: "#3b82f6",
                "&:hover": {
                  backgroundColor: "#2563eb",
                },
              }}
            >
              {paying ? "Đang xử lý..." : "Xác nhận thanh toán"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* QR Code Dialog */}
        <Dialog
          open={openQrDialog}
          onClose={handleCloseQrDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 600, fontSize: "1.25rem", textAlign: "center" }}>
            Quét mã QR để thanh toán
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, py: 2 }}>
              <Alert severity="info" sx={{ width: "100%" }}>
                Quét mã QR bằng ứng dụng ngân hàng hoặc VNPay để thanh toán.
                <br />
                <strong>Lưu ý:</strong> Khi thanh toán thành công, cửa sổ này sẽ tự động đóng và chuyển đến trang thành công.
              </Alert>
              
              {paymentUrl ? (
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "#fff",
                    borderRadius: 2,
                    border: "2px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <QRCode
                    value={paymentUrl}
                    size={256}
                    level="H"
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <CircularProgress size={40} />
                  <MuiTypography variant="body2" color="text.secondary">
                    Đang tạo mã QR...
                  </MuiTypography>
                </Box>
              )}

              {paymentUrl && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}>
                  <MuiTypography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
                    Hoặc nhấn vào nút bên dưới để mở trang thanh toán
                  </MuiTypography>
                  <Button
                    variant="outlined"
                    startIcon={<Payment />}
                    onClick={() => paymentUrl && window.open(paymentUrl, "_blank")}
                    fullWidth
                    sx={{
                      mt: 1,
                      py: 1.5,
                    }}
                  >
                    Mở trang thanh toán VNPay
                  </Button>
                </Box>
              )}

              {paymentUrl && (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={16} />
                    <MuiTypography variant="body2" color="text.secondary">
                      Đang chờ thanh toán...
                    </MuiTypography>
                  </Box>
                  {pollingStartTimeRef.current && (
                    <MuiTypography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                      {(() => {
                        const elapsed = Date.now() - pollingStartTimeRef.current!;
                        const remaining = Math.max(0, Math.floor((MAX_POLLING_TIME - elapsed) / 1000));
                        return remaining > 0 ? `${remaining}s còn lại` : "Đang kiểm tra...";
                      })()}
                    </MuiTypography>
                  )}
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, justifyContent: "center" }}>
            <Button onClick={handleCloseQrDialog} variant="outlined">
              Đóng
            </Button>
          </DialogActions>
        </Dialog>

        {/* OTP Verification Modal for Guest */}
        <Dialog
          open={otpModalOpen}
          onClose={() => {
            setOtpModalOpen(false);
            setOtpCode("");
            setOtpVerified(false);
            setGuestEmail("");
          }}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 800, fontSize: "1.85rem", pb: 3, px: 3, pt: 3 }}>
            Xác thực email
          </DialogTitle>
          <DialogContent sx={{ px: 3, pb: 3 }}>
            {!otpVerified ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 4, mt: 1 }}>
                <Box sx={{ p: 3, bgcolor: "#f0f7ff", borderRadius: 3, border: "2px solid #e0e7ff" }}>
                  <MuiTypography variant="h5" sx={{ fontSize: "1.5rem", fontWeight: 700, mb: 2, color: "#1e40af" }}>
                    Xác thực danh tính
                  </MuiTypography>
                  <MuiTypography variant="body1" sx={{ fontSize: "1.2rem", color: "text.primary", lineHeight: 1.8, mb: 1.5 }}>
                    Mã OTP sẽ được gửi đến email:{" "}
                    <Box component="strong" sx={{ color: "#3b82f6", fontWeight: 700, fontSize: "1.25rem" }}>
                      {guestEmail}
                    </Box>
                  </MuiTypography>
                  <MuiTypography variant="body1" sx={{ fontSize: "1.1rem", color: "text.secondary", mt: 1.5, lineHeight: 1.7 }}>
                    Vui lòng kiểm tra hộp thư đến và nhập mã xác thực để tiếp tục.
                  </MuiTypography>
                </Box>
                <Button
                  variant="outlined"
                  onClick={async () => {
                    if (!selectedAppointmentId || !guestEmail) {
                      message.error("Thông tin không hợp lệ");
                      return;
                    }
                    setSendingOtp(true);
                    try {
                      await bookingService.sendOtpForGuestAppointment(selectedAppointmentId, guestEmail);
                      message.success("Đã gửi mã OTP đến email của bạn. Vui lòng kiểm tra hộp thư đến.");
                    } catch (error: any) {
                      message.error(error?.response?.data?.message || "Không thể gửi mã OTP. Vui lòng thử lại.");
                    } finally {
                      setSendingOtp(false);
                    }
                  }}
                  disabled={sendingOtp}
                  fullWidth
                  size="large"
                  sx={{
                    py: 2,
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    minHeight: 56,
                  }}
                >
                  {sendingOtp ? <CircularProgress size={28} /> : "Gửi mã OTP"}
                </Button>
                <TextField
                  label="Nhập mã OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  fullWidth
                  placeholder="Nhập mã OTP 6 chữ số"
                  inputProps={{ maxLength: 6, style: { fontSize: "1.5rem", textAlign: "center", letterSpacing: "0.8rem", fontWeight: 600 } }}
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: "1.5rem",
                      py: 2.5,
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "1.15rem",
                      fontWeight: 600,
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      fontSize: "1.15rem",
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={async () => {
                    if (!otpCode || otpCode.length !== 6) {
                      message.error("Vui lòng nhập mã OTP hợp lệ (6 chữ số)");
                      return;
                    }
                    if (!selectedAppointmentId || !guestEmail) {
                      message.error("Thông tin không hợp lệ");
                      return;
                    }
                    setVerifyingOtp(true);
                    try {
                      const appointment = await bookingService.verifyOtpForGuestAppointment(selectedAppointmentId, guestEmail, otpCode);
                      
                      // Kiểm tra xem appointment có hợp lệ không
                      if (!appointment || !appointment.appointmentId) {
                        throw new Error("Không thể lấy thông tin cuộc hẹn");
                      }
                      
                      // Chỉ mở modal khi verify thành công và có dữ liệu hợp lệ
                      setGuestAppointmentDetail(appointment);
                      setOtpVerified(true);
                      setOtpModalOpen(false);
                      setGuestAppointmentModalOpen(true);
                      message.success("Xác thực thành công!");
                    } catch (error: any) {
                      // Đảm bảo reset state khi có lỗi
                      setGuestAppointmentDetail(null);
                      setOtpVerified(false);
                      setOtpModalOpen(false);
                      setGuestAppointmentModalOpen(false);
                      message.error(error?.response?.data?.message || "Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.");
                    } finally {
                      setVerifyingOtp(false);
                    }
                  }}
                  disabled={verifyingOtp || !otpCode || otpCode.length !== 6}
                  fullWidth
                  size="large"
                  sx={{
                    backgroundColor: "#3b82f6",
                    "&:hover": { backgroundColor: "#2563eb" },
                    py: 2,
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    minHeight: 56,
                  }}
                >
                  {verifyingOtp ? <CircularProgress size={28} sx={{ color: "white" }} /> : "Xác thực"}
                </Button>
              </Box>
            ) : null}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2, gap: 2 }}>
            <Button 
              onClick={() => {
                setOtpModalOpen(false);
                setOtpCode("");
                setOtpVerified(false);
              }}
              size="large"
              sx={{ 
                fontSize: "1.15rem",
                fontWeight: 600,
                py: 1.5,
                px: 3,
              }}
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>

        {/* Guest Appointment Detail Modal */}
        <Dialog
          open={guestAppointmentModalOpen}
          onClose={() => {
            setGuestAppointmentModalOpen(false);
            setGuestAppointmentDetail(null);
            setOtpVerified(false);
          }}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              maxHeight: "95vh",
            }
          }}
        >
          <DialogTitle sx={{ 
            fontWeight: 900, 
            fontSize: "1.85rem", 
            pb: 2,
            borderBottom: "3px solid rgba(255,255,255,0.3)",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 4,
            py: 3,
          }}>
            <Assignment sx={{ fontSize: 36 }} />
            Chi tiết cuộc hẹn
          </DialogTitle>
          <DialogContent 
            sx={{ 
              p: 4,
              overflowY: "auto",
              maxHeight: "calc(95vh - 200px)",
            }}
          >
            {guestAppointmentDetail ? (
              <Stack spacing={4}>
                {/* Header với Status Badge */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 4, borderBottom: "4px solid #e0e0e0" }}>
                  <Box>
                    <MuiTypography variant="h3" sx={{ fontWeight: 900, color: "#1976d2", mb: 1.5, fontSize: "2rem" }}>
                      Mã cuộc hẹn: {guestAppointmentDetail.appointmentId?.substring(0, 8).toUpperCase()}
                    </MuiTypography>
                    <MuiTypography variant="body1" sx={{ color: "#666", fontSize: "1.2rem", fontWeight: 600 }}>
                      Tạo lúc: {moment(guestAppointmentDetail.createdAt).format("DD/MM/YYYY HH:mm")}
                    </MuiTypography>
                  </Box>
                  <Chip
                    icon={<CheckCircle />}
                    label={guestAppointmentDetail.status === "PENDING" ? "Chờ xác nhận" :
                           guestAppointmentDetail.status === "CONFIRMED" ? "Đã xác nhận" :
                           guestAppointmentDetail.status === "IN_PROGRESS" ? "Đang thực hiện" :
                           guestAppointmentDetail.status === "COMPLETED" ? "Hoàn thành" :
                           guestAppointmentDetail.status === "CANCELLED" ? "Đã hủy" : guestAppointmentDetail.status}
                    color={guestAppointmentDetail.status === "PENDING" ? "warning" :
                           guestAppointmentDetail.status === "CONFIRMED" ? "info" :
                           guestAppointmentDetail.status === "IN_PROGRESS" ? "primary" :
                           guestAppointmentDetail.status === "COMPLETED" ? "success" :
                           guestAppointmentDetail.status === "CANCELLED" ? "error" : "default"}
                    sx={{ fontSize: "1.25rem", fontWeight: 800, height: 48, px: 2 }}
                  />
                </Box>

                {/* Thông tin khách hàng - Card */}
                <MuiCard elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
                  <Box sx={{ bgcolor: "#1976d2", color: "white", p: 3.5, display: "flex", alignItems: "center", gap: 2.5 }}>
                    <Person sx={{ fontSize: 48 }} />
                    <MuiTypography variant="h3" sx={{ fontWeight: 900, fontSize: "1.9rem" }}>
                      Thông tin khách hàng
                    </MuiTypography>
                  </Box>
                  <CardContent sx={{ p: 5 }}>
                    <Grid container spacing={4}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 2.5 }}>
                          <Person sx={{ color: "#1976d2", fontSize: 32 }} />
                          <MuiTypography variant="body1" sx={{ color: "#666", fontWeight: 800, fontSize: "1.3rem" }}>Họ và tên</MuiTypography>
                        </Box>
                        <MuiTypography variant="h4" sx={{ fontWeight: 900, color: "#1a1a1a", fontSize: "1.6rem", ml: 7 }}>
                          {guestAppointmentDetail.customerFullName}
                        </MuiTypography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 2.5 }}>
                          <Phone sx={{ color: "#1976d2", fontSize: 32 }} />
                          <MuiTypography variant="body1" sx={{ color: "#666", fontWeight: 800, fontSize: "1.3rem" }}>Số điện thoại</MuiTypography>
                        </Box>
                        <MuiTypography variant="h4" sx={{ fontWeight: 900, color: "#1a1a1a", fontSize: "1.6rem", ml: 7 }}>
                          {guestAppointmentDetail.customerPhoneNumber}
                        </MuiTypography>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 2.5 }}>
                          <Email sx={{ color: "#1976d2", fontSize: 32 }} />
                          <MuiTypography variant="body1" sx={{ color: "#666", fontWeight: 800, fontSize: "1.3rem" }}>Email</MuiTypography>
                        </Box>
                        <MuiTypography variant="h4" sx={{ fontWeight: 900, color: "#1a1a1a", fontSize: "1.6rem", ml: 7 }}>
                          {guestAppointmentDetail.customerEmail}
                        </MuiTypography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </MuiCard>

                {/* Thông tin xe - Card */}
                <MuiCard elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
                  <Box sx={{ bgcolor: "#2e7d32", color: "white", p: 3.5, display: "flex", alignItems: "center", gap: 2.5 }}>
                    <DirectionsCar sx={{ fontSize: 48 }} />
                    <MuiTypography variant="h3" sx={{ fontWeight: 900, fontSize: "1.9rem" }}>
                      Thông tin xe
                    </MuiTypography>
                  </Box>
                  <CardContent sx={{ p: 5 }}>
                    <Grid container spacing={4}>
                      <Grid item xs={12} sm={6}>
                        <MuiTypography variant="body1" sx={{ color: "#666", mb: 2, fontWeight: 800, fontSize: "1.3rem" }}>Tên xe</MuiTypography>
                        <MuiTypography variant="h4" sx={{ fontWeight: 900, color: "#1a1a1a", fontSize: "1.6rem" }}>
                          {guestAppointmentDetail.vehicleTypeResponse?.vehicleTypeName || "Chưa có thông tin"}
                        </MuiTypography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <MuiTypography variant="body1" sx={{ color: "#666", mb: 2, fontWeight: 800, fontSize: "1.3rem" }}>Hãng sản xuất</MuiTypography>
                        <MuiTypography variant="h4" sx={{ fontWeight: 900, color: "#1a1a1a", fontSize: "1.6rem" }}>
                          {guestAppointmentDetail.vehicleTypeResponse?.manufacturer || "Chưa có thông tin"}
                        </MuiTypography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <MuiTypography variant="body1" sx={{ color: "#666", mb: 2, fontWeight: 800, fontSize: "1.3rem" }}>Năm sản xuất</MuiTypography>
                        <MuiTypography variant="h4" sx={{ fontWeight: 900, color: "#1a1a1a", fontSize: "1.6rem" }}>
                          {guestAppointmentDetail.vehicleTypeResponse?.modelYear || "Chưa có thông tin"}
                        </MuiTypography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <MuiTypography variant="body1" sx={{ color: "#666", mb: 2, fontWeight: 800, fontSize: "1.3rem" }}>Biển số xe</MuiTypography>
                        <MuiTypography variant="h4" sx={{ fontWeight: 900, color: "#1976d2", fontSize: "1.6rem", fontFamily: "monospace", letterSpacing: 2 }}>
                          {guestAppointmentDetail.vehicleNumberPlate || "Chưa có thông tin"}
                        </MuiTypography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <MuiTypography variant="body1" sx={{ color: "#666", mb: 2, fontWeight: 800, fontSize: "1.3rem" }}>Số km hiện tại</MuiTypography>
                        <MuiTypography variant="h4" sx={{ fontWeight: 900, color: "#1a1a1a", fontSize: "1.6rem" }}>
                          {guestAppointmentDetail.vehicleKmDistances ? `${parseInt(guestAppointmentDetail.vehicleKmDistances).toLocaleString('vi-VN')} km` : "Chưa có thông tin"}
                        </MuiTypography>
                      </Grid>
                      {guestAppointmentDetail.vehicleTypeResponse?.batteryCapacity && (
                        <Grid item xs={12} sm={6}>
                          <MuiTypography variant="body1" sx={{ color: "#666", mb: 2, fontWeight: 800, fontSize: "1.3rem" }}>Dung lượng pin</MuiTypography>
                          <MuiTypography variant="h4" sx={{ fontWeight: 900, color: "#1a1a1a", fontSize: "1.6rem" }}>
                            {guestAppointmentDetail.vehicleTypeResponse.batteryCapacity} kWh
                          </MuiTypography>
                        </Grid>
                      )}
                      {guestAppointmentDetail.vehicleTypeResponse?.maintenanceIntervalKm && (
                        <Grid item xs={12} sm={6}>
                          <MuiTypography variant="body1" sx={{ color: "#666", mb: 2, fontWeight: 800, fontSize: "1.3rem" }}>Chu kỳ bảo dưỡng (km)</MuiTypography>
                          <MuiTypography variant="h4" sx={{ fontWeight: 900, color: "#1a1a1a", fontSize: "1.6rem" }}>
                            {guestAppointmentDetail.vehicleTypeResponse.maintenanceIntervalKm.toLocaleString('vi-VN')} km
                          </MuiTypography>
                        </Grid>
                      )}
                      {guestAppointmentDetail.vehicleTypeResponse?.maintenanceIntervalMonths && (
                        <Grid item xs={12} sm={6}>
                          <MuiTypography variant="body1" sx={{ color: "#666", mb: 2, fontWeight: 800, fontSize: "1.3rem" }}>Chu kỳ bảo dưỡng (tháng)</MuiTypography>
                          <MuiTypography variant="h4" sx={{ fontWeight: 900, color: "#1a1a1a", fontSize: "1.6rem" }}>
                            {guestAppointmentDetail.vehicleTypeResponse.maintenanceIntervalMonths} tháng
                          </MuiTypography>
                        </Grid>
                      )}
                      {guestAppointmentDetail.vehicleTypeResponse?.description && (
                        <Grid item xs={12}>
                          <MuiTypography variant="body1" sx={{ color: "#666", mb: 2, fontWeight: 800, fontSize: "1.3rem" }}>Mô tả</MuiTypography>
                          <Box sx={{ p: 3, bgcolor: "#f5f5f5", borderRadius: 3, borderLeft: "6px solid #2e7d32" }}>
                            <MuiTypography variant="body1" sx={{ color: "#333", lineHeight: 2, fontSize: "1.2rem" }}>
                              {guestAppointmentDetail.vehicleTypeResponse.description}
                            </MuiTypography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </MuiCard>

                {/* Thông tin cuộc hẹn - Card */}
                <MuiCard elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
                  <Box sx={{ bgcolor: "#9c27b0", color: "white", p: 3.5, display: "flex", alignItems: "center", gap: 2.5 }}>
                    <CalendarToday sx={{ fontSize: 48 }} />
                    <MuiTypography variant="h3" sx={{ fontWeight: 900, fontSize: "1.9rem" }}>
                      Thông tin cuộc hẹn
                    </MuiTypography>
                  </Box>
                  <CardContent sx={{ p: 5 }}>
                    <Grid container spacing={4}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 2.5 }}>
                          <Schedule sx={{ color: "#9c27b0", fontSize: 32 }} />
                          <MuiTypography variant="body1" sx={{ color: "#666", fontWeight: 800, fontSize: "1.3rem" }}>Thời gian hẹn</MuiTypography>
                        </Box>
                        <MuiTypography variant="h4" sx={{ fontWeight: 900, color: "#1a1a1a", fontSize: "1.6rem", ml: 7 }}>
                          {moment(guestAppointmentDetail.scheduledAt).format("DD/MM/YYYY HH:mm")}
                        </MuiTypography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 2.5 }}>
                          <Build sx={{ color: "#9c27b0", fontSize: 32 }} />
                          <MuiTypography variant="body1" sx={{ color: "#666", fontWeight: 800, fontSize: "1.3rem" }}>Hình thức dịch vụ</MuiTypography>
                        </Box>
                        <Box sx={{ ml: 7 }}>
                          <Chip
                            icon={guestAppointmentDetail.serviceMode === "STATIONARY" ? <LocationOn /> : <DirectionsCar />}
                            label={guestAppointmentDetail.serviceMode === "STATIONARY" ? "Tại trạm" : "Di động"}
                            color={guestAppointmentDetail.serviceMode === "STATIONARY" ? "primary" : "success"}
                            sx={{ fontWeight: 800, fontSize: "1.15rem", height: 40 }}
                          />
                        </Box>
                      </Grid>
                      {guestAppointmentDetail.userAddress && (
                        <Grid item xs={12}>
                          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2.5, mb: 2.5 }}>
                            <LocationOn sx={{ color: "#9c27b0", fontSize: 32, mt: 0.5 }} />
                            <Box sx={{ flex: 1 }}>
                              <MuiTypography variant="body1" sx={{ color: "#666", fontWeight: 800, mb: 2, fontSize: "1.3rem" }}>Địa chỉ</MuiTypography>
                              <MuiTypography variant="h4" sx={{ fontWeight: 900, color: "#1a1a1a", fontSize: "1.5rem", lineHeight: 1.8 }}>
                                {guestAppointmentDetail.userAddress}
                              </MuiTypography>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                      {guestAppointmentDetail.quotePrice && (
                        <Grid item xs={12}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 2.5 }}>
                            <AttachMoney sx={{ color: "#f57c00", fontSize: 36 }} />
                            <MuiTypography variant="body1" sx={{ color: "#666", fontWeight: 800, fontSize: "1.3rem" }}>Giá tạm tính</MuiTypography>
                          </Box>
                          <MuiTypography variant="h3" sx={{ fontWeight: 900, color: "#f57c00", ml: 7, fontSize: "1.9rem" }}>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(guestAppointmentDetail.quotePrice)}
                          </MuiTypography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </MuiCard>

                {/* Danh sách dịch vụ - Card với hierarchical structure */}
                {guestAppointmentDetail.serviceTypeResponses && guestAppointmentDetail.serviceTypeResponses.length > 0 && (
                  <MuiCard elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
                    <Box sx={{ bgcolor: "#f57c00", color: "white", p: 4, display: "flex", alignItems: "center", gap: 3 }}>
                      <Build sx={{ fontSize: 52 }} />
                      <MuiTypography variant="h3" sx={{ fontWeight: 900, fontSize: "2rem" }}>
                        Danh sách dịch vụ ({guestAppointmentDetail.serviceTypeResponses.length})
                      </MuiTypography>
                    </Box>
                    <CardContent sx={{ p: 5, maxHeight: "650px", overflowY: "auto" }}>
                      <Stack spacing={4}>
                        {guestAppointmentDetail.serviceTypeResponses.map((parentService: any, parentIndex: number) => {
                          // Debug: Log để kiểm tra children
                          console.log(`Parent Service ${parentIndex + 1}:`, {
                            name: parentService.serviceName,
                            children: parentService.children,
                            childrenLength: parentService.children?.length || 0
                          });
                          
                          return (
                            <Paper
                              key={parentService.serviceTypeId || `parent-${parentIndex}`}
                              elevation={2}
                              sx={{
                                p: 4,
                                bgcolor: "#fff",
                                borderRadius: 3,
                                borderLeft: "8px solid #f57c00",
                                transition: "all 0.3s",
                                "&:hover": {
                                  boxShadow: 4,
                                  transform: "translateX(5px)",
                                },
                              }}
                            >
                              {/* Parent Service */}
                              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 4, mb: parentService.children && parentService.children.length > 0 ? 4 : 0 }}>
                                <Box
                                  sx={{
                                    minWidth: 70,
                                    height: 70,
                                    borderRadius: "50%",
                                    bgcolor: "#f57c00",
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 900,
                                    fontSize: "1.9rem",
                                    flexShrink: 0,
                                  }}
                                >
                                  {parentIndex + 1}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 2.5 }}>
                                    <Chip
                                      label="Dịch vụ chính"
                                      size="medium"
                                      sx={{ 
                                        bgcolor: "#f57c00", 
                                        color: "white", 
                                        fontWeight: 900, 
                                        fontSize: "1.1rem",
                                        height: 36,
                                        px: 1.5
                                      }}
                                    />
                                    {parentService.estimatedDurationMinutes && (
                                      <Chip
                                        label={`${parentService.estimatedDurationMinutes} phút`}
                                        size="medium"
                                        sx={{ fontSize: "1.05rem", height: 36, fontWeight: 800 }}
                                      />
                                    )}
                                  </Box>
                                  <MuiTypography variant="h3" sx={{ fontWeight: 900, color: "#1a1a1a", mb: 2.5, fontSize: "1.8rem" }}>
                                    {parentService.serviceName}
                                  </MuiTypography>
                                  {parentService.description && (
                                    <MuiTypography variant="body1" sx={{ color: "#666", lineHeight: 2.2, fontSize: "1.25rem", mb: 2.5 }}>
                                      {parentService.description}
                                    </MuiTypography>
                                  )}
                                  
                                  {/* Children Services - Sửa lỗi hiển thị */}
                                  {parentService.children && Array.isArray(parentService.children) && parentService.children.length > 0 ? (
                                    <Box sx={{ mt: 4, ml: 3, pl: 5, borderLeft: "6px solid #e0e0e0", bgcolor: "#fafafa", borderRadius: 3, p: 3.5 }}>
                                      <MuiTypography variant="h6" sx={{ color: "#666", fontWeight: 900, mb: 3, fontSize: "1.3rem" }}>
                                        Dịch vụ đã chọn ({parentService.children.length}):
                                      </MuiTypography>
                                      <Stack spacing={3}>
                                        {parentService.children.map((childService: any, childIndex: number) => {
                                          console.log(`Child Service ${parentIndex + 1}.${childIndex + 1}:`, childService);
                                          return (
                                            <Paper
                                              key={childService?.serviceTypeId || `child-${parentIndex}-${childIndex}`}
                                              elevation={1}
                                              sx={{
                                                p: 3.5,
                                                bgcolor: "#fff",
                                                borderRadius: 3,
                                                borderLeft: "6px solid #4caf50",
                                              }}
                                            >
                                              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3 }}>
                                                <Box
                                                  sx={{
                                                    minWidth: 50,
                                                    height: 50,
                                                    borderRadius: "50%",
                                                    bgcolor: "#4caf50",
                                                    color: "white",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontWeight: 900,
                                                    fontSize: "1.3rem",
                                                    flexShrink: 0,
                                                  }}
                                                >
                                                  {parentIndex + 1}.{childIndex + 1}
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                  <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 2 }}>
                                                    <Chip
                                                      label="Dịch vụ con"
                                                      size="medium"
                                                      sx={{ 
                                                        bgcolor: "#4caf50", 
                                                        color: "white", 
                                                        fontWeight: 900, 
                                                        fontSize: "1.05rem",
                                                        height: 32,
                                                        px: 1.5
                                                      }}
                                                    />
                                                    {childService?.estimatedDurationMinutes && (
                                                      <Chip
                                                        label={`${childService.estimatedDurationMinutes} phút`}
                                                        size="medium"
                                                        sx={{ fontSize: "1.05rem", height: 32, fontWeight: 800 }}
                                                      />
                                                    )}
                                                  </Box>
                                                  <MuiTypography variant="h4" sx={{ fontWeight: 900, color: "#1a1a1a", mb: 2, fontSize: "1.6rem" }}>
                                                    {childService?.serviceName || "Tên dịch vụ không có"}
                                                  </MuiTypography>
                                                  {childService?.description && (
                                                    <MuiTypography variant="body1" sx={{ color: "#666", lineHeight: 2, fontSize: "1.2rem" }}>
                                                      {childService.description}
                                                    </MuiTypography>
                                                  )}
                                                </Box>
                                              </Box>
                                            </Paper>
                                          );
                                        })}
                                      </Stack>
                                    </Box>
                                  ) : null}
                                </Box>
                              </Box>
                            </Paper>
                          );
                        })}
                      </Stack>
                    </CardContent>
                  </MuiCard>
                )}

                {/* Thông tin bổ sung - Kỹ thuật viên, Người phụ trách */}
                {(guestAppointmentDetail.technicianResponses?.length > 0 || guestAppointmentDetail.assignee) && (
                  <MuiCard elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
                    <Box sx={{ bgcolor: "#546e7a", color: "white", p: 3.5, display: "flex", alignItems: "center", gap: 2.5 }}>
                      <Assignment sx={{ fontSize: 48 }} />
                      <MuiTypography variant="h3" sx={{ fontWeight: 900, fontSize: "1.9rem" }}>
                        Nhân viên phụ trách
                      </MuiTypography>
                    </Box>
                    <CardContent sx={{ p: 5 }}>
                      <Stack spacing={4}>
                        {guestAppointmentDetail.assignee && (
                          <Box>
                            <MuiTypography variant="body1" sx={{ color: "#666", fontWeight: 800, mb: 2, fontSize: "1.3rem" }}>
                              Người phân công
                            </MuiTypography>
                            <MuiTypography variant="h4" sx={{ fontWeight: 900, color: "#1a1a1a", fontSize: "1.6rem" }}>
                              {guestAppointmentDetail.assignee.fullName || guestAppointmentDetail.assignee.email}
                            </MuiTypography>
                          </Box>
                        )}
                        {guestAppointmentDetail.technicianResponses && guestAppointmentDetail.technicianResponses.length > 0 && (
                          <Box>
                            <MuiTypography variant="body1" sx={{ color: "#666", fontWeight: 800, mb: 2.5, fontSize: "1.3rem" }}>
                              Kỹ thuật viên ({guestAppointmentDetail.technicianResponses.length})
                            </MuiTypography>
                            <Stack spacing={2} direction="row" flexWrap="wrap">
                              {guestAppointmentDetail.technicianResponses.map((tech: any) => (
                                <Chip
                                  key={tech.userId}
                                  label={tech.fullName || tech.email}
                                  size="medium"
                                  sx={{ fontSize: "1.15rem", height: 40, fontWeight: 800 }}
                                />
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </MuiCard>
                )}

                {/* Ghi chú - Card */}
                {guestAppointmentDetail.notes && (
                  <MuiCard elevation={3} sx={{ borderRadius: 3, overflow: "hidden", bgcolor: "#fff8e1" }}>
                    <Box sx={{ bgcolor: "#ff9800", color: "white", p: 3.5, display: "flex", alignItems: "center", gap: 2.5 }}>
                      <Info sx={{ fontSize: 48 }} />
                      <MuiTypography variant="h3" sx={{ fontWeight: 900, fontSize: "1.9rem" }}>
                        Ghi chú
                      </MuiTypography>
                    </Box>
                    <CardContent sx={{ p: 5 }}>
                      <MuiTypography variant="body1" sx={{ color: "#333", lineHeight: 2.2, whiteSpace: "pre-wrap", fontSize: "1.3rem" }}>
                        {guestAppointmentDetail.notes}
                      </MuiTypography>
                    </CardContent>
                  </MuiCard>
                )}

                {/* Thông tin hệ thống */}
                <Paper elevation={1} sx={{ p: 4, bgcolor: "#f5f5f5", borderRadius: 3 }}>
                  <Grid container spacing={4}>
                    <Grid item xs={12} sm={6}>
                      <MuiTypography variant="body1" sx={{ color: "#999", display: "block", mb: 2, fontWeight: 800, fontSize: "1.15rem" }}>
                        Ngày tạo
                      </MuiTypography>
                      <MuiTypography variant="body1" sx={{ color: "#666", fontWeight: 800, fontSize: "1.2rem" }}>
                        {moment(guestAppointmentDetail.createdAt).format("DD/MM/YYYY HH:mm:ss")}
                      </MuiTypography>
                    </Grid>
                    {guestAppointmentDetail.updatedAt && (
                      <Grid item xs={12} sm={6}>
                        <MuiTypography variant="body1" sx={{ color: "#999", display: "block", mb: 2, fontWeight: 800, fontSize: "1.15rem" }}>
                          Cập nhật lần cuối
                        </MuiTypography>
                        <MuiTypography variant="body1" sx={{ color: "#666", fontWeight: 800, fontSize: "1.2rem" }}>
                          {moment(guestAppointmentDetail.updatedAt).format("DD/MM/YYYY HH:mm:ss")}
                        </MuiTypography>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Stack>
            ) : (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 4, borderTop: "2px solid #e0e0e0", gap: 2 }}>
            <Button 
              onClick={() => {
                setGuestAppointmentModalOpen(false);
                setGuestAppointmentDetail(null);
                setOtpVerified(false);
              }}
              variant="outlined"
              startIcon={<Close />}
              size="large"
              sx={{
                minWidth: 120,
                borderColor: "#d0d0d0",
                color: "#666",
                fontSize: "1.15rem",
                fontWeight: 700,
                py: 1.5,
                px: 3,
                "&:hover": {
                  borderColor: "#999",
                  bgcolor: "#f5f5f5",
                },
              }}
            >
              Đóng
            </Button>
            {guestAppointmentDetail?.status === "PENDING" && (
              <Button
                variant="contained"
                startIcon={<Edit />}
                size="large"
                onClick={() => {
                  // Navigate to edit page with appointment ID, guest mode, and store OTP info in sessionStorage
                  if (selectedAppointmentId && guestEmail && otpCode) {
                    sessionStorage.setItem("guestAppointmentEdit", JSON.stringify({
                      appointmentId: selectedAppointmentId,
                      email: guestEmail,
                      otp: otpCode
                    }));
                    setGuestAppointmentModalOpen(false);
                    navigate(`/client/booking?appointmentId=${selectedAppointmentId}&mode=edit&guest=true`);
                  } else {
                    message.error("Thông tin xác thực không đầy đủ. Vui lòng xác thực lại OTP.");
                  }
                }}
                sx={{
                  backgroundColor: "#1976d2",
                  minWidth: 160,
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  py: 1.5,
                  px: 3,
                  "&:hover": { 
                    backgroundColor: "#1565c0",
                    boxShadow: 2,
                  },
                }}
              >
                Chỉnh sửa
              </Button>
            )}
          </DialogActions>
        </Dialog>
        </Card>
      </div>
    </div>
  );
};

export default LookupAppointmentsPage;



