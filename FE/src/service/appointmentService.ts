import { apiClient } from './api';
import type {
  AppointmentResponse,
  AppointmentSearchRequest,
  AppointmentApiResponse,
  AppointmentListApiResponse
} from '../types/appointment.types';

// Appointment Service
export const appointmentService = {
  // Search with pagination - GET /api/v1/appointment/
  search: async (params: AppointmentSearchRequest) => {
    const queryParams = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      ...(params.keyword ? { keyword: params.keyword } : {}),
    }).toString();
    
    const response = await apiClient.get<AppointmentListApiResponse>(
      `/appointment/?${queryParams}`
    );
    console.log("GET APPOINTMENTS RESPONSE:", response);
    return response;
  },

  // Get by id - GET /api/v1/appointment/{id}
  getById: async (id: string): Promise<AppointmentResponse> => {
    const response = await apiClient.get<AppointmentApiResponse>(
      `/appointment/${id}`
    );
    console.log("GET APPOINTMENT BY ID RESPONSE:", response);
    return response.data.data;
  }
};

