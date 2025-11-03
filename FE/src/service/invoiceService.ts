
import type { InvoiceResponse, PaymentRequest } from "../types/invoice.types";
import type { ApiResponse } from "../types/api";
import { apiClient } from "./api";

const BASE_URL = "/invoice";
const VNPAY_BASE_URL = "/vnpay"; // apiClient đã có baseURL là /api/v1 rồi

export const invoiceService = {
  /**
   * Lấy invoice theo appointmentId
   */
  getByAppointmentId: async (appointmentId: string): Promise<InvoiceResponse> => {
    const response = await apiClient.get<ApiResponse<InvoiceResponse>>(
      `${BASE_URL}/appointment/${appointmentId}`,
      {
        timeout: 20000, // 20 giây cho invoice API
      }
    );
    return response.data.data;
  },

  /**
   * Thanh toán invoice bằng CASH
   */
  payCash: async (invoiceId: string, paymentRequest: PaymentRequest): Promise<void> => {
    await apiClient.patch<ApiResponse<void>>(
      `${BASE_URL}/${invoiceId}/pay-cash`,
      paymentRequest
    );
  },

  /**
   * Tạo payment URL cho VNPay (đơn giản như code cũ)
   */
  createVnPayPayment: async (appointmentId: string, source: string = "client"): Promise<string> => {
    const url = `${VNPAY_BASE_URL}/create-payment`;
    console.log("🔍 VNPay API call:", {
      VNPAY_BASE_URL,
      fullUrl: url,
      apiClientBaseURL: apiClient.defaults.baseURL,
      appointmentId,
      source
    });
    
    const response = await apiClient.get<ApiResponse<string>>(
      url,
      {
        params: { appointmentId, source },
        timeout: 30000, // 30 giây cho VNPay API
      }
    );
    return response.data.data;
  },
};

