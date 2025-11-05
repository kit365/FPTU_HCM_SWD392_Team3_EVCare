import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  Button,
  Alert,
} from "@mui/material";
import { Cancel, ArrowBack, Home, Refresh } from "@mui/icons-material";

export const ClientPaymentFail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const appointmentId = searchParams.get("appointmentId");
  const error = searchParams.get("error");

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#fafbfc", p: 3 }}>
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <Card sx={{ p: 4, boxShadow: 3 }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Cancel sx={{ fontSize: 80, color: "#ef4444", mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: "#ef4444" }}>
              Thanh toán thất bại
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Giao dịch thanh toán không thành công
            </Typography>
          </Box>

          <Alert severity="error" sx={{ mb: 3 }}>
            {error ? (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Lỗi thanh toán:
                </Typography>
                <Typography variant="body2">{error}</Typography>
              </Box>
            ) : (
              "Thanh toán không thành công. Vui lòng thử lại hoặc liên hệ với nhân viên để được hỗ trợ."
            )}
          </Alert>

          <Box
            sx={{
              p: 3,
              backgroundColor: "#fef2f2",
              borderRadius: 2,
              border: "1px solid #fecaca",
              mb: 3,
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              💡 <strong>Lưu ý:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • Cuộc hẹn của bạn vẫn được giữ nguyên và không bị hủy
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • Bạn có thể thử thanh toán lại bất cứ lúc nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Nếu bạn đã thanh toán nhưng nhận thông báo này, vui lòng liên hệ nhân viên để được hỗ trợ
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            {appointmentId && (
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={() => navigate(`/client/invoice/${appointmentId}`)}
                sx={{
                  backgroundColor: "#3b82f6",
                  minWidth: "160px",
                  "&:hover": {
                    backgroundColor: "#2563eb",
                  },
                }}
              >
                Thử thanh toán lại
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/client/appointment-history")}
              sx={{ minWidth: "160px" }}
            >
              Quay lại lịch sử
            </Button>
            <Button
              variant="text"
              startIcon={<Home />}
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

