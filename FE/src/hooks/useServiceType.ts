import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { serviceTypeService } from "../service/serviceTypeService";
import type {
  ServiceTypeResponse,
  CreationServiceTypeRequest,
  UpdationServiceTypeRequest
} from "../types/service-type.types";

export const useServiceType = () => {
  const [list, setList] = useState<ServiceTypeResponse[]>([]);
  const [detail, setDetail] = useState<ServiceTypeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // DEPRECATED: BE không có endpoint search chung (không có vehicleTypeId)
  // Note: Dùng getByVehicleTypeId thay thế (xem VehicleService.tsx)

  // Get service type detail by service type ID
  const getById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const data = await serviceTypeService.getById(id);
      setDetail(data);
      return data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải chi tiết dịch vụ!");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get services by vehicle type ID
  const getByVehicleTypeId = useCallback(async (vehicleTypeId: string, params?: { page?: number; pageSize?: number; keyword?: string; isActive?: boolean }) => {
    setLoading(true);
    try {
      const data = await serviceTypeService.getByVehicleTypeId(vehicleTypeId, params);
      setDetail(data);
      return data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải danh sách dịch vụ!");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getParentsByVehicleTypeId = useCallback(async (vehicleTypeId: string) => {
    setLoading(true);
    try {
      const data = await serviceTypeService.getParentsByVehicleTypeId(vehicleTypeId);
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải danh sách dịch vụ cha!");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getChildrenByParentAndVehicleType = useCallback(async (parentId: string, vehicleTypeId: string) => {
    setLoading(true);
    try {
      const data = await serviceTypeService.getChildrenByParentAndVehicleType(parentId, vehicleTypeId);
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải danh sách dịch vụ con!");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: CreationServiceTypeRequest) => {
    setLoading(true);
    try {
      const ok = await serviceTypeService.create(payload);
      if (ok) {
        toast.success("Tạo loại dịch vụ thành công");
        return true;
      }
      toast.error("Tạo loại dịch vụ thất bại");
      return false;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi tạo loại dịch vụ!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, payload: UpdationServiceTypeRequest) => {
    setLoading(true);
    try {
      const ok = await serviceTypeService.update(id, payload);
      if (ok) {
        toast.success("Cập nhật loại dịch vụ thành công");
        return true;
      }
      toast.error("Cập nhật loại dịch vụ thất bại");
      return false;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi cập nhật loại dịch vụ!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const ok = await serviceTypeService.remove(id);
      if (ok) {
        toast.success("Xóa loại dịch vụ thành công");
        return true;
      }
      toast.error("Xóa loại dịch vụ thất bại");
      return false;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi xóa loại dịch vụ!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const restore = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const ok = await serviceTypeService.restore(id);
      if (ok) {
        toast.success("Khôi phục loại dịch vụ thành công");
        return true;
      }
      toast.error("Khôi phục loại dịch vụ thất bại");
      return false;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi khôi phục loại dịch vụ!");
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
    // search, // DEPRECATED: endpoint không tồn tại trong BE
    getById,
    getByVehicleTypeId,
    getParentsByVehicleTypeId,
    getChildrenByParentAndVehicleType,
    create,
    update,
    remove,
    restore,
  };
};

