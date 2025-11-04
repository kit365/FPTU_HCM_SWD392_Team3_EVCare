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
  Construction,
} from "@mui/icons-material";
import QRCode from "react-qr-code";
import { useInvoice } from "../../hooks/useInvoice";
import type { UserAppointment } from "../../types/booking.types";

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
  const [warrantyModalVisible, setWarrantyModalVisible] = useState<boolean>(false);
  const [selectedOriginalAppointment, setSelectedOriginalAppointment] = useState<AppointmentRow | null>(null);
  const [creatingWarranty, setCreatingWarranty] = useState<boolean>(false);

  // Load invoice when modal opens (chỉ load 1 lần khi modal mở)
  useEffect(() => {
    if (invoiceModalOpen && selectedAppointmentId) {
      console.log("📄 Loading invoice for appointment:", selectedAppointmentId);
      // Chỉ load invoice khi modal mở, không load lại khi polling
      if (!openQrDialog) {
        getByAppointmentId(selectedAppointmentId).catch(error => {
          console.error("❌ Error loading invoice:", error);
        });
      }
    }
  }, [invoiceModalOpen, selectedAppointmentId]);

  useEffect(() => {
    if (invoice) {
      console.log("💰 Invoice loaded:", invoice);
      console.log("📋 Maintenance details:", invoice.maintenanceDetails);
      console.log("📋 Maintenance details type:", typeof invoice.maintenanceDetails, Array.isArray(invoice.maintenanceDetails));
      setPaidAmount(invoice.totalAmount);
    }
  }, [invoice]);

  const previousStatusRef = useRef<string | undefined>(undefined);
  
  useEffect(() => {
    // Chỉ xử lý khi có invoice và QR dialog đang mở (đang chờ thanh toán)
    if (!invoice || !openQrDialog) {
      return;
    }
    
    if (previousStatusRef.current !== invoice.status) {
      previousStatusRef.current = invoice.status;
    }
    
    if (invoice.status === "PAID" && !hasNavigatedRef.current) {
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
      
      const appointmentIdToNavigate = selectedAppointmentId;
      const currentUser = user; // Lưu user vào biến local để tránh closure issue
      
      setOpenQrDialog(false);
      setPaymentUrl(null);
      setInvoiceModalOpen(false);
      setSelectedAppointmentId(null);
      
      // Reload appointment list
      fetchData(page, pageSize, keyword);
      
      // Navigate sau khi đã clear state
      // Nếu user đã đăng nhập: quay về trang lịch sử appointment
      // Nếu là khách vãng lai: quay về trang chủ
      setTimeout(() => {
        if (currentUser) {
          navigate(`/client/appointment-history`, { replace: true });
        } else {
          navigate(`/`, { replace: true });
        }
      }, 100);
    }
  }, [invoice?.status, openQrDialog, navigate, selectedAppointmentId, page, pageSize, keyword, user]);

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

  const handleRequestWarranty = (record: AppointmentRow) => {
    if (!user?.userId) {
      message.warning("Vui lòng đăng nhập để yêu cầu bảo hành");
      return;
    }
    setSelectedOriginalAppointment(record);
    setWarrantyModalVisible(true);
  };

  const handleCreateWarrantyAppointment = async () => {
    if (!selectedOriginalAppointment || !user?.userId) {
      message.error("Thông tin không đầy đủ");
      return;
    }

    try {
      setCreatingWarranty(true);
      const appointmentDetail = await bookingService.getAppointmentById(selectedOriginalAppointment.appointmentId);
      const appointmentData = appointmentDetail.data.data;

      const warrantyAppointmentData = {
        customerId: user.userId,
        customerFullName: selectedOriginalAppointment.customerFullName,
        customerPhoneNumber: selectedOriginalAppointment.customerPhoneNumber,
        customerEmail: selectedOriginalAppointment.customerEmail,
        vehicleTypeId: appointmentData.vehicleTypeResponse?.vehicleTypeId || "",
        vehicleNumberPlate: selectedOriginalAppointment.vehicleNumberPlate,
        vehicleKmDistances: appointmentData.vehicleKmDistances || "",
        userAddress: appointmentData.userAddress || "",
        serviceMode: appointmentData.serviceMode || "STATIONARY",
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mặc định 1 ngày sau
        notes: `Yêu cầu bảo hành cho appointment ${selectedOriginalAppointment.appointmentId}`,
        serviceTypeIds: appointmentData.serviceTypeResponses?.map((s: any) => s.serviceTypeId) || [],
        isWarrantyAppointment: true,
        originalAppointmentId: selectedOriginalAppointment.appointmentId,
      };

      await bookingService.createAppointment(warrantyAppointmentData);
      
      message.success("Đã tạo yêu cầu bảo hành thành công!");
      setWarrantyModalVisible(false);
      setSelectedOriginalAppointment(null);
      fetchData(page, pageSize, keyword);
    } catch (error: any) {
      console.error("Error creating warranty appointment:", error);
      message.error(error?.response?.data?.message || "Không thể tạo yêu cầu bảo hành. Vui lòng thử lại.");
    } finally {
      setCreatingWarranty(false);
    }
  };

  const handleCloseInvoiceModal = () => {
    // Dừng tất cả polling trước khi đóng modal
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    pollingStartTimeRef.current = null;
    
    setInvoiceModalOpen(false);
    setSelectedAppointmentId(null);
    setOpenPayDialog(false);
    setOpenQrDialog(false);
    setPaymentUrl(null);
    setPaymentMethod("VNPAY");
    setNotes("");
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
    // Chỉ check khi QR dialog đang mở (đang chờ thanh toán)
    if (!openQrDialog || !selectedAppointmentId) {
      return;
    }
    
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
    // Chỉ start polling khi QR dialog đang mở
    if (!openQrDialog) {
      console.log("⚠️ Cannot start polling: QR dialog is not open");
      return;
    }
    
    // Clear existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
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
      // Kiểm tra lại xem QR dialog vẫn đang mở không
      if (openQrDialog && selectedAppointmentId) {
        checkPaymentStatus();
      } else {
        // Nếu dialog đã đóng, dừng polling
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    };
    
    // Poll mỗi 3 giây thay vì 1.5 giây để giảm tải
    pollingIntervalRef.current = setInterval(checkStatus, 3000);
  };

  const handlePayment = async () => {
    if (!invoice || !selectedAppointmentId) return;
    
    // Chỉ hỗ trợ thanh toán qua VNPay
    if (paymentMethod !== "VNPAY") {
      message.error("Chỉ hỗ trợ thanh toán qua VNPay");
      return;
    }
    
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
            <>
              <Button
                type="link"
                size="small"
                icon={<Receipt />}
                onClick={() => handleViewInvoice(record.appointmentId)}
                style={{ padding: 0, fontSize: "13px" }}
              >
                Hóa đơn
              </Button>
              <Button
                type="link"
                size="small"
                icon={<Construction />}
                onClick={() => handleRequestWarranty(record)}
                style={{ padding: 0, color: "#f59e0b", fontSize: "13px" }}
              >
                Yêu cầu bảo hành
              </Button>
            </>
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
          <DialogTitle sx={{ fontWeight: 600, fontSize: "1.75rem" }}>
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
                  <MuiTypography variant="h6" sx={{ fontWeight: 600, mb: 1.5, fontSize: "1.4rem" }}>
                    Thông tin khách hàng
                  </MuiTypography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                    <Box>
                      <MuiTypography variant="body2" color="text.secondary" sx={{ fontSize: "1.1rem" }}>Tên khách hàng:</MuiTypography>
                      <MuiTypography variant="body1" sx={{ fontWeight: 600, fontSize: "1.2rem" }}>{invoice.customerName || "N/A"}</MuiTypography>
                    </Box>
                    <Box>
                      <MuiTypography variant="body2" color="text.secondary" sx={{ fontSize: "1.1rem" }}>Email:</MuiTypography>
                      <MuiTypography variant="body1" sx={{ fontWeight: 600, fontSize: "1.2rem" }}>{invoice.customerEmail || "N/A"}</MuiTypography>
                    </Box>
                    <Box>
                      <MuiTypography variant="body2" color="text.secondary" sx={{ fontSize: "1.1rem" }}>Số điện thoại:</MuiTypography>
                      <MuiTypography variant="body1" sx={{ fontWeight: 600, fontSize: "1.2rem" }}>{invoice.customerPhone || "N/A"}</MuiTypography>
                    </Box>
                  </Box>
                </Box>

                {/* Vehicle Info */}
                {invoice.vehicleNumberPlate && (
                  <Box sx={{ p: 2, borderBottom: "1px solid #e5e7eb", mb: 2 }}>
                    <MuiTypography variant="h6" sx={{ fontWeight: 600, mb: 1.5, fontSize: "1.4rem" }}>
                      Thông tin xe
                    </MuiTypography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                      <Box>
                        <MuiTypography variant="body2" color="text.secondary" sx={{ fontSize: "1.1rem" }}>Biển số xe:</MuiTypography>
                        <MuiTypography variant="body1" sx={{ fontWeight: 600, fontSize: "1.2rem" }}>{invoice.vehicleNumberPlate}</MuiTypography>
                      </Box>
                      {invoice.vehicleTypeName && (
                        <Box>
                          <MuiTypography variant="body2" color="text.secondary" sx={{ fontSize: "1.1rem" }}>Loại xe:</MuiTypography>
                          <MuiTypography variant="body1" sx={{ fontWeight: 600, fontSize: "1.2rem" }}>
                            {invoice.vehicleTypeName} {invoice.vehicleManufacturer ? `(${invoice.vehicleManufacturer})` : ""}
                          </MuiTypography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Services & Parts */}
                {(() => {
                  try {
                    if (!invoice.maintenanceDetails || !Array.isArray(invoice.maintenanceDetails) || invoice.maintenanceDetails.length === 0) {
                      return (
                        <Box sx={{ p: 2, borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb", mb: 2 }}>
                          <MuiTypography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", fontSize: "1.1rem" }}>
                            Chưa có thông tin dịch vụ và phụ tùng
                          </MuiTypography>
                        </Box>
                      );
                    }

                    return (
                      <Box sx={{ p: 2, borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb", mb: 2 }}>
                        <MuiTypography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: "1.4rem" }}>
                          Chi tiết dịch vụ & phụ tùng
                        </MuiTypography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          {invoice.maintenanceDetails.map((maintenance, index) => {
                            if (!maintenance) return null;
                            
                            return (
                              <Paper key={`maintenance-${index}`} elevation={0} sx={{ p: 2, backgroundColor: "#fff", borderRadius: 1, border: "1px solid #e5e7eb" }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                                  <MuiTypography variant="body1" sx={{ fontWeight: 600, color: "#3b82f6", fontSize: "1.2rem" }}>
                                    {index + 1}. {maintenance.serviceName || "N/A"}
                                  </MuiTypography>
                                  <MuiTypography variant="body1" sx={{ fontWeight: 600, fontSize: "1.2rem" }}>
                                    {formatCurrency(maintenance.serviceCost || 0)}
                                  </MuiTypography>
                                </Box>
                                {maintenance.partsUsed && Array.isArray(maintenance.partsUsed) && maintenance.partsUsed.length > 0 ? (
                                  <Box sx={{ mt: 1.5 }}>
                                    <MuiTypography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1, fontWeight: 600, fontSize: "1rem" }}>
                                      Phụ tùng sử dụng:
                                    </MuiTypography>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                      {maintenance.partsUsed.map((part, partIndex) => {
                                        if (!part) return null;
                                        
                                        return (
                                          <Box
                                            key={`part-${index}-${partIndex}`}
                                            sx={{
                                              display: "flex",
                                              justifyContent: "space-between",
                                              alignItems: "flex-start",
                                              py: 1,
                                              px: 1.5,
                                              backgroundColor: "#f9fafb",
                                              borderRadius: 1,
                                              border: "1px solid #e5e7eb",
                                            }}
                                          >
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, flexWrap: "wrap" }}>
                                              <MuiTypography variant="body2" sx={{ fontSize: "1.05rem" }}>
                                                • {part.partName || "N/A"}
                                              </MuiTypography>
                                              {part.quantity != null && (
                                                <MuiTypography variant="caption" color="text.secondary" sx={{ fontSize: "0.95rem" }}>
                                                  (SL: {part.quantity})
                                                </MuiTypography>
                                              )}
                                              {(part as any)?.isUnderWarranty && (
                                                <Chip
                                                  label="Bảo hành"
                                                  size="small"
                                                  sx={{
                                                    backgroundColor: "#dcfce7",
                                                    color: "#166534",
                                                    fontSize: "0.85rem",
                                                    height: "24px",
                                                    fontWeight: 600,
                                                  }}
                                                />
                                              )}
                                            </Box>
                                            <Box sx={{ textAlign: "right", minWidth: "120px", flexShrink: 0 }}>
                                              {(part as any)?.isUnderWarranty && (part as any)?.originalPrice ? (
                                                <Box>
                                                  <MuiTypography variant="caption" sx={{ textDecoration: "line-through", color: "#9ca3af", fontSize: "0.9rem", display: "block" }}>
                                                    {formatCurrency((part as any).originalPrice)}
                                                  </MuiTypography>
                                                  <MuiTypography variant="body2" sx={{ fontWeight: 600, color: "#10b981", fontSize: "1.05rem" }}>
                                                    {formatCurrency(part.totalPrice || 0)}
                                                  </MuiTypography>
                                                </Box>
                                              ) : (
                                                <MuiTypography variant="body2" sx={{ fontWeight: 600, fontSize: "1.05rem" }}>
                                                  {formatCurrency(part.totalPrice || 0)}
                                                </MuiTypography>
                                              )}
                                            </Box>
                                          </Box>
                                        );
                                      })}
                                    </Box>
                                  </Box>
                                ) : (
                                  <MuiTypography variant="caption" color="text.secondary" sx={{ fontSize: "1rem", fontStyle: "italic" }}>
                                    Không có phụ tùng
                                  </MuiTypography>
                                )}
                              </Paper>
                            );
                          })}
                        </Box>
                      </Box>
                    );
                  } catch (error) {
                    console.error("Error rendering maintenance details:", error);
                    return (
                      <Box sx={{ p: 2, borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb", mb: 2 }}>
                        <Alert severity="error">
                          Lỗi khi hiển thị chi tiết dịch vụ. Vui lòng thử lại sau.
                        </Alert>
                      </Box>
                    );
                  }
                })()}

                {/* Total */}
                <Box sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <MuiTypography variant="h6" sx={{ fontWeight: 600, fontSize: "1.5rem" }}>
                      Tổng cộng:
                    </MuiTypography>
                    <MuiTypography variant="h6" sx={{ fontWeight: 700, color: "primary.main", fontSize: "1.5rem" }}>
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
            <Button onClick={handleCloseInvoiceModal} sx={{ fontSize: "1.15rem", py: 1.5, px: 3 }}>Đóng</Button>
          </DialogActions>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={openPayDialog} onClose={handleClosePayDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600, fontSize: "1.75rem" }}>
            Xác nhận thanh toán
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
              <Alert severity="info" sx={{ fontSize: "1.1rem" }}>
                Tổng tiền cần thanh toán: <strong style={{ fontSize: "1.2rem" }}>{invoice ? formatCurrency(invoice.totalAmount) : "0 ₫"}</strong>
              </Alert>
              
              <Alert severity="info" sx={{ fontSize: "1.1rem" }}>
                Phương thức thanh toán: <strong style={{ fontSize: "1.15rem" }}>Thanh toán qua VNPay</strong>
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClosePayDialog} disabled={paying} sx={{ fontSize: "1.15rem", py: 1.5, px: 3 }}>
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handlePayment}
              disabled={paying}
              startIcon={paying ? <CircularProgress size={20} /> : <Payment />}
              sx={{
                backgroundColor: "#3b82f6",
                fontSize: "1.15rem",
                py: 1.5,
                px: 3,
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
          <DialogTitle sx={{ fontWeight: 600, fontSize: "1.75rem", textAlign: "center" }}>
            Quét mã QR để thanh toán
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, py: 2 }}>
              <Alert severity="info" sx={{ width: "100%", fontSize: "1.1rem", "& strong": { fontSize: "1.15rem" } }}>
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
                  <MuiTypography variant="body2" color="text.secondary" sx={{ fontSize: "1.1rem" }}>
                    Đang tạo mã QR...
                  </MuiTypography>
                </Box>
              )}

              {paymentUrl && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}>
                  <MuiTypography variant="body2" color="text.secondary" sx={{ textAlign: "center", fontSize: "1.1rem" }}>
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
                      fontSize: "1.15rem",
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
                    <MuiTypography variant="body2" color="text.secondary" sx={{ fontSize: "1.1rem" }}>
                      Đang chờ thanh toán...
                    </MuiTypography>
                  </Box>
                  {pollingStartTimeRef.current && (
                    <MuiTypography variant="caption" color="text.secondary" sx={{ fontSize: "1rem" }}>
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
            <Button onClick={handleCloseQrDialog} variant="outlined" sx={{ fontSize: "1.15rem", py: 1.5, px: 3 }}>
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
                      const appointmentResponse = await bookingService.verifyOtpForGuestAppointment(selectedAppointmentId, guestEmail, otpCode);
                      
                      // appointmentResponse là appointment data trực tiếp từ API
                      const appointmentData = appointmentResponse;
                      
                      // Debug: log để kiểm tra quotePrice
                      console.log("🔍 Appointment data from API:", appointmentData);
                      console.log("💰 QuotePrice from API:", appointmentData?.quotePrice, typeof appointmentData?.quotePrice);
                      
                      // Kiểm tra xem appointment có hợp lệ không
                      if (!appointmentData || !appointmentData.appointmentId) {
                        throw new Error("Không thể lấy thông tin cuộc hẹn");
                      }
                      
                      // Convert quotePrice: giữ nguyên nếu là số, convert null/undefined thành 0
                      const quotePrice = appointmentData.quotePrice != null ? Number(appointmentData.quotePrice) : 0;
                      
                      // Convert appointment response to UserAppointment format
                      const userAppointment: UserAppointment = {
                        appointmentId: appointmentData.appointmentId,
                        customerFullName: appointmentData.customerFullName,
                        customerPhoneNumber: appointmentData.customerPhoneNumber,
                        customerEmail: appointmentData.customerEmail,
                        vehicleNumberPlate: appointmentData.vehicleNumberPlate,
                        vehicleKmDistances: appointmentData.vehicleKmDistances || "",
                        userAddress: appointmentData.userAddress || "",
                        serviceMode: appointmentData.serviceMode,
                        status: appointmentData.status,
                        scheduledAt: appointmentData.scheduledAt,
                        quotePrice: quotePrice,
                        notes: appointmentData.notes || "",
                        vehicleTypeResponse: appointmentData.vehicleTypeResponse || {
                          vehicleTypeId: "",
                          vehicleTypeName: "",
                          manufacturer: "",
                          modelYear: 0,
                        },
                        serviceTypeResponses: appointmentData.serviceTypeResponses || [],
                        technicianResponses: appointmentData.technicianResponses || [],
                        isWarrantyAppointment: appointmentData.isWarrantyAppointment || false,
                        originalAppointment: appointmentData.originalAppointment || undefined,
                      };
                      
                      // Debug: log để kiểm tra quotePrice trước khi lưu
                      console.log("💾 Saving to sessionStorage - quotePrice:", userAppointment.quotePrice);
                      
                      // Lưu appointment data vào sessionStorage để trang chi tiết có thể sử dụng
                      sessionStorage.setItem(`guestAppointment_${selectedAppointmentId}`, JSON.stringify({
                        appointment: userAppointment,
                        email: guestEmail,
                        verifiedAt: new Date().toISOString()
                      }));
                      
                      // Lưu OTP và email để dùng khi chỉnh sửa appointment
                      sessionStorage.setItem("guestAppointmentEdit", JSON.stringify({
                        email: guestEmail,
                        otp: otpCode
                      }));
                      
                      // Đóng modal và chuyển đến trang chi tiết cuộc hẹn
                      setOtpModalOpen(false);
                      setOtpCode("");
                      message.success("Xác thực thành công!");
                      
                      // Chuyển đến trang chi tiết cuộc hẹn (tương tự như user đã đăng nhập)
                      navigate(`/client/appointment/${selectedAppointmentId}`);
                    } catch (error: any) {
                      // Đảm bảo reset state khi có lỗi
                      setOtpModalOpen(false);
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
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2, gap: 2 }}>
            <Button 
              onClick={() => {
                setOtpModalOpen(false);
                setOtpCode("");
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

        {/* Warranty Appointment Modal */}
        <Dialog
          open={warrantyModalVisible}
          onClose={() => {
            setWarrantyModalVisible(false);
            setSelectedOriginalAppointment(null);
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 600, fontSize: "1.25rem" }}>
            Yêu cầu bảo hành
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Bạn đang yêu cầu bảo hành cho appointment đã hoàn thành. Appointment bảo hành sẽ được tạo với cùng thông tin dịch vụ và phụ tùng như appointment gốc.
              </Alert>
              {selectedOriginalAppointment && (
                <Box sx={{ p: 2, bgcolor: "#f0f0f0", borderRadius: 2, mb: 2 }}>
                  <MuiTypography variant="body2" sx={{ color: "#666", mb: 1 }}>
                    <strong>Appointment gốc:</strong> {selectedOriginalAppointment.appointmentId.substring(0, 8).toUpperCase()}
                  </MuiTypography>
                  <MuiTypography variant="body2" sx={{ color: "#666" }}>
                    <strong>Ngày hoàn thành:</strong> {moment(selectedOriginalAppointment.scheduledAt).format("DD/MM/YYYY HH:mm")}
                  </MuiTypography>
                </Box>
              )}
              <MuiTypography variant="body2" sx={{ color: "#666" }}>
                Appointment bảo hành sẽ được tạo với status PENDING và chờ xác nhận từ nhân viên.
              </MuiTypography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => {
                setWarrantyModalVisible(false);
                setSelectedOriginalAppointment(null);
              }}
              disabled={creatingWarranty}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateWarrantyAppointment}
              disabled={creatingWarranty}
              startIcon={creatingWarranty ? <CircularProgress size={20} /> : <Construction />}
              sx={{
                backgroundColor: "#f59e0b",
                "&:hover": {
                  backgroundColor: "#d97706",
                },
              }}
            >
              {creatingWarranty ? "Đang tạo..." : "Tạo yêu cầu bảo hành"}
            </Button>
          </DialogActions>
        </Dialog>
        </Card>
      </div>
    </div>
  );
};

export default LookupAppointmentsPage;



