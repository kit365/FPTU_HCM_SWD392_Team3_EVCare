import { useState } from "react";
import { invoiceService } from "../service/invoiceService";
import type { InvoiceResponse, PaymentRequest } from "../types/invoice.types";
import { message } from "antd";

export const useInvoice = () => {
  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);

  const getByAppointmentId = async (appointmentId: string) => {
    setLoading(true);
    try {
      const data = await invoiceService.getByAppointmentId(appointmentId);
      setInvoice(data);
      return data;
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể tải thông tin hóa đơn");
      console.error("Error fetching invoice:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const payCash = async (invoiceId: string, paymentRequest: PaymentRequest) => {
    setPaying(true);
    try {
      await invoiceService.payCash(invoiceId, paymentRequest);
      message.success("Thanh toán thành công!");
      return true;
    } catch (error: any) {
      message.error(error.response?.data?.message || "Thanh toán thất bại");
      console.error("Error paying invoice:", error);
      return false;
    } finally {
      setPaying(false);
    }
  };

  const createVnPayPayment = async (appointmentId: string, source: string = "client") => {
    setPaying(true);
    try {
      const paymentUrl = await invoiceService.createVnPayPayment(appointmentId, source);
      return paymentUrl;
    } catch (error: any) {
      setPaying(false);
      message.error(error.response?.data?.message || "Không thể tạo thanh toán VNPay");
      console.error("Error creating VNPay payment:", error);
      throw error;
    } finally {
      setPaying(false);
    }
  };

  return {
    invoice,
    loading,
    paying,
    getByAppointmentId,
    payCash,
    createVnPayPayment,
    setInvoice, // Expose setInvoice để có thể update invoice mà không trigger loading
  };
};

