//gọi api
import { API_BASE_URL } from "../constants/apiConstants";
import type {
  GetVehicleTypeListRequest,
  VehicleListResponse,
  CreateVehicleTypeRequest,
  CreateVehicleTypeResponse
} from "../type/carModel";
import { apiClient } from "./api";

const API_BASE = `${API_BASE_URL}`;

export const carModelService = {
  getVehicleTypeList: async (params: GetVehicleTypeListRequest) => {
    const response = await apiClient.get<VehicleListResponse>(
      `${API_BASE}/vehicle-type/`,
      { params }
    );
    console.log("GỌI API THÀNH CÔNG, RESPONSE:", response);
    return response;
  },
  createVehicleType: async (data: CreateVehicleTypeRequest) => {
    const response = await apiClient.post<CreateVehicleTypeResponse>(
      `${API_BASE}/vehicle-type/`,
      data
    );
    console.log("TẠO MỚI VEHICLE TYPE RESPONSE:", response);
    return response;
  },
};