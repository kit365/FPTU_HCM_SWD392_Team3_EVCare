import React, { useEffect, useState } from "react";
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

export const ClientPaymentSuccess: React.FC = () => {
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
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <Card sx={{ p: 4, boxShadow: 3 }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <CheckCircle sx={{ fontSize: 80, color: "#10b981", mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: "#10b981" }}>
              Thanh toán thành công!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi
            </Typography>
          </Box>

          {invoice && (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                Hóa đơn đã được thanh toán thành công qua VNPay
              </Alert>

              <Box
                sx={{
                  p: 3,
                  backgroundColor: "#f9fafb",
                  borderRadius: 2,
                  border: "1px solid #e5e7eb",
                  mb: 3,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Thông tin thanh toán
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Mã hóa đơn:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {invoice.invoiceId}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Ngày thanh toán:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {moment().format("DD/MM/YYYY HH:mm")}
                    </Typography>
                  </Box>
                  {invoice.vehicleNumberPlate && (
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        Biển số xe:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {invoice.vehicleNumberPlate}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1, borderTop: "1px solid #e5e7eb" }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Tổng tiền:
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#10b981" }}>
                      {formatCurrency(invoice.totalAmount)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          <Alert severity="success" sx={{ mb: 3 }}>
            Giao dịch đã được xử lý thành công. Hệ thống đã cập nhật trạng thái hóa đơn và appointment.
          </Alert>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/client/appointment-history")}
              sx={{ minWidth: "160px" }}
            >
              Quay lại lịch sử
            </Button>
            {appointmentId && (
              <Button
                variant="contained"
                startIcon={<Home />}
                onClick={() => navigate(`/client/invoice/${appointmentId}`)}
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
            <Button
              variant="text"
              onClick={() => navigate("/client")}
              sx={{ minWidth: "160px" }}
            >
              Về trang chủ
            </Button>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

