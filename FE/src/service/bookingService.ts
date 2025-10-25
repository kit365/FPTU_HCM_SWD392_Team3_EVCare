import { API_BASE_URL } from "../constants/apiConstants";
import type {
  GetVehicleTypeParams,
  GetServiceTypeParams,
  VehicleTypeResponse,
  ServiceTypeResponse,
  ServiceModeResponse,
  CreateAppointmentRequest,
  CreateAppointmentResponse,
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
      `${API_BASE}/appointment/status/{id}`
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
};
