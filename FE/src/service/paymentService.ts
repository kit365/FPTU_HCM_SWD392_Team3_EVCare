import { apiClient } from './api';
import type { 
  CreatePaymentRequest, 
  PaymentStatusResponse,
  PagePaymentResponse 
} from '../types/payment.types';

const PAYMENT_API_PATH = '/api/payment';

export const paymentService = {
  /**
   * Tạo payment URL
   */
  async createPayment(request: CreatePaymentRequest): Promise<PaymentStatusResponse> {
    const response = await apiClient.post<PaymentStatusResponse>(
      `${PAYMENT_API_PATH}/create`,
      request
    );
    return response.data;
  },

  /**
   * Kiểm tra trạng thái thanh toán
   */
  async checkPaymentStatus(transactionId: string): Promise<PaymentStatusResponse> {
    const response = await apiClient.get<PaymentStatusResponse>(
      `${PAYMENT_API_PATH}/status/${transactionId}`
    );
    return response.data;
  },

  /**
   * Lấy lịch sử thanh toán theo invoice
   */
  async getPaymentHistoryByInvoice(
    invoiceId: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDir: string = 'DESC'
  ): Promise<PagePaymentResponse> {
    const response = await apiClient.get<PagePaymentResponse>(
      `${PAYMENT_API_PATH}/invoice/${invoiceId}`,
      {
        params: { page, size, sortBy, sortDir }
      }
    );
    return response.data;
  },

  /**
   * Lấy toàn bộ lịch sử thanh toán
   */
  async getAllPaymentHistory(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDir: string = 'DESC'
  ): Promise<PagePaymentResponse> {
    const response = await apiClient.get<PagePaymentResponse>(
      `${PAYMENT_API_PATH}/history`,
      {
        params: { page, size, sortBy, sortDir }
      }
    );
    return response.data;
  },

  /**
   * Redirect đến payment URL
   */
  redirectToPayment(paymentUrl: string): void {
    window.location.href = paymentUrl;
  },
};
