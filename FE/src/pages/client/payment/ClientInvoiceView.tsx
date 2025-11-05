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
import { ArrowBack, Receipt, Payment } from "@mui/icons-material";
import QRCode from "react-qr-code";
import { useInvoice } from "../../../hooks/useInvoice";
import moment from "moment";

export const ClientInvoiceView = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { invoice, loading, paying, getByAppointmentId, createVnPayPayment } = useInvoice();
  
  const [openPayDialog, setOpenPayDialog] = useState(false);
  const [paymentMethod] = useState("VNPAY"); // Client chỉ được thanh toán qua VNPay
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasNavigatedRef = useRef<boolean>(false);

  useEffect(() => {
    if (appointmentId) {
      getByAppointmentId(appointmentId);
    }
  }, [appointmentId]);


  const previousStatusRef = useRef<string | undefined>(undefined);
  
  useEffect(() => {
    if (invoice) {
      if (previousStatusRef.current !== invoice.status) {
        console.log("📊 Invoice status changed:", {
          previous: previousStatusRef.current,
          current: invoice.status,
          openQrDialog,
          hasNavigated: hasNavigatedRef.current
        });
        previousStatusRef.current = invoice.status;
      }
      
      if (invoice.status === "PAID" && openQrDialog && !hasNavigatedRef.current) {
        console.log("✅ Invoice PAID detected, navigating to success page");
        hasNavigatedRef.current = true;
        
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        
        setOpenQrDialog(false);
        setPaymentUrl(null);
        navigate(`/client/payment/success?appointmentId=${appointmentId}`, { replace: true });
      }
    }
  }, [invoice, appointmentId, navigate, openQrDialog]);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleOpenPayDialog = () => {
    setOpenPayDialog(true);
  };

  const handleClosePayDialog = () => {
    setOpenPayDialog(false);
  };

  const handleCloseQrDialog = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setOpenQrDialog(false);
    setPaymentUrl(null);
    hasNavigatedRef.current = false;
  };

  const checkPaymentStatus = async () => {
    if (!appointmentId) return;
    
    try {
      await getByAppointmentId(appointmentId);
    } catch (error) {
      console.error("Error checking payment status:", error);
    }
  };

  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    const checkStatus = () => {
      checkPaymentStatus();
    };
    
    pollingIntervalRef.current = setInterval(checkStatus, 1500);
  };

  const handlePayment = async () => {
    if (!invoice || !appointmentId) return;
    
    // Client chỉ được thanh toán qua VNPay
    if (paymentMethod !== "VNPAY") {
      alert("Chỉ hỗ trợ thanh toán qua VNPay");
      return;
    }
    
    try {
      hasNavigatedRef.current = false;
      setOpenQrDialog(true);
      handleClosePayDialog();
      
      const url = await createVnPayPayment(appointmentId, "client");
      
      console.log("Payment URL received:", url);
      
      if (url && url.trim() !== "") {
        setPaymentUrl(url);
        startPolling();
      } else {
        console.error("Payment URL is empty or invalid:", url);
        alert("Không thể tạo URL thanh toán. Vui lòng thử lại.");
        setOpenQrDialog(false);
      }
    } catch (error) {
      setOpenQrDialog(false);
      hasNavigatedRef.current = false;
      return;
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
                            display: "flex",
                            flexDirection: "column",
                            py: 1.5,
                            borderBottom:
                              partIndex < maintenance.partsUsed.length - 1
                                ? "1px solid #e5e7eb"
                                : "none",
                            pb:
                              partIndex < maintenance.partsUsed.length - 1 ? 1.5 : 0,
                            backgroundColor: part.isUnderWarranty ? "#f0fdf4" : "transparent",
                            borderRadius: 1.5,
                            px: part.isUnderWarranty ? 1.5 : 0,
                            border: part.isUnderWarranty ? "1px solid #d1fae5" : "none",
                            gap: 1,
                            mt: partIndex > 0 ? 1 : 0
                          }}
                        >
                          {/* Tên phụ tùng và badge */}
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontSize: "1rem", fontWeight: part.isUnderWarranty ? 600 : 400 }}>
                                • {part.partName}
                              </Typography>
                              {part.isUnderWarranty && (
                                <Box sx={{ mt: 0.75, display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <Chip
                                    label={
                                      part.warrantyDiscountType === "FREE"
                                        ? "✓ Miễn phí (Bảo hành)"
                                        : part.warrantyDiscountValue
                                          ? `✓ Giảm ${part.warrantyDiscountValue}% (Bảo hành)`
                                          : "✓ Bảo hành"
                                    }
                                    size="small"
                                    sx={{
                                      height: "24px",
                                      fontSize: "0.8rem",
                                      backgroundColor: "#10b981",
                                      color: "white",
                                      fontWeight: 600,
                                    }}
                                  />
                                </Box>
                              )}
                            </Box>
                            {!part.isUnderWarranty && (
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: "1rem",
                                  color: "#111827",
                                }}
                              >
                                {formatCurrency(part.totalPrice)}
                              </Typography>
                            )}
                          </Box>

                          {/* Chi tiết giá cho phụ tùng được bảo hành */}
                          {part.isUnderWarranty && part.originalPrice && (
                            <Box
                              sx={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                                gap: 1.5,
                                mt: 0.5,
                                pl: 2,
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontSize: "0.85rem", display: "block", mb: 0.25 }}
                                >
                                  Số lượng
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: "1rem", fontWeight: 500 }}>
                                  {part.quantity}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontSize: "0.85rem", display: "block", mb: 0.25 }}
                                >
                                  Đơn giá
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: "1rem", fontWeight: 500 }}>
                                  {formatCurrency(part.unitPrice)}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontSize: "0.85rem", display: "block", mb: 0.25 }}
                                >
                                  Giá gốc
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    textDecoration: "line-through",
                                    color: "#9ca3af",
                                    fontSize: "1rem",
                                    fontWeight: 500,
                                  }}
                                >
                                  {formatCurrency(part.originalPrice)}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontSize: "0.85rem", display: "block", mb: 0.25 }}
                                >
                                  {part.warrantyDiscountType === "FREE"
                                    ? "Giảm giá"
                                    : part.warrantyDiscountValue
                                      ? `Giảm ${part.warrantyDiscountValue}%`
                                      : "Giảm giá"}
                                </Typography>
                                {part.warrantyDiscountAmount && part.warrantyDiscountAmount > 0 ? (
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: "#ef4444",
                                      fontSize: "1rem",
                                      fontWeight: 600,
                                    }}
                                  >
                                    -{formatCurrency(part.warrantyDiscountAmount)}
                                  </Typography>
                                ) : part.warrantyDiscountType === "FREE" ? (
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: "#10b981",
                                      fontSize: "1rem",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Miễn phí
                                  </Typography>
                                ) : null}
                              </Box>
                            </Box>
                          )}

                          {/* Giá sau giảm cho phụ tùng được bảo hành */}
                          {part.isUnderWarranty && (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mt: 0.5,
                                pt: 1,
                                borderTop: "1px solid #d1fae5",
                                pl: 2,
                              }}
                            >
                              <Typography variant="body2" sx={{ fontSize: "1rem", fontWeight: 600, color: "#374151" }}>
                                Giá sau giảm:
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "1.25rem",
                                  color: "#10b981",
                                }}
                              >
                                {formatCurrency(part.totalPrice)}
                              </Typography>
                            </Box>
                          )}

                          {/* Thông tin cho phụ tùng không bảo hành */}
                          {!part.isUnderWarranty && (
                            <Box
                              sx={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                                gap: 1.5,
                                mt: 0.5,
                                pl: 2,
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontSize: "0.85rem", display: "block", mb: 0.25 }}
                                >
                                  Số lượng
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: "1rem", fontWeight: 500 }}>
                                  {part.quantity}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontSize: "0.85rem", display: "block", mb: 0.25 }}
                                >
                                  Đơn giá
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: "1rem", fontWeight: 500 }}>
                                  {formatCurrency(part.unitPrice)}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontSize: "0.85rem", display: "block", mb: 0.25 }}
                                >
                                  Thành tiền
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: "1rem", fontWeight: 600 }}>
                                  {formatCurrency(part.totalPrice)}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Card>
              ))}
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
                  disabled
                >
                  <MenuItem value="VNPAY">Thanh toán qua VNPay</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClosePayDialog} disabled={paying}>
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handlePayment}
              disabled={paying}
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
      </Box>
    </Box>
  );
};

