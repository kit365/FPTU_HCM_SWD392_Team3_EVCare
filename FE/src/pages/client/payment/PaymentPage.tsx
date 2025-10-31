import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Select, Button, Input, Alert, Spin, message } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { paymentService } from '../../../service/paymentService';
import { PAYMENT_GATEWAY_LABELS } from '../../../constants/paymentConstants';
import type { PaymentGateway } from '../../../types/payment.types';

const { Option } = Select;
const { TextArea } = Input;

export function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const invoiceId = searchParams.get('invoiceId');
  const amount = parseFloat(searchParams.get('amount') || '0');
  
  const [gateway, setGateway] = useState<PaymentGateway>('VNPAY');
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState('');
  
  useEffect(() => {
    if (!invoiceId || amount <= 0) {
      setError('Thông tin hóa đơn không hợp lệ');
      return;
    }
  }, [invoiceId, amount]);

  const handleCreatePayment = async () => {
    if (!invoiceId || amount <= 0) {
      message.error('Vui lòng cung cấp thông tin hóa đơn hợp lệ');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await paymentService.createPayment({
        invoiceId,
        gateway,
        amount,
        currency: 'VND',
        customerInfo,
        orderDescription: `Thanh toán hóa đơn ${invoiceId}`,
      });

      if (response.data.paymentUrl) {
        setPaymentUrl(response.data.paymentUrl);
        // Auto redirect after 3 seconds
        setTimeout(() => {
          window.location.href = response.data.paymentUrl;
        }, 3000);
      } else {
        setError('Không thể tạo payment URL');
      }
    } catch (err: any) {
      console.error('Error creating payment:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handleManualRedirect = () => {
    if (paymentUrl) {
      window.location.href = paymentUrl;
    }
  };

  const handleBack = () => {
    navigate('/client/car-profile');
  };

  if (!invoiceId || amount <= 0) {
    return (
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <Alert
          message="Thông tin không hợp lệ"
          description="Vui lòng kiểm tra lại thông tin hóa đơn."
          type="error"
          showIcon
        />
        <Button onClick={handleBack} style={{ marginTop: '16px' }}>
          <ArrowLeftOutlined /> Quay lại
        </Button>
      </div>
    );
  }

  if (paymentUrl) {
    return (
      <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '24px' }} />
            <h2>Đang chuyển hướng đến trang thanh toán...</h2>
            <p>Vui lòng chờ trong giây lát</p>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            <div style={{ marginTop: '24px' }}>
              <Button type="primary" size="large" onClick={handleManualRedirect}>
                Chuyển đến trang thanh toán
              </Button>
              <Button style={{ marginLeft: '12px', marginTop: '12px' }} onClick={() => setPaymentUrl(null)}>
                Quay lại
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card
        title={
          <div>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBack}
              style={{ marginRight: '16px' }}
            >
              Quay lại
            </Button>
            Thanh toán hóa đơn
          </div>
        }
      >
        {error && (
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: '24px' }}
          />
        )}

        <div style={{ marginBottom: '24px' }}>
          <h3>Thông tin hóa đơn</h3>
          <p><strong>Mã hóa đơn:</strong> {invoiceId}</p>
          <p><strong>Số tiền:</strong> {amount.toLocaleString('vi-VN')} VND</p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Chọn phương thức thanh toán:
          </label>
          <Select
            value={gateway}
            onChange={(value) => setGateway(value as PaymentGateway)}
            style={{ width: '100%' }}
            size="large"
          >
            <Option value="VNPAY">{PAYMENT_GATEWAY_LABELS.VNPAY}</Option>
            {/* <Option value="MOMO">{PAYMENT_GATEWAY_LABELS.MOMO}</Option> */}
          </Select>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Thông tin khách hàng (tùy chọn):
          </label>
          <TextArea
            rows={4}
            value={customerInfo}
            onChange={(e) => setCustomerInfo(e.target.value)}
            placeholder="Nhập thông tin bổ sung (nếu có)"
          />
        </div>

        <Button
          type="primary"
          size="large"
          onClick={handleCreatePayment}
          loading={loading}
          block
        >
          Tiến hành thanh toán
        </Button>
      </Card>
    </div>
  );
}
