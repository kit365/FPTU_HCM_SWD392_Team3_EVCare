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
  status: string; // PENDING, PAID, CANCELLED
  invoiceDate: string;
  dueDate?: string;
  notes?: string;
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
  originalPrice?: number; // Giá gốc của phụ tùng (trước giảm giá)
  isUnderWarranty?: boolean; // Phụ tùng có được bảo hành không
  warrantyDiscountType?: string; // PERCENTAGE hoặc FREE
  warrantyDiscountValue?: number; // Giá trị giảm giá (% hoặc null nếu FREE)
  warrantyDiscountAmount?: number; // Số tiền được giảm
}

export interface PaymentRequest {
  paymentMethod?: string;
  paidAmount?: number;
  notes?: string;
}

