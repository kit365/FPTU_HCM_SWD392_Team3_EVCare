import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  Button,
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
} from "@mui/material";
import { ArrowBack, Receipt, Payment, Close } from "@mui/icons-material";
import { Snackbar, IconButton } from "@mui/material";
import QRCode from "react-qr-code";
import { useInvoice } from "../../../hooks/useInvoice";
import moment from "moment";

export const ClientInvoiceView = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { invoice, loading, paying, getByAppointmentId, payCash, createVnPayPayment } = useInvoice();

  const [openPayDialog, setOpenPayDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("VNPAY");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  interface SnackbarState {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info'
  });
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasNavigatedRef = useRef<boolean>(false);
  const isCheckingRef = useRef<boolean>(false);
  const retryCountRef = useRef<number>(0);
  const MAX_RETRY_ATTEMPTS = 3;

  useEffect(() => {
    if (appointmentId) {
      getByAppointmentId(appointmentId);
    }
  }, [appointmentId]);

  useEffect(() => {
    if (invoice) {
      setPaidAmount(invoice.totalAmount);
    }
  }, [invoice]);

  const previousStatusRef = useRef<string | undefined>(undefined);

  // Hàm dừng polling
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  };

  // Xử lý khi nhận được status mới từ invoice
  useEffect(() => {
    if (!invoice) return;

    // Log thay đổi status
    if (previousStatusRef.current !== invoice.status) {
      console.log("📊 Invoice status changed:", {
        previous: previousStatusRef.current,
        current: invoice.status,
        openQrDialog,
        hasNavigated: hasNavigatedRef.current
      });
      previousStatusRef.current = invoice.status;
    }

    // Chỉ xử lý nếu đang mở QR dialog và chưa navigate
    if (!openQrDialog || hasNavigatedRef.current) return;

    // Xử lý các trạng thái khác nhau
    switch (invoice.status) {
      case "PAID":
        console.log("✅ Invoice PAID detected, navigating to success page");
        hasNavigatedRef.current = true;
        stopPolling();
        setOpenQrDialog(false);
        setPaymentUrl(null);
        navigate(`/client/payment/success?appointmentId=${appointmentId}`, { replace: true });
        break;

      case "CANCELLED":
      case "FAILED":
        console.log(`❌ Invoice ${invoice.status}, navigating to fail page`);
        hasNavigatedRef.current = true;
        stopPolling();
        setOpenQrDialog(false);
        setPaymentUrl(null);
        navigate(`/client/payment/fail?appointmentId=${appointmentId}`, { replace: true });
        break;

      // Các trạng thái khác (PENDING, v.v.) không cần xử lý đặc biệt
    }
  }, [invoice, appointmentId, navigate, openQrDialog]);

  // Dọn dẹp khi component unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  const handleOpenPayDialog = () => {
    setOpenPayDialog(true);
  };

  const handleClosePayDialog = () => {
    setOpenPayDialog(false);
    setPaymentMethod("VNPAY");
    setNotes("");
  };

  const handleCloseQrDialog = () => {
    // Dừng polling
    stopPolling();

    // Reset state
    setOpenQrDialog(false);
    setPaymentUrl(null);
    hasNavigatedRef.current = false;

    // Refresh invoice data
    if (appointmentId) {
      getByAppointmentId(appointmentId);
    }
  };

  const checkPaymentStatus = async () => {
    if (!appointmentId || isCheckingRef.current) return;

    try {
      isCheckingRef.current = true;
      await getByAppointmentId(appointmentId);
      // Reset retry count on successful fetch
      retryCountRef.current = 0;
    } catch (error) {
      console.error("Error checking payment status:", error);

      // Tăng số lần thử lại
      retryCountRef.current += 1;

      if (retryCountRef.current >= MAX_RETRY_ATTEMPTS) {
        console.error(`Max retry attempts (${MAX_RETRY_ATTEMPTS}) reached. Stopping polling.`);
        stopPolling();
        setOpenQrDialog(false);
        alert("Không thể kiểm tra trạng thái thanh toán. Vui lòng kiểm tra kết nối mạng và thử lại.");
        return;
      }

      // Thử lại sau 5s
      console.log(`Retrying... (${retryCountRef.current}/${MAX_RETRY_ATTEMPTS})`);
      setTimeout(() => {
        if (!hasNavigatedRef.current) {
          checkPaymentStatus();
        }
      }, 5000);
    } finally {
      isCheckingRef.current = false;
    }
  };

  const startPolling = () => {
    // Dừng polling cũ nếu có
    stopPolling();

    // Reset trạng thái
    hasNavigatedRef.current = false;
    retryCountRef.current = 0;

    // Bắt đầu polling mới
    const checkStatus = () => {
      if (!hasNavigatedRef.current) {
        checkPaymentStatus();
      }
    };

    // Thực hiện lần đầu tiên ngay lập tức
    checkStatus();

    // Sau đó lặp lại mỗi 3 giây
    pollingIntervalRef.current = setInterval(checkStatus, 3000);

    // Tự động dừng sau 10 phút (600,000ms)
    pollingTimeoutRef.current = setTimeout(() => {
      console.log("🛑 Polling stopped after 10 minutes");
      if (!hasNavigatedRef.current) {
        stopPolling();
        setOpenQrDialog(false);
        setPaymentUrl(null);
        alert("Đã hết thời gian chờ thanh toán. Vui lòng thử lại nếu cần.");
      }
    }, 10 * 60 * 1000); // 10 phút
  };

  const handlePayment = async () => {
    if (!invoice || !appointmentId || isCreatingPayment) return;

    // Kiểm tra trạng thái invoice trước khi thanh toán
    if (invoice.status !== "PENDING") {
      const statusMessage = {
        PAID: "Hóa đơn này đã được thanh toán.",
        CANCELLED: "Hóa đơn này đã bị hủy.",
        FAILED: "Thanh toán trước đó đã thất bại. Vui lòng thử lại.",
        EXPIRED: "Hóa đơn này đã hết hạn thanh toán."
      }[invoice.status] || "Không thể thực hiện thanh toán cho hóa đơn này.";

      setSnackbar({
        open: true,
        message: statusMessage,
        severity: invoice.status === 'PAID' ? 'info' : 'error'
      });
      return;
    }

    switch (paymentMethod) {
      case "VNPAY":
        try {
          setIsCreatingPayment(true);

          // Tạo payment URL trước khi mở dialog
          const url = await createVnPayPayment(appointmentId, "client");

          // Đóng dialog thanh toán và mở QR dialog
          handleClosePayDialog();
          setOpenQrDialog(true);

          console.log("Payment URL received:", url);

          if (url && url.trim() !== "") {
            setPaymentUrl(url);
            startPolling();
          } else {
            console.error("Payment URL is empty or invalid:", url);
            setOpenQrDialog(false);
            setSnackbar({
              open: true,
              message: "Không thể tạo URL thanh toán. Vui lòng thử lại.",
              severity: 'error'
            });
          }
        } catch (error) {
          console.error("Error creating VNPay payment:", error);
          setOpenQrDialog(false);
          // Sửa lỗi TypeScript khi truy cập response từ error
          const errorMessage = (error as any)?.response?.data?.message || "Có lỗi xảy ra khi tạo giao dịch thanh toán. Vui lòng thử lại.";
          setSnackbar({
            open: true,
            message: errorMessage,
            severity: 'error'
          });
        } finally {
          setIsCreatingPayment(false);
        }
        break;

      case "CASH":
        if (!paidAmount || paidAmount <= 0) {
          setSnackbar({
            open: true,
            message: "Số tiền thanh toán không hợp lệ",
            severity: 'error'
          });
          return;
        }

        if (paidAmount < invoice.totalAmount) {
          setSnackbar({
            open: true,
            message: `Số tiền thanh toán phải bằng tổng tiền hóa đơn (${invoice.totalAmount.toLocaleString()} VNĐ)`,
            severity: 'error'
          });
          return;
        }

        const success = await payCash(invoice.invoiceId, {
          paymentMethod,
          paidAmount,
          notes
        });

        if (success) {
          handleClosePayDialog();
          if (appointmentId) {
            await getByAppointmentId(appointmentId);
          }
          navigate(`/client/payment/success?appointmentId=${appointmentId}`, { replace: true });
        }
        break;

      default:
        alert("Phương thức thanh toán không hợp lệ");
        break;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "success";
      case "PENDING":
        return "warning";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PAID":
        return "Đã thanh toán";
      case "PENDING":
        return "Chờ thanh toán";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Không tìm thấy hóa đơn</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", py: 4 }}>
      <Box sx={{ maxWidth: 900, mx: "auto", px: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/client/appointment-history")}
          sx={{ mb: 2 }}
        >
          Quay lại
        </Button>

        <Card sx={{ p: 4, boxShadow: 3 }}>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: "center", borderBottom: "2px solid #e0e0e0", pb: 3 }}>
            <Receipt sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              HÓA ĐƠN THANH TOÁN
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Mã hóa đơn: {invoice.invoiceId}
            </Typography>
          </Box>

          {/* Invoice Info */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Ngày tạo
                </Typography>
                <Typography variant="body1">
                  {moment(invoice.invoiceDate).format("DD/MM/YYYY HH:mm")}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Trạng thái
                </Typography>
                <Chip
                  label={getStatusText(invoice.status)}
                  color={getStatusColor(invoice.status) as any}
                  size="small"
                />
              </Box>
            </Box>

            {invoice.dueDate && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Hạn thanh toán
                </Typography>
                <Typography variant="body1">
                  {moment(invoice.dueDate).format("DD/MM/YYYY HH:mm")}
                </Typography>
              </Box>
            )}

            {invoice.vehicleNumberPlate && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Biển số xe
                </Typography>
                <Typography variant="body1">{invoice.vehicleNumberPlate}</Typography>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Maintenance Details */}
          {invoice.maintenanceDetails && invoice.maintenanceDetails.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Chi tiết dịch vụ
              </Typography>
              {invoice.maintenanceDetails.map((maintenance, index) => (
                <Card
                  key={index}
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: "#fafafa",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    {maintenance.serviceName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Dịch vụ: {formatCurrency(maintenance.serviceCost)}
                  </Typography>

                  {maintenance.partsUsed && maintenance.partsUsed.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Phụ tùng đã sử dụng:
                      </Typography>
                      {maintenance.partsUsed.map((part, partIndex) => (
                        <Box
                          key={partIndex}
                          sx={{
                            display: "grid",
                            gridTemplateColumns: part.isUnderWarranty
                              ? "2fr 1fr 1fr 1fr 1.5fr"
                              : "2fr 1fr 1fr 1fr",
                            gap: 1,
                            py: 0.75,
                            fontSize: "0.875rem",
                            alignItems: "center",
                            borderBottom:
                              partIndex < maintenance.partsUsed.length - 1
                                ? "1px solid #e5e7eb"
                                : "none",
                            pb:
                              partIndex < maintenance.partsUsed.length - 1 ? 0.75 : 0,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="body2">• {part.partName}</Typography>
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
                                title={
                                  part.warrantyPackageName
                                    ? `Gói bảo hành: ${part.warrantyPackageName}`
                                    : "Phụ tùng được bảo hành"
                                }
                              />
                            )}
                          </Box>
                          <Typography variant="body2" sx={{ textAlign: "right" }}>
                            SL: {part.quantity}
                          </Typography>
                          <Typography variant="body2" sx={{ textAlign: "right" }}>
                            {formatCurrency(part.unitPrice)}
                          </Typography>
                          <Box sx={{ textAlign: "right" }}>
                            {part.isUnderWarranty && part.originalPrice ? (
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    textDecoration: "line-through",
                                    color: "#9ca3af",
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  {formatCurrency(part.originalPrice)}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: "#10b981",
                                  }}
                                >
                                  {formatCurrency(part.totalPrice)}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {formatCurrency(part.totalPrice)}
                              </Typography>
                            )}
                          </Box>
                          {part.isUnderWarranty && (
                            <Typography
                              variant="caption"
                              sx={{
                                textAlign: "right",
                                color: "#10b981",
                                fontWeight: 500,
                                fontSize: "0.75rem",
                              }}
                            >
                              {part.warrantyPackageName
                                ? `Gói: ${part.warrantyPackageName}`
                                : "Miễn phí"}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Card>
              ))}
            </Box>
          )}

          {/* Warranty Summary */}
          {invoice.maintenanceDetails &&
            invoice.maintenanceDetails.some((mm) =>
              mm.partsUsed?.some((p) => p.isUnderWarranty)
            ) && (
              <Box
                sx={{
                  p: 3,
                  borderBottom: "1px solid #e5e7eb",
                  backgroundColor: "#f0fdf4",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "#111827",
                    fontSize: "1.125rem",
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Chip
                    label="Bảo hành"
                    size="small"
                    sx={{
                      backgroundColor: "#dcfce7",
                      color: "#166534",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                    }}
                  />
                  <span>Phụ tùng được bảo hành</span>
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {invoice.maintenanceDetails
                    .flatMap((mm) =>
                      (mm.partsUsed || []).filter((p) => p.isUnderWarranty)
                    )
                    .map((part, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          p: 1.5,
                          backgroundColor: "white",
                          borderRadius: 1,
                          border: "1px solid #bbf7d0",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500, color: "#166534" }}
                          >
                            {part.partName}
                          </Typography>
                          {part.warrantyPackageName && (
                            <Typography
                              variant="caption"
                              sx={{ color: "#6b7280", fontSize: "0.7rem" }}
                            >
                              Gói bảo hành: {part.warrantyPackageName}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          {part.originalPrice ? (
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  textDecoration: "line-through",
                                  color: "#9ca3af",
                                  fontSize: "0.75rem",
                                }}
                              >
                                {formatCurrency(part.originalPrice)}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: "#10b981",
                                }}
                              >
                                {formatCurrency(part.totalPrice)}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: "#10b981",
                                fontSize: "0.875rem",
                              }}
                            >
                              Miễn phí
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                </Box>
              </Box>
            )}

          <Divider sx={{ my: 3 }} />

          {/* Total */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 3,
              bgcolor: "#f5f5f5",
              borderRadius: 2,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Tổng cộng:
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main" }}>
              {formatCurrency(invoice.totalAmount)}
            </Typography>
          </Box>

          {/* Payment Button */}
          {invoice.status === "PENDING" && (
            <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid #e0e0e0" }}>
              <Button
                variant="contained"
                startIcon={<Payment />}
                onClick={handleOpenPayDialog}
                fullWidth
                size="large"
                sx={{
                  backgroundColor: "#3b82f6",
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: "#2563eb",
                  },
                }}
              >
                Thanh toán
              </Button>
            </Box>
          )}
        </Card>

        {/* Payment Dialog */}
        <Dialog open={openPayDialog} onClose={handleClosePayDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600, fontSize: "1.25rem" }}>
            Xác nhận thanh toán
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
              <Alert severity="info">
                Tổng tiền cần thanh toán: <strong>{formatCurrency(invoice.totalAmount)}</strong>
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
                      endAdornment: <Typography sx={{ color: "#6b7280" }}>₫</Typography>,
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
              color="primary"
              onClick={handlePayment}
              disabled={paying || isCreatingPayment}
              startIcon={(paying || isCreatingPayment) ? <CircularProgress size={20} /> : <Payment />}
            >
              {isCreatingPayment ? 'Đang tạo giao dịch...' : paying ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
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
                  <Typography variant="body2" color="text.secondary">
                    Đang tạo mã QR...
                  </Typography>
                </Box>
              )}

              {paymentUrl && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
                    Hoặc nhấn vào nút bên dưới để mở trang thanh toán
                  </Typography>
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

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  Đang chờ thanh toán...
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, justifyContent: "center" }}>
            <Button onClick={handleCloseQrDialog} variant="outlined">
              Đóng
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          message={snackbar.message}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              sx={{ p: 0.5 }}
              onClick={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
              <Close fontSize="small" />
            </IconButton>
          }
          sx={{
            '& .MuiSnackbarContent-root': {
              backgroundColor: snackbar.severity === 'error' ? '#d32f2f' :
                snackbar.severity === 'success' ? '#2e7d32' :
                  snackbar.severity === 'warning' ? '#ed6c02' : '#0288d1',
            },
            mb: 3
          }}
        />
      </Box>
    </Box>
  );
};
