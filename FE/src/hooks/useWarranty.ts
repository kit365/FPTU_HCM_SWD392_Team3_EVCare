import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { warrantyService } from "../service/warrantyService";
import type {
  WarrantyPackage,
  WarrantyPackagePart,
  CreateWarrantyPackageRequest,
  UpdateWarrantyPackageRequest,
  CreateWarrantyPackagePartRequest,
  UpdateWarrantyPackagePartRequest,
  WarrantyPackageSearchRequest,
  WarrantyPackagePartSearchRequest
} from "../types/warranty.types";

export const useWarranty = () => {
  const [warrantyPackageList, setWarrantyPackageList] = useState<WarrantyPackage[]>([]);
  const [warrantyPackageDetail, setWarrantyPackageDetail] = useState<WarrantyPackage | null>(null);
  const [warrantyPackagePartList, setWarrantyPackagePartList] = useState<WarrantyPackagePart[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  /** 🔹 Lấy danh sách gói bảo hành */
  const fetchWarrantyPackageList = useCallback(async (params: WarrantyPackageSearchRequest) => {
    setLoading(true);
    try {
      const response = await warrantyService.searchWarrantyPackages(params);
      if (response?.data?.success) {
        const data = response.data.data;
        setWarrantyPackageList(data.data);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        toast.error(response?.data?.message || "Không thể tải danh sách gói bảo hành!");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi tải danh sách gói bảo hành!");
    } finally {
      setLoading(false);
    }
  }, []);

  /** 🔹 Lấy chi tiết gói bảo hành */
  const getWarrantyPackage = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const data = await warrantyService.getWarrantyPackageById(id);
      setWarrantyPackageDetail(data);
      return data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không tìm thấy gói bảo hành!");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /** 🔹 Tạo gói bảo hành */
  const createWarrantyPackage = useCallback(async (data: CreateWarrantyPackageRequest) => {
    setLoading(true);
    try {
      const response = await warrantyService.createWarrantyPackage(data);
      if (response?.data.success) {
        toast.success(response?.data.message || "Tạo gói bảo hành thành công!");
        return true;
      } else {
        toast.error(response?.data.message || "Tạo gói bảo hành thất bại!");
        return false;
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi tạo gói bảo hành!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /** 🔹 Cập nhật gói bảo hành */
  const updateWarrantyPackage = useCallback(async (id: string, data: UpdateWarrantyPackageRequest) => {
    setLoading(true);
    try {
      const response = await warrantyService.updateWarrantyPackage(id, data);
      if (response?.data.success) {
        toast.success(response?.data.message || "Cập nhật gói bảo hành thành công!");
        return true;
      } else {
        toast.error(response?.data.message || "Cập nhật gói bảo hành thất bại!");
        return false;
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi cập nhật gói bảo hành!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /** 🔹 Xóa gói bảo hành */
  const deleteWarrantyPackage = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await warrantyService.deleteWarrantyPackage(id);
      if (response?.data.success) {
        toast.success(response?.data.message || "Xóa gói bảo hành thành công!");
        return true;
      } else {
        toast.error(response?.data.message || "Xóa gói bảo hành thất bại!");
        return false;
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi xóa gói bảo hành!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /** 🔹 Lấy danh sách phụ tùng bảo hành */
  const fetchWarrantyPackageParts = useCallback(async (params: WarrantyPackagePartSearchRequest) => {
    setLoading(true);
    try {
      const response = await warrantyService.getWarrantyPackageParts(params);
      if (response?.data?.success) {
        const data = response.data.data;
        setWarrantyPackagePartList(data.data);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        toast.error(response?.data?.message || "Không thể tải danh sách phụ tùng bảo hành!");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi tải danh sách phụ tùng bảo hành!");
    } finally {
      setLoading(false);
    }
  }, []);

  /** 🔹 Tạo phụ tùng bảo hành */
  const createWarrantyPackagePart = useCallback(async (
    warrantyPackageId: string,
    data: CreateWarrantyPackagePartRequest
  ) => {
    setLoading(true);
    try {
      const response = await warrantyService.createWarrantyPackagePart(warrantyPackageId, data);
      if (response?.data.success) {
        toast.success(response?.data.message || "Thêm phụ tùng bảo hành thành công!");
        return true;
      } else {
        toast.error(response?.data.message || "Thêm phụ tùng bảo hành thất bại!");
        return false;
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi thêm phụ tùng bảo hành!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /** 🔹 Cập nhật phụ tùng bảo hành */
  const updateWarrantyPackagePart = useCallback(async (
    id: string,
    data: UpdateWarrantyPackagePartRequest
  ) => {
    setLoading(true);
    try {
      const response = await warrantyService.updateWarrantyPackagePart(id, data);
      if (response?.data.success) {
        toast.success(response?.data.message || "Cập nhật phụ tùng bảo hành thành công!");
        return true;
      } else {
        toast.error(response?.data.message || "Cập nhật phụ tùng bảo hành thất bại!");
        return false;
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi cập nhật phụ tùng bảo hành!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /** 🔹 Xóa phụ tùng bảo hành */
  const deleteWarrantyPackagePart = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await warrantyService.deleteWarrantyPackagePart(id);
      if (response?.data.success) {
        toast.success(response?.data.message || "Xóa phụ tùng bảo hành thành công!");
        return true;
      } else {
        toast.error(response?.data.message || "Xóa phụ tùng bảo hành thất bại!");
        return false;
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi xóa phụ tùng bảo hành!");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    warrantyPackageList,
    warrantyPackageDetail,
    warrantyPackagePartList,
    loading,
    totalPages,
    totalElements,
    fetchWarrantyPackageList,
    getWarrantyPackage,
    createWarrantyPackage,
    updateWarrantyPackage,
    deleteWarrantyPackage,
    fetchWarrantyPackageParts,
    createWarrantyPackagePart,
    updateWarrantyPackagePart,
    deleteWarrantyPackagePart,
  };
};

