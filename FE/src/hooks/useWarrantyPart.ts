import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { warrantyPartService } from "../service/warrantyPartService";
import type {
  WarrantyPartResponse,
  CreationWarrantyPartRequest,
  UpdationWarrantyPartRequest,
  WarrantyPartSearchRequest
} from "../types/warranty-part.types";

export const useWarrantyPart = () => {
  const [list, setList] = useState<WarrantyPartResponse[]>([]);
  const [detail, setDetail] = useState<WarrantyPartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const search = useCallback(async (params: WarrantyPartSearchRequest) => {
    setLoading(true);
    try {
      const response = await warrantyPartService.search(params);
      if (response?.data?.success) {
        const data = response.data.data;
        setList(data.data);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        toast.error(response?.data?.message || "Không thể tải danh sách bảo hành phụ tùng!");
      }
    } catch (error: any) {
      console.error('Warranty part search error:', error);
      toast.error(error?.response?.data?.message || "Không thể tải danh sách bảo hành phụ tùng!");
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const data = await warrantyPartService.getById(id);
      setDetail(data);
      return data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải thông tin bảo hành phụ tùng!");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getByVehiclePartId = useCallback(async (vehiclePartId: string, page: number = 0, pageSize: number = 10) => {
    setLoading(true);
    try {
      const data = await warrantyPartService.getByVehiclePartId(vehiclePartId, page, pageSize);
      setList(data.data);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      return data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải danh sách bảo hành phụ tùng!");
      setList([]);
      return { data: [], totalPages: 0, totalElements: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: CreationWarrantyPartRequest) => {
    setLoading(true);
    try {
      const ok = await warrantyPartService.create(payload);
      if (ok) {
        toast.success("Tạo bảo hành phụ tùng thành công");
        return true;
      }
      toast.error("Tạo bảo hành phụ tùng thất bại");
      return false;
    } catch (error: any) {
      toast.error(error?.message || error?.response?.data?.message || "Lỗi khi tạo bảo hành phụ tùng!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, payload: UpdationWarrantyPartRequest) => {
    setLoading(true);
    try {
      const ok = await warrantyPartService.update(id, payload);
      if (ok) {
        toast.success("Cập nhật bảo hành phụ tùng thành công");
        return true;
      }
      toast.error("Cập nhật bảo hành phụ tùng thất bại");
      return false;
    } catch (error: any) {
      toast.error(error?.message || error?.response?.data?.message || "Lỗi khi cập nhật bảo hành phụ tùng!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const ok = await warrantyPartService.remove(id);
      if (ok) {
        toast.success("Xóa bảo hành phụ tùng thành công");
        return true;
      }
      toast.error("Xóa bảo hành phụ tùng thất bại");
      return false;
    } catch (error: any) {
      toast.error(error?.message || error?.response?.data?.message || "Lỗi khi xóa bảo hành phụ tùng!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const restore = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const ok = await warrantyPartService.restore(id);
      if (ok) {
        toast.success("Khôi phục bảo hành phụ tùng thành công");
        return true;
      }
      toast.error("Khôi phục bảo hành phụ tùng thất bại");
      return false;
    } catch (error: any) {
      toast.error(error?.message || error?.response?.data?.message || "Lỗi khi khôi phục bảo hành phụ tùng!");
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
    getByVehiclePartId,
    create,
    update,
    remove,
    restore,
  };
};
