import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { carModelService } from "../service/carModelService";

import type { VehicleProps } from "../types/admin/car.types";
import type { 
  GetVehicleTypeListRequest, 
  VehicleDetailResponse,
  CreateVehicleTypeRequest,
  UpdateVehicleTypeRequest
} from "../types/carModel";

export const useVehicleType = () => {
  const [vehicleList, setVehicleList] = useState<VehicleProps[]>([]);
  const [vehicleDetail, setVehicleDetail] = useState<VehicleDetailResponse | null>(null);
  const [vehicleTypeOptions, setVehicleTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  /** 🔹 Lấy danh sách mẫu xe (list + phân trang) */
  const fetchVehicleTypeList = useCallback(async (params: GetVehicleTypeListRequest) => {
    setLoading(true);
    try {
      const response = await carModelService.getVehicleTypeList(params);
      if (response?.data?.success) {
        const data = response.data.data;
        setVehicleList(data.data);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        toast.error(response?.data?.message || "Không thể tải danh sách mẫu xe!");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi tải danh sách mẫu xe!");
    } finally {
      setLoading(false);
    }
  }, []);

  /** 🔹 Lấy chi tiết mẫu xe theo ID */
  const getVehicleType = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await carModelService.findVehicleTypeById(id);
      if (response?.data.success) {
        setVehicleDetail(response.data.data);
        return response.data.data;
      } else {
        toast.error(response?.data.message || "Không tìm thấy mẫu xe!");
        return null;
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi lấy thông tin mẫu xe!");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createVehicleType = useCallback(async (data: CreateVehicleTypeRequest) => {
    setLoading(true);
    try {
      const response = await carModelService.createVehicleType(data);
      if (response?.data.success) {
        toast.success(response?.data.message || "Tạo mẫu xe thành công!");
        return true;
      } else {
        toast.error(response?.data.message || "Tạo mẫu xe thất bại!");
        return false;
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi tạo mẫu xe!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateVehicleType = useCallback(async (id: string, data: UpdateVehicleTypeRequest) => {
    setLoading(true);
    try {
      const response = await carModelService.updateVehicleType(id, data);
      if (response?.data.success) {
        toast.success(response?.data.message || "Cập nhật mẫu xe thành công!");
        return true;
      } else {
        toast.error(response?.data.message || "Cập nhật mẫu xe thất bại!");
        return false;
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi cập nhật mẫu xe!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteVehicleType = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await carModelService.deleteVehicleType(id);
      if (response?.data.success) {
        toast.success(response?.data.message || "Xóa mẫu xe thành công!");
        return true;
      } else {
        toast.error(response?.data.message || "Xóa mẫu xe thất bại!");
        return false;
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi xóa mẫu xe!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /** 🔹 Lấy danh sách tên mẫu xe cho dropdown */
  const fetchVehicleTypeNames = useCallback(async () => {
    setLoading(true);
    try {
      const response = await carModelService.getVehicleTypeList({ page: 0, pageSize: 1000 });
      if (response?.data?.success) {
        const data = response.data.data;
        const options = Array.isArray(data?.data) 
          ? data.data.map((item: VehicleProps) => ({
              value: item.vehicleTypeId,
              label: item.vehicleTypeName
            }))
          : [];
        setVehicleTypeOptions(options);
      } else {
        setVehicleTypeOptions([]);
      }
    } catch (error: any) {
      // Không có dữ liệu thì trả về [] thay vì hiển thị lỗi
      setVehicleTypeOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    vehicleList,
    vehicleDetail,
    vehicleTypeOptions,
    loading,
    totalPages,
    totalElements,
    fetchVehicleTypeList,
    fetchVehicleTypeNames,
    getVehicleType,
    createVehicleType,
    updateVehicleType,
    deleteVehicleType,
  };
};
