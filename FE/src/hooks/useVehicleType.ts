import { useState } from "react";
import { notify } from "../components/admin/common/Toast";
import type { CreateVehicleTypeRequest, CreateVehicleTypeResponse, UpdateVehicleTypeRequest, VehicleDetailResponse } from "../type/carModel";
import { carModelService } from "../service/carModelService";


export function useVehicleType() {
  const [isLoading, setIsLoading] = useState(false);
  const [vehicleType, setVehicleType] = useState<VehicleDetailResponse | null>(null);
  const createVehicleType = async (data: CreateVehicleTypeRequest): Promise<CreateVehicleTypeResponse> => {
    setIsLoading(true);
    try {
      const response = await carModelService.createVehicleType(data);

      if (response?.data.success === true) {
        notify.success(response?.data.message || "Tạo mới mẫu xe thành công");
      } else {
        notify.error(response?.data.message || "Tạo mới mẫu xe thất bại!");
      }
      return response.data;
    } catch (error) {
      notify.error("Có lỗi xảy ra khi tạo mới!");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

   const getVehicleType = async (id: string): Promise<VehicleDetailResponse | null> => {
    setIsLoading(true);
    try {
      const response = await carModelService.findVehicleTypeById(id);
      if (response?.data.success === true) {
        setVehicleType(response.data.data);
        return response.data.data;
      } else {
        notify.error(response?.data.message || "Lấy thông tin mẫu xe thất bại!");
        return null;
      }
    } catch (error) {
      notify.error("Có lỗi xảy ra khi lấy thông tin mẫu xe!");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const updateVehicleType = async(id: string, data: UpdateVehicleTypeRequest) : Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await carModelService.updateVehicleType(id, data);
      if (response?.data.success === true) {
        notify.success(response?.data.message || "Cập nhật mẫu xe thành công");
        return true;
      } else {
        notify.error(response?.data.message || "Cập nhật mẫu xe thất bại!");
        return false;
      }
    } catch (error) {
      notify.error("Có lỗi xảy ra khi cập nhật mẫu xe!");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }


  return {
    isLoading,
    createVehicleType,
    getVehicleType,
    updateVehicleType,
    vehicleType,
  };
}