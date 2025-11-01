import { Box, Card, Typography, Button, Alert } from "@mui/material";
import { Cancel, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export const PaymentFail = () => {
  const navigate = useNavigate();

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
            <Cancel
              sx={{
                fontSize: 80,
                color: "#ef4444",
                mb: 2,
              }}
            />
            <Typography variant="h4" sx={{ fontWeight: 600, color: "#111827", mb: 1 }}>
              Thanh toán thất bại
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Giao dịch thanh toán không thành công
            </Typography>
          </Box>

          <Alert severity="error" sx={{ mb: 3 }}>
            Quá trình thanh toán đã bị hủy hoặc có lỗi xảy ra. Vui lòng thử lại.
          </Alert>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/admin/appointment-manage")}
              sx={{ minWidth: "160px" }}
            >
              Quay lại danh sách appointment
            </Button>
            <Button
              variant="text"
              onClick={() => navigate("/admin/dashboard")}
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

