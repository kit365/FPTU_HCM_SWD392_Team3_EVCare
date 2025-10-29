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
import { publicApiClient } from "./api";

const API_BASE = `${API_BASE_URL}`;

// Service cho các API public (không cần authentication)
export const publicService = {
  // Get vehicle types list (public API)
  getVehicleTypes: async (params: GetVehicleTypeParams) => {
    const response = await publicApiClient.get<VehicleTypeResponse>(
      `${API_BASE}/vehicle-type/public/vehicle-types`,
      { params }
    );
    console.log("GET VEHICLE TYPES RESPONSE:", response);
    return response;
  },

  // Get service types by vehicle type id (public API)
  getServiceTypesByVehicleId: async (vehicleTypeId: string, params: GetServiceTypeParams) => {
    const response = await publicApiClient.get<ServiceTypeResponse>(
      `${API_BASE}/service-type/public/vehicle_type/${vehicleTypeId}`,
      { params: { ...params, isActive: true } }
    );
    console.log("GET SERVICE TYPES RESPONSE:", response);
    return response;
  },

  // Get service modes (public API)
  getServiceModes: async () => {
    const response = await publicApiClient.get<ServiceModeResponse>(
      `${API_BASE}/appointment/public/service-mode/`
    );
    console.log("GET SERVICE MODES RESPONSE:", response);
    return response;
  },

  // Create appointment (public API)
  createAppointment: async (data: CreateAppointmentRequest) => {
    const response = await publicApiClient.post<CreateAppointmentResponse>(
      `${API_BASE}/appointment/public/`,
      data
    );
    console.log("CREATE APPOINTMENT RESPONSE:", response);
    return response;
  },
};
