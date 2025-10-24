import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { vehiclePartService } from "../service/serviceTypeVehiclePartService";
import type {
  VehiclePartResponse,
} from "../types/service-type-vehicle-part.types";

export const useVehiclePart = () => {
  const [list, setList] = useState<VehiclePartResponse[]>([]);
  const [detail, setDetail] = useState<VehiclePartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const search = useCallback(async (params: { page: number; pageSize: number; keyword?: string }) => {
    setLoading(true);
    try {
      const data = await vehiclePartService.search(params);
      setList(data.data);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải danh sách phụ tùng!");
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
      toast.error(error?.response?.data?.message || "Không thể tải phụ tùng!");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: any) => {
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

  const update = useCallback(async (id: string, payload: any) => {
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
    getById,
    create,
    update,
    remove,
    restore,
  };
};


