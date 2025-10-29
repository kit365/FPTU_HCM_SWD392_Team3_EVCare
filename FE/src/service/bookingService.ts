import { API_BASE_URL } from "../constants/apiConstants";
import type {
  GetVehicleTypeParams,
  GetServiceTypeParams,
  VehicleTypeResponse,
  ServiceTypeResponse,
  ServiceModeResponse,
  CreateAppointmentRequest,
  CreateAppointmentResponse,
  UserAppointmentResponse,
  GuestAppointmentResponse,
  SearchAppointmentParams,
} from "../types/booking.types";
import { apiClient } from "./api";

const API_BASE = `${API_BASE_URL}`;

export const bookingService = {
  // Get vehicle types list
  getVehicleTypes: async (params: GetVehicleTypeParams) => {
    const response = await apiClient.get<VehicleTypeResponse>(
      `${API_BASE}/vehicle-type/`,
      { params }
    );
    console.log("GET VEHICLE TYPES RESPONSE:", response);
    return response;
  },

  // Get service types by vehicle type id
  getServiceTypesByVehicleId: async (vehicleTypeId: string, params: GetServiceTypeParams) => {
    const response = await apiClient.get<ServiceTypeResponse>(
      `${API_BASE}/service-type/vehicle_type/${vehicleTypeId}`,
      { params }
    );
    console.log("GET SERVICE TYPES RESPONSE:", response);
    return response;
  },

  // Get service modes
  getServiceModes: async () => {
    const response = await apiClient.get<ServiceModeResponse>(
      `${API_BASE}/appointment/service-mode/`
    );
    console.log("GET SERVICE MODES RESPONSE:", response);
    return response;
  },

  // Create appointment
  createAppointment: async (data: CreateAppointmentRequest) => {
    const response = await apiClient.post<CreateAppointmentResponse>(
      `${API_BASE}/appointment/`,
      data
    );
    console.log("CREATE APPOINTMENT RESPONSE:", response);
    return response;
  },

  // Get user appointments
  getUserAppointments: async (userId: string, params: { page: number; pageSize: number; keyword?: string }) => {
    const response = await apiClient.get<UserAppointmentResponse>(
      `${API_BASE}/appointment/user/${userId}`,
      { params }
    );
    console.log("GET USER APPOINTMENTS RESPONSE:", response);
    return response;
  },

  // Search appointments for guest (not logged in) - Public API
  searchGuestAppointments: async (params: SearchAppointmentParams) => {
    const response = await fetch(
      `${API_BASE}/appointment/search/guest/?${new URLSearchParams({
        page: (params.page || 0).toString(),
        pageSize: (params.pageSize || 10).toString(),
        ...(params.keyword && { keyword: params.keyword }),
      })}`
    );
    const data = await response.json();
    console.log("SEARCH GUEST APPOINTMENTS RESPONSE:", data);
    return { data };
  },

  // Search appointments for customer (logged in)
  searchCustomerAppointments: async (params: SearchAppointmentParams) => {
    const response = await apiClient.get<UserAppointmentResponse>(
      `${API_BASE}/appointment/search/customer/`,
      { params }
    );
    console.log("SEARCH CUSTOMER APPOINTMENTS RESPONSE:", response);
    return response;
  },
};
