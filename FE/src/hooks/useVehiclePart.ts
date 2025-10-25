import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { vehiclePartService } from "../service/vehiclePartService";
import type {
  VehiclePartResponse,
  CreationVehiclePartRequest,
  UpdationVehiclePartRequest,
  VehiclePartSearchRequest
} from "../types/vehicle-part.types";

export const useVehiclePart = () => {
  const [list, setList] = useState<VehiclePartResponse[]>([]);
  const [detail, setDetail] = useState<VehiclePartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const search = useCallback(async (params: VehiclePartSearchRequest) => {
    setLoading(true);
    try {
      const response = await vehiclePartService.search(params);
      if (response?.data?.success) {
        const data = response.data.data;
        setList(data.data);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        toast.error(response?.data?.message || "Không thể tải danh sách phụ tùng!");
      }
    } catch (error: any) {
      console.error('Vehicle part search error:', error);
      toast.error(error?.response?.data?.message || "Không thể tải danh sách phụ tùng!");
    } finally {
      setLoading(false);
    }
  }, []);

  const getAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vehiclePartService.getAll();
      setList(Array.isArray(data) ? data : []);
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải danh sách phụ tùng!");
      setList([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getByVehicleTypeId = useCallback(async (vehicleTypeId: string) => {
    setLoading(true);
    try {
      const data = await vehiclePartService.getByVehicleTypeId(vehicleTypeId);
      setList(Array.isArray(data) ? data : []);
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải danh sách phụ tùng!");
      setList([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const data = await vehiclePartService.getById(id);
      setDetail(data);
      return data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải thông tin phụ tùng!");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: CreationVehiclePartRequest) => {
    setLoading(true);
    try {
      const ok = await vehiclePartService.create(payload);
      if (ok) {
        toast.success("Tạo phụ tùng thành công");
        return true;
      }
      toast.error("Tạo phụ tùng thất bại");
      return false;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi tạo phụ tùng!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, payload: UpdationVehiclePartRequest) => {
    setLoading(true);
    try {
      const ok = await vehiclePartService.update(id, payload);
      if (ok) {
        toast.success("Cập nhật phụ tùng thành công");
        return true;
      }
      toast.error("Cập nhật phụ tùng thất bại");
      return false;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi cập nhật phụ tùng!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const ok = await vehiclePartService.remove(id);
      if (ok) {
        toast.success("Xóa phụ tùng thành công");
        return true;
      }
      toast.error("Xóa phụ tùng thất bại");
      return false;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi xóa phụ tùng!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const restore = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const ok = await vehiclePartService.restore(id);
      if (ok) {
        toast.success("Khôi phục phụ tùng thành công");
        return true;
      }
      toast.error("Khôi phục phụ tùng thất bại");
      return false;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi khôi phục phụ tùng!");
      return false;
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
    getAll,
    getByVehicleTypeId,
    getById,
    create,
    update,
    remove,
    restore,
  };
};
