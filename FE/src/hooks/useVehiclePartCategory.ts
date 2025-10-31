import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { vehiclePartCategoryService } from "../service/vehiclePartCategoryService";
import type {
  VehiclePartCategoryResponse,
  CreationVehiclePartCategoryRequest,
  UpdationVehiclePartCategoryRequest
} from "../types/vehicle-part-category.types";

export const useVehiclePartCategory = () => {
  const [list, setList] = useState<VehiclePartCategoryResponse[]>([]);
  const [detail, setDetail] = useState<VehiclePartCategoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const search = useCallback(async (params: { page: number; pageSize: number; keyword?: string }) => {
    setLoading(true);
    try {
      const response = await vehiclePartCategoryService.search(params);
      if (response?.data?.success) {
        const data = response.data.data;
        setList(data.data);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        toast.error(response?.data?.message || "Không thể tải danh sách danh mục phụ tùng!");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải danh sách danh mục phụ tùng!");
    } finally {
      setLoading(false);
    }
  }, []);

  const getAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vehiclePartCategoryService.getAll();
      const list = Array.isArray(data) ? data : [];
      setList(list);
      return list;
    } catch (error: any) {
      // Không có dữ liệu thì trả về [] thay vì hiển thị lỗi
      setList([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const data = await vehiclePartCategoryService.getById(id);
      setDetail(data);
      return data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải danh mục phụ tùng!");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: CreationVehiclePartCategoryRequest) => {
    setLoading(true);
    try {
      const ok = await vehiclePartCategoryService.create(payload);
      if (ok) {
        toast.success("Tạo danh mục phụ tùng thành công");
        return true;
      }
      toast.error("Tạo danh mục phụ tùng thất bại");
      return false;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi tạo danh mục phụ tùng!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, payload: UpdationVehiclePartCategoryRequest) => {
    setLoading(true);
    try {
      const ok = await vehiclePartCategoryService.update(id, payload);
      if (ok) {
        toast.success("Cập nhật danh mục phụ tùng thành công");
        return true;
      }
      toast.error("Cập nhật danh mục phụ tùng thất bại");
      return false;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi cập nhật danh mục phụ tùng!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const ok = await vehiclePartCategoryService.remove(id);
      if (ok) {
        toast.success("Xóa danh mục phụ tùng thành công");
        return true;
      }
      toast.error("Xóa danh mục phụ tùng thất bại");
      return false;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi xóa danh mục phụ tùng!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const restore = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const ok = await vehiclePartCategoryService.restore(id);
      if (ok) {
        toast.success("Khôi phục danh mục phụ tùng thành công");
        return true;
      }
      toast.error("Khôi phục danh mục phụ tùng thất bại");
      return false;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi khôi phục danh mục phụ tùng!");
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
    getById,
    create,
    update,
    remove,
    restore,
  };
};
