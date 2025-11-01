import { useEffect, useState } from "react";
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
} from "@mui/material";
import { ArrowBack, Receipt } from "@mui/icons-material";
import { useInvoice } from "../../../hooks/useInvoice";
import moment from "moment";

export const ClientInvoiceView = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { invoice, loading, getByAppointmentId } = useInvoice();

  useEffect(() => {
    if (appointmentId) {
      getByAppointmentId(appointmentId);
    }
  }, [appointmentId]);

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
                          {part.originalPrice && (
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
                          )}
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
        </Card>
      </Box>
    </Box>
  );
};

