//gọi api
import { API_BASE_URL } from "../constants/apiConstants";
import type {
  GetVehicleTypeListRequest,
  VehicleListResponse,
  CreateVehicleTypeRequest,
  CreateVehicleTypeResponse,
  VehicleDetailResponse,
  UpdateVehicleTypeRequest
} from "../type/carModel";
import { apiClient } from "./api";
import { VEHICLE_TYPE_BY_ID, VEHICLE_TYPE_ENDPOINT } from "../constants/vehicle-type.constant";
import type { ApiResponse } from "../types/api";


const API_BASE = `${API_BASE_URL}`;

export const carModelService = {
  getVehicleTypeList: async (params: GetVehicleTypeListRequest) => {
    const response = await apiClient.get<VehicleListResponse>(
      `${API_BASE}/${VEHICLE_TYPE_ENDPOINT}`,
      { params }
    );
    console.log("GỌI API THÀNH CÔNG, RESPONSE:", response);
    return response;
  },
  createVehicleType: async (data: CreateVehicleTypeRequest) => {
    const response = await apiClient.post<CreateVehicleTypeResponse>(
      `${API_BASE}/${VEHICLE_TYPE_ENDPOINT}`,
      data
    );
    console.log("TẠO MỚI VEHICLE TYPE RESPONSE:", response);
    return response;
  },

  findVehicleTypeById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<VehicleDetailResponse>>(
      `${API_BASE}/${VEHICLE_TYPE_BY_ID(id)}`
    );
    console.log("TÌM VEHICLE TYPE BY ID RESPONSE:", response);
    return response;
  },

  updateVehicleType: async (id: string, data: UpdateVehicleTypeRequest) => {
    const response = await apiClient.patch<ApiResponse<UpdateVehicleTypeRequest>>(
      `${API_BASE}/${VEHICLE_TYPE_BY_ID(id)}`,
      data
    );
    return response;
  }


};