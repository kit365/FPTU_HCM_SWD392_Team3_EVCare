import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { vehicleProfileService } from "../service/vehicleProfileService";
import type {
  VehicleProfileResponse,
  CreationVehicleProfileRequest,
  UpdationVehicleProfileRequest,
  VehicleProfileSearchParams
} from "../types/vehicle-profile.types";

export const useVehicleProfile = () => {
  const [list, setList] = useState<VehicleProfileResponse[]>([]);
  const [detail, setDetail] = useState<VehicleProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Search/List with pagination
  const search = useCallback(async (params: VehicleProfileSearchParams) => {
    setLoading(true);
    try {
      const response = await vehicleProfileService.search(params);
      if (response?.success) {
        const data = response.data;
        setList(data.data);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        // Không hiện toast, để UI tự xử lý empty state
        console.error('Vehicle profile search response not success:', response?.message);
        setList([]);
      }
    } catch (error: any) {
      console.error('Vehicle profile search error:', error);
      // Không hiện toast, để UI tự xử lý (không có data là trường hợp bình thường)
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get by ID
  const getById = useCallback(async (vehicleId: string) => {
    setLoading(true);
    try {
      const data = await vehicleProfileService.getById(vehicleId);
      setDetail(data);
      return data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải thông tin hồ sơ xe!");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new vehicle profile
  const create = useCallback(async (data: CreationVehicleProfileRequest) => {
    setLoading(true);
    try {
      const vehicleId = await vehicleProfileService.create(data);
      toast.success("Tạo hồ sơ xe thành công!");
      return vehicleId;
    } catch (error: any) {
      console.error('Create vehicle profile error:', error);
      toast.error(error?.response?.data?.message || "Không thể tạo hồ sơ xe!");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update vehicle profile
  const update = useCallback(async (vehicleId: string, data: UpdationVehicleProfileRequest) => {
    setLoading(true);
    try {
      const result = await vehicleProfileService.update(vehicleId, data);
      toast.success("Cập nhật hồ sơ xe thành công!");
      return result;
    } catch (error: any) {
      console.error('Update vehicle profile error:', error);
      toast.error(error?.response?.data?.message || "Không thể cập nhật hồ sơ xe!");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete (soft delete)
  const remove = useCallback(async (vehicleId: string) => {
    setLoading(true);
    try {
      const success = await vehicleProfileService.remove(vehicleId);
      if (success) {
        toast.success("Xóa hồ sơ xe thành công!");
      }
      return success;
    } catch (error: any) {
      console.error('Delete vehicle profile error:', error);
      toast.error(error?.response?.data?.message || "Không thể xóa hồ sơ xe!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Restore deleted vehicle
  const restore = useCallback(async (vehicleId: string) => {
    setLoading(true);
    try {
      const success = await vehicleProfileService.restore(vehicleId);
      if (success) {
        toast.success("Khôi phục hồ sơ xe thành công!");
      }
      return success;
    } catch (error: any) {
      console.error('Restore vehicle profile error:', error);
      toast.error(error?.response?.data?.message || "Không thể khôi phục hồ sơ xe!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get vehicles by user ID
  const getByUserId = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const vehicles = await vehicleProfileService.getByUserId(userId);
      setList(vehicles);
      setTotalPages(1); // Single page since it's all user's vehicles
      setTotalElements(vehicles.length);
      return vehicles;
    } catch (error: any) {
      console.error('Get vehicles by user ID error:', error);
      setList([]);
      setTotalPages(0);
      setTotalElements(0);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    list,
    detail,
    loading,
    totalPages,
    totalElements,
    search,
    getById,
    getByUserId,
    create,
    update,
    remove,
    restore,
  };
};

