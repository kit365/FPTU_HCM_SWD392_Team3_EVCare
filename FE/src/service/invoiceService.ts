
import type { InvoiceResponse, PaymentRequest } from "../types/invoice.types";
import type { ApiResponse } from "../types/api";
import { apiClient } from "./api";

const BASE_URL = "/invoice";

export const invoiceService = {
  /**
   * Lấy invoice theo appointmentId
   */
  getByAppointmentId: async (appointmentId: string): Promise<InvoiceResponse> => {
    const response = await apiClient.get<ApiResponse<InvoiceResponse>>(
      `${BASE_URL}/appointment/${appointmentId}`
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
};

