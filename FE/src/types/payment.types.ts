// Payment Gateway Types

export enum PaymentGateway {
  VNPAY = 'VNPAY',
  MOMO = 'MOMO',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
}

export enum PaymentTransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export interface CreatePaymentRequest {
  invoiceId?: string;
  appointmentId?: string;
  gateway: PaymentGateway;
  amount: number;
  currency?: string;
  customerInfo?: string;
  orderDescription?: string;
}

export interface PaymentResponse {
  transactionId: string;
  invoiceId?: string;
  appointmentId?: string;
  gateway: PaymentGateway;
  amount: number;
  currency: string;
  transactionReference: string;
  paymentUrl: string;
  status: PaymentTransactionStatus;
  createdAt: string;
  paymentDate?: string;
  gatewayTransactionId?: string;
  customerInfo?: string;
}

export interface PagePaymentResponse {
  success: boolean;
  message: string;
  data: {
    data: PaymentResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  timestamp: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  message: string;
  data: PaymentResponse;
  timestamp: string;
}

// Invoice types
export interface Invoice {
  invoiceId: string;
  appointmentId?: string;
  paymentMethodId: string;
  totalAmount: number;
  paidAmount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  invoiceDate: string;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceListResponse {
  success: boolean;
  message: string;
  data: {
    data: Invoice[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  timestamp: string;
}
