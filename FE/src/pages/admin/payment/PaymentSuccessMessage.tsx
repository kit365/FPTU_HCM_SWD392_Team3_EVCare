import { Box, Card, Typography, Alert } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";

export const PaymentSuccessMessage = () => {
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#fafbfc", p: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Card
        sx={{
          borderRadius: 2,
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          p: 4,
          textAlign: "center",
          maxWidth: "400px",
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
          <Typography variant="h5" sx={{ fontWeight: 600, color: "#111827", mb: 1 }}>
            Thanh toán thành công!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Giao dịch đã được xử lý thành công
          </Typography>
        </Box>

        <Alert severity="success" sx={{ mb: 2 }}>
          Bạn có thể đóng cửa sổ này. Nhân viên sẽ được thông báo về giao dịch của bạn.
        </Alert>
      </Card>
    </Box>
  );
};

