import { Alert, Box, Button, Container, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useInvoice } from "../../../hooks/useInvoice";
import { useEffect } from "react";

export const ClientPaymentFail = () => {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const { getByAppointmentId, invoice } = useInvoice();
  const navigate = useNavigate();

  useEffect(() => {
    if (appointmentId) {
      getByAppointmentId(appointmentId);
    }
  }, [appointmentId, getByAppointmentId]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" color="error" gutterBottom>
          ❌ Thanh toán không thành công
        </Typography>
        
        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
          <Typography variant="subtitle1">
            Rất tiếc, thanh toán của bạn không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu cần giúp đỡ.
          </Typography>
          {invoice?.errorMessage && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Lý do:</strong> {invoice.errorMessage}
            </Typography>
          )}
        </Alert>

        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          {appointmentId && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/client/invoice/${appointmentId}`)}
            >
              Quay lại hóa đơn
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
          >
            Về trang chủ
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ClientPaymentFail;
