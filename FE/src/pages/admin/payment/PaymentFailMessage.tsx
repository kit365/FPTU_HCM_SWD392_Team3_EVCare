import { Box, Card, Typography, Alert } from "@mui/material";
import { Cancel } from "@mui/icons-material";

export const PaymentFailMessage = () => {
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
          <Cancel
            sx={{
              fontSize: 80,
              color: "#ef4444",
              mb: 2,
            }}
          />
          <Typography variant="h5" sx={{ fontWeight: 600, color: "#111827", mb: 1 }}>
            Thanh toán thất bại
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Giao dịch thanh toán không thành công
          </Typography>
        </Box>

        <Alert severity="error" sx={{ mb: 2 }}>
          Vui lòng thử lại hoặc liên hệ với nhân viên để được hỗ trợ.
        </Alert>
      </Card>
    </Box>
  );
};

