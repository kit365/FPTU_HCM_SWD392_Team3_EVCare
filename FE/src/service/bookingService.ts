import { API_BASE_URL } from "../constants/apiConstants";
import type {
  GetVehicleTypeParams,
  GetServiceTypeParams,
  VehicleTypeResponse,
  ServiceTypeResponse,
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
  getServiceTypes: async (params: GetServiceTypeParams) => {
    const response = await apiClient.get<ServiceTypeResponse>(
      `${API_BASE}/service-type/`,
      { params }
    );
    console.log("GET SERVICE TYPES RESPONSE:", response);
    return response;
  },
};
