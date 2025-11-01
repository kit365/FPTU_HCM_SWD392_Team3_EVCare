import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { CheckCircle, ArrowBack, Home } from "@mui/icons-material";
import { useInvoice } from "../../../hooks/useInvoice";
import moment from "moment";

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const appointmentId = searchParams.get("appointmentId");
  const { invoice, loading, getByAppointmentId } = useInvoice();

  useEffect(() => {
    if (appointmentId) {
      getByAppointmentId(appointmentId);
    }
  }, [appointmentId]);

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#fafbfc", p: 3 }}>
      <Box sx={{ maxWidth: "600px", mx: "auto" }}>
        <Card
          sx={{
            borderRadius: 2,
            border: "1px solid #e5e7eb",
            overflow: "hidden",
            p: 4,
            textAlign: "center",
          }}
        >
          <Box sx={{ mb: 3 }}>
            <CheckCircle
              sx={{
                fontSize: 80,
                color: "#10b981",
                mb: 2,
              }}
            />
            <Typography variant="h4" sx={{ fontWeight: 600, color: "#111827", mb: 1 }}>
              Thanh toán thành công!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Hóa đơn đã được thanh toán thành công qua VNPay
            </Typography>
          </Box>

          {invoice && (
            <Box
              sx={{
                p: 3,
                backgroundColor: "#f9fafb",
                borderRadius: 2,
                border: "1px solid #e5e7eb",
                mb: 3,
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Mã hóa đơn
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                {invoice.invoiceId.substring(0, 8).toUpperCase()}
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Khách hàng:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {invoice.customerName}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Số tiền thanh toán:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#10b981" }}>
                  {formatCurrency(invoice.totalAmount)}
                </Typography>
              </Box>

              {invoice.paymentMethodName && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Phương thức:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {invoice.paymentMethodName}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          <Alert severity="success" sx={{ mb: 3 }}>
            Giao dịch đã được xử lý thành công. Hệ thống đã cập nhật trạng thái hóa đơn và appointment.
          </Alert>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/admin/appointment-manage")}
              sx={{ minWidth: "160px" }}
            >
              Quay lại danh sách
            </Button>
            {appointmentId && (
              <Button
                variant="contained"
                startIcon={<Home />}
                onClick={() => navigate(`/admin/invoice/${appointmentId}`)}
                sx={{
                  backgroundColor: "#3b82f6",
                  minWidth: "160px",
                  "&:hover": {
                    backgroundColor: "#2563eb",
                  },
                }}
              >
                Xem hóa đơn
              </Button>
            )}
            {appointmentId && (
              <Button
                variant="text"
                onClick={() => navigate(`/admin/appointment/view/${appointmentId}`)}
                sx={{ minWidth: "160px" }}
              >
                Xem appointment
              </Button>
            )}
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

