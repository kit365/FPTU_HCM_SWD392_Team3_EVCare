export interface InvoiceResponse {
  invoiceId: string;
  appointmentId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethodId?: string;
  paymentMethodName?: string;
  totalAmount: number;
  paidAmount: number;
  status: string; // PENDING, PAID, CANCELLED, FAILED
  invoiceDate: string;
  dueDate?: string;
  notes?: string;
  errorMessage?: string; // Thêm trường này để lưu thông báo lỗi
  createdAt: string;
  updatedAt: string;
  
  // Appointment details
  vehicleNumberPlate?: string;
  vehicleTypeName?: string;
  vehicleManufacturer?: string;
  serviceMode?: string;
  scheduledAt?: string;
  
  // Services and maintenance records
  maintenanceDetails?: MaintenanceManagementSummary[];
}

export interface MaintenanceManagementSummary {
  serviceName: string;
  serviceCost: number;
  partsUsed: PartUsed[];
}

export interface PartUsed {
  partName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isUnderWarranty?: boolean; // Phụ tùng có bảo hành hay không
  warrantyPackageName?: string; // Tên gói bảo hành (nếu có)
  originalPrice?: number; // Giá gốc của phụ tùng (trước khi áp dụng bảo hành)
}

export interface PaymentRequest {
  paymentMethod?: string;
  paidAmount?: number;
  notes?: string;
}

