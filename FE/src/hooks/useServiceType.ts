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

  const search = useCallback(async (params: { page: number; pageSize: number; keyword?: string }) => {
    setLoading(true);
    try {
      const data = await serviceTypeService.search(params);
      setList(data.data);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải danh sách loại dịch vụ!");
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const data = await serviceTypeService.getById(id);
      setDetail(data);
      return data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải loại dịch vụ!");
      return null;
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
    search,
    getById,
    create,
    update,
    remove,
    restore,
  };
};
