import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { ArrowBack, Payment } from "@mui/icons-material";
import { useInvoice } from "../../../hooks/useInvoice";
import moment from "moment";

export const InvoiceView = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { invoice, loading, paying, getByAppointmentId, payCash } = useInvoice();
  
  const [openPayDialog, setOpenPayDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState("");

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

  const handleOpenPayDialog = () => {
    setOpenPayDialog(true);
  };

  const handleClosePayDialog = () => {
    setOpenPayDialog(false);
    setPaymentMethod("CASH");
    setNotes("");
  };

  const handlePayment = async () => {
    if (!invoice) return;
    
    // Validation
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
      // Reload invoice
      if (appointmentId) {
        await getByAppointmentId(appointmentId);
      }
      // Navigate back to appointment list
      setTimeout(() => {
        navigate("/admin/appointment-manage");
      }, 1500);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: "warning" | "success" | "error" | "default" } } = {
      PENDING: { label: "Chờ thanh toán", color: "warning" },
      PAID: { label: "Đã thanh toán", color: "success" },
      CANCELLED: { label: "Đã hủy", color: "error" },
    };
    return statusMap[status] || { label: status, color: "default" };
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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">Không tìm thấy hóa đơn cho appointment này</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/admin/appointment-manage")}
          sx={{ mt: 2 }}
        >
          Quay lại
        </Button>
      </Box>
    );
  }

  const isPaid = invoice.status === "PAID";

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#fafbfc", p: 3 }}>
      <Box sx={{ maxWidth: "1000px", mx: "auto" }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/admin/appointment-manage")}
            sx={{
              color: "#6b7280",
              fontSize: "0.875rem",
              mb: 2,
              "&:hover": {
                backgroundColor: "#f3f4f6",
                color: "#111827",
              },
            }}
          >
            Quay lại
          </Button>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: "#111827", mb: 0.5 }}>
                Chi tiết hóa đơn
              </Typography>
              <Typography sx={{ color: "#6b7280", fontSize: "0.875rem" }}>
                Mã hóa đơn: {invoice.invoiceId.substring(0, 8).toUpperCase()}
              </Typography>
            </Box>
            <Chip
              label={getStatusLabel(invoice.status).label}
              color={getStatusLabel(invoice.status).color}
              sx={{ height: 32, borderRadius: 1.5, fontSize: "0.875rem", fontWeight: 600, px: 2 }}
            />
          </Box>
        </Box>

        {/* Main Content */}
        <Card
          sx={{
            borderRadius: 2,
            border: "1px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          {/* Customer Info */}
          <Box sx={{ p: 3, borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#111827", fontSize: "1.125rem", mb: 2 }}>
              Thông tin khách hàng
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Tên khách hàng:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {invoice.customerName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Email:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {invoice.customerEmail}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Số điện thoại:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {invoice.customerPhone}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Vehicle Info */}
          {invoice.vehicleNumberPlate && (
            <Box sx={{ p: 3, borderBottom: "1px solid #e5e7eb" }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#111827", fontSize: "1.125rem", mb: 2 }}>
                Thông tin xe
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Biển số xe:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {invoice.vehicleNumberPlate}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Loại xe:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {invoice.vehicleTypeName} {invoice.vehicleManufacturer && `(${invoice.vehicleManufacturer})`}
                  </Typography>
                </Box>
                {invoice.scheduledAt && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Ngày hẹn:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatDate(invoice.scheduledAt)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Services & Parts Breakdown */}
          {invoice.maintenanceDetails && invoice.maintenanceDetails.length > 0 && (
            <Box sx={{ p: 3, borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#111827", fontSize: "1.125rem", mb: 2 }}>
                Chi tiết dịch vụ & phụ tùng
              </Typography>
              {invoice.maintenanceDetails.map((maintenance, index) => (
                <Box key={index} sx={{ mb: 3, '&:last-child': { mb: 0 } }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "#3b82f6" }}>
                      {index + 1}. {maintenance.serviceName}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatCurrency(maintenance.serviceCost)}
                    </Typography>
                  </Box>
                  {maintenance.partsUsed && maintenance.partsUsed.length > 0 && (
                    <Box sx={{ ml: 3, mt: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                        Phụ tùng sử dụng:
                      </Typography>
                      {maintenance.partsUsed.map((part, partIndex) => (
                        <Box 
                          key={partIndex} 
                          sx={{ 
                            display: "grid", 
                            gridTemplateColumns: "2fr 1fr 1fr 1fr", 
                            gap: 1, 
                            py: 0.5,
                            fontSize: "0.875rem"
                          }}
                        >
                          <Typography variant="body2">• {part.partName}</Typography>
                          <Typography variant="body2" sx={{ textAlign: "right" }}>
                            SL: {part.quantity}
                          </Typography>
                          <Typography variant="body2" sx={{ textAlign: "right" }}>
                            {formatCurrency(part.unitPrice)}
                          </Typography>
                          <Typography variant="body2" sx={{ textAlign: "right", fontWeight: 600 }}>
                            {formatCurrency(part.totalPrice)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {/* Invoice Details */}
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#111827", fontSize: "1.125rem", mb: 2 }}>
              Chi tiết hóa đơn
            </Typography>
            <Box sx={{ display: "grid", gap: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Ngày tạo:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formatDate(invoice.invoiceDate)}
                </Typography>
              </Box>
              {invoice.dueDate && (
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Hạn thanh toán:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "#ef4444" }}>
                    {formatDate(invoice.dueDate)}
                  </Typography>
                </Box>
              )}
              {invoice.paymentMethodName && (
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Phương thức thanh toán:
                  </Typography>
                  <Chip label={invoice.paymentMethodName} size="small" color="primary" />
                </Box>
              )}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Tổng tiền:
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#3b82f6" }}>
                  {formatCurrency(invoice.totalAmount)}
                </Typography>
              </Box>
              {isPaid && (
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Đã thanh toán:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "#10b981" }}>
                    {formatCurrency(invoice.paidAmount)}
                  </Typography>
                </Box>
              )}
              {invoice.notes && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Ghi chú:
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: "#f9fafb",
                      borderRadius: 2,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <Typography variant="body2">{invoice.notes}</Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          {/* Actions */}
          {!isPaid && (
            <Box sx={{ p: 3, borderTop: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
              <Button
                variant="contained"
                startIcon={<Payment />}
                onClick={handleOpenPayDialog}
                fullWidth
                sx={{
                  backgroundColor: "#3b82f6",
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "#2563eb",
                    boxShadow: "none",
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
              
              {/* Payment Method Selection */}
              <FormControl fullWidth>
                <InputLabel>Phương thức thanh toán</InputLabel>
                <Select
                  value={paymentMethod}
                  label="Phương thức thanh toán"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <MenuItem value="CASH">Tiền mặt (CASH)</MenuItem>
                  {/* Có thể thêm các phương thức khác sau */}
                </Select>
              </FormControl>

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
      </Box>
    </Box>
  );
};

