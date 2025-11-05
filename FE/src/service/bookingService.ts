import type {
  GetVehicleTypeParams,
  GetServiceTypeParams,
  VehicleTypeResponse,
  ServiceTypeResponse,
  ServiceModeResponse,
  CreateAppointmentRequest,
  CreateAppointmentResponse,
  UserAppointmentResponse,
} from "../types/booking.types";
import { apiClient } from "./api";

export const bookingService = {
  // Get vehicle types list
  getVehicleTypes: async (params: GetVehicleTypeParams) => {
    const response = await apiClient.get<VehicleTypeResponse>(
      "/vehicle-type/",
      { params }
    );
    console.log("GET VEHICLE TYPES RESPONSE:", response);
    return response;
  },

  // Get service types by vehicle type id
  getServiceTypesByVehicleId: async (vehicleTypeId: string, params: GetServiceTypeParams) => {
    const response = await apiClient.get<ServiceTypeResponse>(
      `/service-type/vehicle_type/${vehicleTypeId}`,
      { params }
    );
    console.log("GET SERVICE TYPES RESPONSE:", response);
    return response;
  },

  // Get service modes
  getServiceModes: async () => {
    const response = await apiClient.get<ServiceModeResponse>(
      "/appointment/service-mode/"
    );
    console.log("GET SERVICE MODES RESPONSE:", response);
    return response;
  },

  // Create appointment
  createAppointment: async (data: CreateAppointmentRequest) => {
    const response = await apiClient.post<CreateAppointmentResponse>(
      "/appointment/",
      data
    );
    console.log("CREATE APPOINTMENT RESPONSE:", response);
    return response;
  },

  // Get user appointments (for authenticated customer)
  getUserAppointments: async (userId: string, params: { page: number; pageSize: number; keyword?: string }) => {
    // Use search/customer endpoint which allows authenticated customers
    const response = await apiClient.get<UserAppointmentResponse>(
      "/appointment/search/customer/",
      { 
        params: {
          page: params.page ?? 0,
          pageSize: params.pageSize ?? 10,
          keyword: params.keyword || undefined,
        }
      }
    );
    console.log("GET USER APPOINTMENTS RESPONSE:", response);
    return response;
  },

  // Search appointments for customer by email or phone (authenticated users)
  searchAppointmentsForCustomer: async (params: { page?: number; pageSize?: number; keyword?: string }) => {
    // Ensure pageSize is at least 1
    const validPageSize = (params.pageSize && params.pageSize > 0) ? params.pageSize : 10;
    const validPage = (params.page !== undefined && params.page >= 0) ? params.page : 0;
    
    const response = await apiClient.get(
      "/appointment/search/customer/",
      {
        params: {
          page: validPage,
          pageSize: validPageSize,
          keyword: params.keyword ?? '',
        }
      }
    );
    console.log("SEARCH APPOINTMENTS (CUSTOMER) RESPONSE:", response);
    return response;
  },

  // Search appointments for guest by email or phone (unauthenticated users)
  searchAppointmentsForGuest: async (params: { page?: number; pageSize?: number; keyword?: string }) => {
    // Ensure pageSize is at least 1
    const validPageSize = (params.pageSize && params.pageSize > 0) ? params.pageSize : 10;
    const validPage = (params.page !== undefined && params.page >= 0) ? params.page : 0;
    
    const response = await apiClient.get(
      "/appointment/search/guest/",
      {
        params: {
          page: validPage,
          pageSize: validPageSize,
          keyword: params.keyword ?? '',
        }
      }
    );
    console.log("SEARCH APPOINTMENTS (GUEST) RESPONSE:", response);
    return response;
  },

  // Get appointment by ID
  getAppointmentById: async (appointmentId: string) => {
    const response = await apiClient.get<{ success: boolean; message: string; data: UserAppointment }>(
      `/appointment/${appointmentId}`
    );
    console.log("GET APPOINTMENT BY ID RESPONSE:", response);
    return response;
  },

  // Update appointment for customer
  updateAppointmentForCustomer: async (appointmentId: string, data: any) => {
    const response = await apiClient.patch<CreateAppointmentResponse>(
      `/appointment/customer/${appointmentId}`,
      data
    );
    console.log("UPDATE APPOINTMENT FOR CUSTOMER RESPONSE:", response);
    return response;
  },

  // Cancel appointment for customer
  cancelAppointmentForCustomer: async (appointmentId: string) => {
    const response = await apiClient.patch<{ success: boolean; message: string }>(
      `/appointment/cancel/customer/${appointmentId}`
    );
    console.log("CANCEL APPOINTMENT FOR CUSTOMER RESPONSE:", response);
    return response;
  },

  // Send OTP for guest appointment
  sendOtpForGuestAppointment: async (appointmentId: string, email: string) => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/appointment/guest/${appointmentId}/send-otp`,
      { email }
    );
    return response.data;
  },

  // Verify OTP for guest appointment and get appointment details
  verifyOtpForGuestAppointment: async (appointmentId: string, email: string, otp: string) => {
    const response = await apiClient.post<any>(
      `/appointment/guest/${appointmentId}/verify-otp`,
      { email, otp }
    );
    
    // Kiểm tra status code - vì apiClient không throw error cho 4xx
    if (response.status >= 400) {
      const errorMessage = response.data?.message || "Xác thực OTP thất bại";
      const error = new Error(errorMessage) as any;
      error.response = { data: { message: errorMessage } };
      throw error;
    }
    
    // Kiểm tra response có hợp lệ không
    if (!response.data || !response.data.success) {
      const errorMessage = response.data?.message || "Xác thực OTP thất bại";
      const error = new Error(errorMessage) as any;
      error.response = { data: { message: errorMessage } };
      throw error;
    }
    
    if (!response.data.data) {
      const errorMessage = "Không tìm thấy thông tin cuộc hẹn";
      const error = new Error(errorMessage) as any;
      error.response = { data: { message: errorMessage } };
      throw error;
    }
    
    return response.data.data; // Return appointment data
  },

  // Update appointment for guest (with OTP verification)
  updateGuestAppointment: async (appointmentId: string, email: string, otp: string, data: any) => {
    const response = await apiClient.patch<CreateAppointmentResponse>(
      `/appointment/guest/${appointmentId}`,
      { email, otp, ...data }
    );
    console.log("UPDATE GUEST APPOINTMENT RESPONSE:", response);
    return response;
  },

  // Check warranty eligibility
  checkWarrantyEligibility: async (data: {
    customerId?: string;
    customerEmail?: string;
    customerPhoneNumber?: string;
    customerFullName?: string;
  }) => {
    const response = await apiClient.post(
      "/appointment/check-warranty-eligibility",
      data
    );
    console.log("CHECK WARRANTY ELIGIBILITY RESPONSE:", response);
    return response;
  },
};
