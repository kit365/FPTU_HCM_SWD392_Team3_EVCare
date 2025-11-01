import { apiClient } from './api';
import type { ApiResponse } from '../types/api';
import type {
  WarrantyPackage,
  WarrantyPackagePart,
  CreateWarrantyPackageRequest,
  UpdateWarrantyPackageRequest,
  CreateWarrantyPackagePartRequest,
  UpdateWarrantyPackagePartRequest,
  WarrantyPackageSearchRequest,
  WarrantyPackagePartSearchRequest
} from '../types/warranty.types';

const BASE_URL = '/warranty-package';

export const warrantyService = {
  // Warranty Package endpoints
  searchWarrantyPackages: async (params: WarrantyPackageSearchRequest) => {
    const query = new URLSearchParams({
      page: String(params.page),
      size: String(params.pageSize),
      ...(params.keyword ? { keyword: params.keyword } : {}),
      ...(params.isValid !== undefined ? { isValid: String(params.isValid) } : {}),
    }).toString();
    
    const response = await apiClient.get<ApiResponse<{
      data: WarrantyPackage[];
      totalPages: number;
      totalElements: number;
      page: number;
      size: number;
      last: boolean;
    }>>(`${BASE_URL}?${query}`);
    return response;
  },

  getWarrantyPackageById: async (id: string): Promise<WarrantyPackage> => {
    const response = await apiClient.get<ApiResponse<WarrantyPackage>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  createWarrantyPackage: async (data: CreateWarrantyPackageRequest) => {
    const response = await apiClient.post<ApiResponse<string>>(`${BASE_URL}`, data);
    return response;
  },

  updateWarrantyPackage: async (id: string, data: UpdateWarrantyPackageRequest) => {
    const response = await apiClient.patch<ApiResponse<string>>(`${BASE_URL}/${id}`, data);
    return response;
  },

  deleteWarrantyPackage: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<string>>(`${BASE_URL}/${id}`);
    return response;
  },

  // Warranty Package Part endpoints
  getWarrantyPackageParts: async (params: WarrantyPackagePartSearchRequest) => {
    const query = new URLSearchParams({
      page: String(params.page),
      size: String(params.pageSize),
    }).toString();
    
    const response = await apiClient.get<ApiResponse<{
      data: WarrantyPackagePart[];
      totalPages: number;
      totalElements: number;
      page: number;
      size: number;
      last: boolean;
    }>>(`${BASE_URL}/${params.warrantyPackageId}/parts?${query}`);
    return response;
  },

  getWarrantyPackagePartById: async (id: string): Promise<WarrantyPackagePart> => {
    const response = await apiClient.get<ApiResponse<WarrantyPackagePart>>(`${BASE_URL}/parts/${id}`);
    return response.data.data;
  },

  createWarrantyPackagePart: async (
    warrantyPackageId: string,
    data: CreateWarrantyPackagePartRequest
  ) => {
    const response = await apiClient.post<ApiResponse<string>>(
      `${BASE_URL}/${warrantyPackageId}/parts`,
      data
    );
    return response;
  },

  updateWarrantyPackagePart: async (id: string, data: UpdateWarrantyPackagePartRequest) => {
    const response = await apiClient.patch<ApiResponse<string>>(`${BASE_URL}/parts/${id}`, data);
    return response;
  },

  deleteWarrantyPackagePart: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<string>>(`${BASE_URL}/parts/${id}`);
    return response;
  },
};

