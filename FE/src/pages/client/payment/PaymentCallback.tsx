import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Alert, Button, Result, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, HomeOutlined } from '@ant-design/icons';
import { paymentService } from '../../../service/paymentService';

export function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'success' | 'failure' | 'processing'>('processing');
  const [message, setMessage] = useState('Đang xử lý...');

  useEffect(() => {
    const transactionId = searchParams.get('transactionId');
    const code = searchParams.get('code');
    
    if (code === '00' || code === '0') {
      setStatus('success');
      setMessage('Thanh toán thành công!');
    } else {
      setStatus('failure');
      setMessage('Thanh toán thất bại. Vui lòng thử lại.');
    }
  }, [searchParams]);

  const handleBackHome = () => {
    navigate('/client');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', minHeight: '100vh' }}>
      {status === 'processing' && (
        <Card>
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '24px', fontSize: '16px' }}>{message}</p>
          </div>
        </Card>
      )}

      {status === 'success' && (
        <Card>
          <Result
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title="Thanh toán thành công!"
            subTitle="Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi."
            extra={[
              <Button type="primary" key="home" icon={<HomeOutlined />} onClick={handleBackHome}>
                Về trang chủ
              </Button>,
            ]}
          />
        </Card>
      )}

      {status === 'failure' && (
        <Card>
          <Result
            icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            title="Thanh toán thất bại"
            subTitle={message}
            extra={[
              <Button type="primary" key="home" icon={<HomeOutlined />} onClick={handleBackHome}>
                Về trang chủ
              </Button>,
            ]}
          />
        </Card>
      )}
    </div>
  );
}
