import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { serviceTypeVehiclePartService } from "../service/serviceTypeVehiclePartService";
import type {
  ServiceTypeVehiclePartResponse,
  CreationServiceTypeVehiclePartRequest,
  UpdationServiceTypeVehiclePartRequest
} from "../types/service-type-vehicle-part.types";

export const useServiceTypeVehiclePart = () => {
  const [detail, setDetail] = useState<ServiceTypeVehiclePartResponse | null>(null);
  const [list, setList] = useState<ServiceTypeVehiclePartResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const getById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const data = await serviceTypeVehiclePartService.getById(id);
      setDetail(data);
      return data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải thông tin phụ tùng dịch vụ!");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getByServiceTypeId = useCallback(async (serviceTypeId: string) => {
    setLoading(true);
    try {
      const data = await serviceTypeVehiclePartService.getByServiceTypeId(serviceTypeId);
      setList(data);
      return data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải danh sách phụ tùng!");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: CreationServiceTypeVehiclePartRequest) => {
    setLoading(true);
    try {
      const ok = await serviceTypeVehiclePartService.create(payload);
      if (ok) {
        toast.success("Thêm phụ tùng cho dịch vụ thành công");
        return true;
      }
      toast.error("Thêm phụ tùng cho dịch vụ thất bại");
      return false;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi thêm phụ tùng cho dịch vụ!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, payload: UpdationServiceTypeVehiclePartRequest) => {
    setLoading(true);
    try {
      const ok = await serviceTypeVehiclePartService.update(id, payload);
      if (ok) {
        toast.success("Cập nhật phụ tùng dịch vụ thành công");
        return true;
      }
      toast.error("Cập nhật phụ tùng dịch vụ thất bại");
      return false;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi cập nhật phụ tùng dịch vụ!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const ok = await serviceTypeVehiclePartService.remove(id);
      if (ok) {
        toast.success("Xóa phụ tùng khỏi dịch vụ thành công");
        return true;
      }
      toast.error("Xóa phụ tùng khỏi dịch vụ thất bại");
      return false;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi xóa phụ tùng khỏi dịch vụ!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const restore = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const ok = await serviceTypeVehiclePartService.restore(id);
      if (ok) {
        toast.success("Khôi phục phụ tùng dịch vụ thành công");
        return true;
      }
      toast.error("Khôi phục phụ tùng dịch vụ thất bại");
      return false;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi khôi phục phụ tùng dịch vụ!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    detail,
    list,
    loading,
    getById,
    getByServiceTypeId,
    create,
    update,
    remove,
    restore,
  };
};
