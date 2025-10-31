export const PAYMENT_GATEWAYS = {
  VNPAY: 'VNPAY',
  MOMO: 'MOMO',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CASH: 'CASH',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

export const PAYMENT_GATEWAY_LABELS: Record<string, string> = {
  VNPAY: 'Thanh toán qua VNPay',
  MOMO: 'Thanh toán qua Momo',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
  CASH: 'Tiền mặt',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ thanh toán',
  PROCESSING: 'Đang xử lý',
  SUCCESS: 'Thanh toán thành công',
  FAILED: 'Thanh toán thất bại',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Đã hoàn tiền',
};
