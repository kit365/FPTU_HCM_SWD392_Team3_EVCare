import { useEffect, useState, useRef } from "react";
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
import QRCode from "react-qr-code";
import { useInvoice } from "../../../hooks/useInvoice";
import { invoiceService } from "../../../service/invoiceService";
import moment from "moment";

export const InvoiceView = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { invoice, loading, paying, getByAppointmentId, payCash, createVnPayPayment, setInvoice } = useInvoice();
  
  const [openPayDialog, setOpenPayDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasNavigatedRef = useRef<boolean>(false); // Flag để đảm bảo chỉ navigate 1 lần

  useEffect(() => {
    if (appointmentId) {
      getByAppointmentId(appointmentId);
    }
  }, [appointmentId]);

  const previousStatusRef = useRef<string | undefined>(undefined);
  
  useEffect(() => {
    if (invoice) {
      setPaidAmount(invoice.totalAmount);
      
      // Log để debug
      if (previousStatusRef.current !== invoice.status) {
        console.log("📊 Invoice status changed:", {
          previous: previousStatusRef.current,
          current: invoice.status,
          openQrDialog,
          hasNavigated: hasNavigatedRef.current
        });
        previousStatusRef.current = invoice.status;
      }
      
      // Nếu invoice đã được thanh toán và đang mở QR dialog
      if (invoice.status === "PAID" && openQrDialog && !hasNavigatedRef.current) {
        console.log("✅ Invoice PAID detected in useEffect, navigating to success page");
        
        // Set flag ngay lập tức để polling dừng
        hasNavigatedRef.current = true;
        
        // Dừng polling ngay lập tức (nếu có)
        if (pollingIntervalRef.current) {
          console.log("🛑 Stopping polling before navigate");
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        
        // Đóng QR dialog ngay lập tức
        setOpenQrDialog(false);
        setPaymentUrl(null);
        
        // Navigate ngay đến success page (không delay)
        // Dùng setTimeout nhỏ để đảm bảo polling đã dừng
        setTimeout(() => {
          navigate(`/admin/payment/success?appointmentId=${appointmentId}`, { replace: true });
        }, 0);
      }
    }
  }, [invoice, appointmentId, navigate, openQrDialog]);

  // Cleanup polling on unmount
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
    setPaymentMethod("CASH");
    setNotes("");
    setPaymentUrl(null);
  };

  const handleCloseQrDialog = () => {
    setOpenQrDialog(false);
    setPaymentUrl(null);
    hasNavigatedRef.current = false; // Reset flag khi đóng dialog
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const startPolling = () => {
    // Dừng polling cũ nếu có
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    // Poll ngay lập tức lần đầu, sau đó mới set interval
    const checkStatus = async () => {
      // Kiểm tra các điều kiện dừng polling trước (check refs để có giá trị mới nhất)
      if (hasNavigatedRef.current) {
        console.log("🛑 Already navigated, stopping polling");
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        return;
      }
      
      // Check dialog state từ DOM hoặc state mới nhất
      // Dùng cách khác để check dialog state
      if (pollingIntervalRef.current === null) {
        // Polling đã bị dừng rồi
        return;
      }
      
      // Chỉ check nếu dialog vẫn mở và chưa navigate
      if (!appointmentId) {
        console.log("🛑 No appointmentId, stopping polling");
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        return;
      }
      
      try {
        console.log("🔄 Polling invoice status (silent)...");
        // Gọi trực tiếp service để không trigger loading state (tránh re-render)
        const updatedInvoice = await invoiceService.getByAppointmentId(appointmentId);
        
        // Update invoice state mà không trigger loading
        // Sử dụng callback form của setState để update ngay lập tức
        setInvoice((prevInvoice: typeof updatedInvoice | null) => {
          if (prevInvoice) {
            return { ...prevInvoice, ...updatedInvoice };
          }
          return updatedInvoice;
        });
        
        // Check lại các điều kiện dừng sau khi fetch (vì state có thể thay đổi)
        if (hasNavigatedRef.current) {
          console.log("🛑 Navigated during fetch, stopping polling");
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          return;
        }
        
        // Nếu invoice vừa được update thành PAID, đóng dialog và navigate ngay
        if (updatedInvoice?.status === "PAID") {
          console.log("✅ Invoice PAID detected during polling, closing dialog and navigating...");
          
          // Dừng polling ngay
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          
          // Set flag để tránh navigate lại
          hasNavigatedRef.current = true;
          
          // Đóng QR dialog
          setOpenQrDialog(false);
          setPaymentUrl(null);
          
          // Navigate đến success page
          setTimeout(() => {
            navigate(`/admin/payment/success?appointmentId=${appointmentId}`, { replace: true });
          }, 100); // Delay nhỏ để dialog đóng mượt
          
          return;
        }
      } catch (error) {
        console.error("Error polling invoice status:", error);
        // Không show error message khi polling để không làm gián đoạn user
      }
    };
    
    // Check ngay lập tức
    checkStatus();
    
    // Sau đó check mỗi 1 giây
    pollingIntervalRef.current = setInterval(checkStatus, 1000);
  };


  const handlePayment = async () => {
    if (!invoice || !appointmentId) return;
    
    switch (paymentMethod) {
      case "VNPAY":
        try {
          // Reset flag
          hasNavigatedRef.current = false;
          
          // Mở QR dialog trước để hiển thị loading
          setOpenQrDialog(true);
          handleClosePayDialog();
          
          // Tạo payment URL
          const url = await createVnPayPayment(appointmentId, "admin");
          
          console.log("Payment URL received:", url); // Debug log
          
          // Set payment URL để hiển thị QR code
          if (url && url.trim() !== "") {
            setPaymentUrl(url);
            // Start polling to check payment status
            startPolling();
          } else {
            console.error("Payment URL is empty or invalid:", url);
            alert("Không thể tạo URL thanh toán. Vui lòng thử lại.");
            setOpenQrDialog(false);
          }
        } catch (error) {
          // Error đã được handle trong createVnPayPayment
          setOpenQrDialog(false);
          hasNavigatedRef.current = false;
          return;
        }
        break;
      
      case "CASH":
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
          // Reload invoice để đảm bảo có data mới nhất
          if (appointmentId) {
            await getByAppointmentId(appointmentId);
          }
          // Navigate đến trang thành công giống VNPay
          navigate(`/admin/payment/success?appointmentId=${appointmentId}`, { replace: true });
        }
        break;
      
      default:
        alert("Phương thức thanh toán không hợp lệ");
        break;
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
              <Typography variant="h4" sx={{ fontWeight: 600, color: "#111827", mb: 0.5, fontSize: "1.75rem" }}>
                Chi tiết hóa đơn
              </Typography>
              <Typography sx={{ color: "#6b7280", fontSize: "1rem" }}>
                Mã hóa đơn: {invoice.invoiceId.substring(0, 8).toUpperCase()}
              </Typography>
            </Box>
            <Chip
              label={getStatusLabel(invoice.status).label}
              color={getStatusLabel(invoice.status).color}
              sx={{ height: 36, borderRadius: 1.5, fontSize: "1rem", fontWeight: 600, px: 2 }}
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
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#111827", fontSize: "1.375rem", mb: 2 }}>
              Thông tin khách hàng
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "1rem" }}>
                  Tên khách hàng:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "1.125rem" }}>
                  {invoice.customerName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "1rem" }}>
                  Email:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "1.125rem" }}>
                  {invoice.customerEmail}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "1rem" }}>
                  Số điện thoại:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "1.125rem" }}>
                  {invoice.customerPhone}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Vehicle Info */}
          {invoice.vehicleNumberPlate && (
            <Box sx={{ p: 3, borderBottom: "1px solid #e5e7eb" }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#111827", fontSize: "1.375rem", mb: 2 }}>
                Thông tin xe
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "1rem" }}>
                    Biển số xe:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "1.125rem" }}>
                    {invoice.vehicleNumberPlate}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "1rem" }}>
                    Loại xe:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "1.125rem" }}>
                    {invoice.vehicleTypeName} {invoice.vehicleManufacturer && `(${invoice.vehicleManufacturer})`}
                  </Typography>
                </Box>
                {invoice.scheduledAt && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "1rem" }}>
                      Ngày hẹn:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "1.125rem" }}>
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
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#111827", fontSize: "1.375rem", mb: 2 }}>
                Chi tiết dịch vụ & phụ tùng
              </Typography>
              {invoice.maintenanceDetails.map((maintenance, index) => (
                <Box key={index} sx={{ mb: 3, '&:last-child': { mb: 0 } }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "#3b82f6", fontSize: "1.125rem" }}>
                      {index + 1}. {maintenance.serviceName}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "1.125rem" }}>
                      {formatCurrency(maintenance.serviceCost)}
                    </Typography>
                  </Box>
                  {maintenance.partsUsed && maintenance.partsUsed.length > 0 && (
                    <Box sx={{ ml: 3, mt: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1, fontSize: "0.9375rem" }}>
                        Phụ tùng sử dụng:
                      </Typography>
                      {maintenance.partsUsed.map((part, partIndex) => (
                        <Box 
                          key={partIndex} 
                          sx={{ 
                            display: "flex",
                            flexDirection: "column",
                            py: 1.5,
                            borderBottom: partIndex < maintenance.partsUsed.length - 1 ? "1px solid #e5e7eb" : "none",
                            pb: partIndex < maintenance.partsUsed.length - 1 ? 1.5 : 0,
                            backgroundColor: part.isUnderWarranty ? "#f0fdf4" : "transparent",
                            borderRadius: 1.5,
                            px: part.isUnderWarranty ? 1.5 : 0,
                            border: part.isUnderWarranty ? "1px solid #d1fae5" : "none",
                            gap: 1
                          }}
                        >
                          {/* Tên phụ tùng và badge */}
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontSize: "1.1rem", fontWeight: part.isUnderWarranty ? 600 : 400 }}>
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
                                      fontWeight: 600
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
                                  fontSize: "1.1rem",
                                  color: "#111827"
                                }}
                              >
                                {formatCurrency(part.totalPrice)}
                              </Typography>
                            )}
                          </Box>
                          
                          {/* Chi tiết giá cho phụ tùng được bảo hành */}
                          {part.isUnderWarranty && part.originalPrice && (
                            <Box sx={{ 
                              display: "grid", 
                              gridTemplateColumns: "1fr 1fr 1fr 1fr", 
                              gap: 1.5,
                              mt: 0.5,
                              pl: 2
                            }}>
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem", display: "block", mb: 0.25 }}>
                                  Số lượng
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: "1rem", fontWeight: 500 }}>
                                  {part.quantity}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem", display: "block", mb: 0.25 }}>
                                  Đơn giá
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: "1rem", fontWeight: 500 }}>
                                  {formatCurrency(part.unitPrice)}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem", display: "block", mb: 0.25 }}>
                                  Giá gốc
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    textDecoration: "line-through", 
                                    color: "#9ca3af",
                                    fontSize: "1rem",
                                    fontWeight: 500
                                  }}
                                >
                                  {formatCurrency(part.originalPrice)}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem", display: "block", mb: 0.25 }}>
                                  {part.warrantyDiscountType === "FREE" ? "Giảm giá" : part.warrantyDiscountValue ? `Giảm ${part.warrantyDiscountValue}%` : "Giảm giá"}
                                </Typography>
                                {part.warrantyDiscountAmount && part.warrantyDiscountAmount > 0 ? (
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: "#ef4444",
                                      fontSize: "1rem",
                                      fontWeight: 600
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
                                      fontWeight: 600
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
                            <Box sx={{ 
                              display: "flex", 
                              justifyContent: "space-between", 
                              alignItems: "center",
                              mt: 0.5,
                              pt: 1,
                              borderTop: "1px solid #d1fae5",
                              pl: 2
                            }}>
                              <Typography variant="body2" sx={{ fontSize: "1rem", fontWeight: 600, color: "#374151" }}>
                                Giá sau giảm:
                              </Typography>
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: 700, 
                                  fontSize: "1.25rem",
                                  color: "#10b981"
                                }}
                              >
                                {formatCurrency(part.totalPrice)}
                              </Typography>
                            </Box>
                          )}
                          
                          {/* Thông tin cho phụ tùng không bảo hành */}
                          {!part.isUnderWarranty && (
                            <Box sx={{ 
                              display: "grid", 
                              gridTemplateColumns: "1fr 1fr 1fr 1fr", 
                              gap: 1.5,
                              mt: 0.5,
                              pl: 2
                            }}>
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem", display: "block", mb: 0.25 }}>
                                  Số lượng
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: "1rem", fontWeight: 500 }}>
                                  {part.quantity}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem", display: "block", mb: 0.25 }}>
                                  Đơn giá
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: "1rem", fontWeight: 500 }}>
                                  {formatCurrency(part.unitPrice)}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem", display: "block", mb: 0.25 }}>
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
                </Box>
              ))}
            </Box>
          )}

          {/* Invoice Details */}
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#111827", fontSize: "1.375rem", mb: 2 }}>
              Chi tiết hóa đơn
            </Typography>
            <Box sx={{ display: "grid", gap: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "1rem" }}>
                  Ngày tạo:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "1.125rem" }}>
                  {formatDate(invoice.invoiceDate)}
                </Typography>
              </Box>
              {invoice.dueDate && (
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "1rem" }}>
                    Hạn thanh toán:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "#ef4444", fontSize: "1.125rem" }}>
                    {formatDate(invoice.dueDate)}
                  </Typography>
                </Box>
              )}
              {invoice.paymentMethodName && (
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "1rem" }}>
                    Phương thức thanh toán:
                  </Typography>
                  <Chip label={invoice.paymentMethodName} size="small" color="primary" />
                </Box>
              )}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "1.125rem" }}>
                  Tổng tiền:
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#3b82f6", fontSize: "1.5rem" }}>
                  {formatCurrency(invoice.totalAmount)}
                </Typography>
              </Box>
              {isPaid && (
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "1.125rem" }}>
                    Đã thanh toán:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "#10b981", fontSize: "1.375rem" }}>
                    {formatCurrency(invoice.paidAmount)}
                  </Typography>
                </Box>
              )}
              {invoice.notes && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: "1rem" }}>
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
                    <Typography variant="body2" sx={{ fontSize: "1rem" }}>{invoice.notes}</Typography>
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
                  <MenuItem value="VNPAY">Thanh toán qua VNPay</MenuItem>
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
                <strong>Lưu ý:</strong> Khi khách hàng thanh toán thành công, cửa sổ này sẽ tự động đóng và chuyển đến trang thành công.
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

