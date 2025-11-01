import { useState, useCallback } from 'react';
import { shiftService } from '../service/shiftService';
import { toast } from 'react-toastify';
import type {
  ShiftResponse,
  CreationShiftRequest,
  UpdationShiftRequest,
  ShiftSearchRequest
} from '../types/shift.types';

export const useShift = () => {
  const [list, setList] = useState<ShiftResponse[]>([]);
  const [detail, setDetail] = useState<ShiftResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [shiftTypes, setShiftTypes] = useState<string[]>([]);
  const [shiftStatuses, setShiftStatuses] = useState<string[]>([]);

  // Get all shift types
  const getAllTypes = useCallback(async () => {
    try {
      const response = await shiftService.getAllTypes();
      const data = response.data.data || [];
      setShiftTypes(data);
      return data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tải danh sách loại ca làm việc!');
      return [];
    }
  }, []);

  // Get all shift statuses
  const getAllStatuses = useCallback(async () => {
    try {
      const response = await shiftService.getAllStatuses();
      const data = response.data.data || [];
      setShiftStatuses(data);
      return data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tải danh sách trạng thái ca làm việc!');
      return [];
    }
  }, []);

  // Search shifts
  const search = useCallback(async (params: ShiftSearchRequest) => {
    setLoading(true);
    try {
      const response = await shiftService.search(params);
      const pageData = response.data.data;
      
      // BE trả về "data" chứa array, fallback to "content" for backward compatibility
      const dataArray = pageData.data || pageData.content || [];
      setList(Array.isArray(dataArray) ? dataArray : []);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
      
      return response;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tải danh sách ca làm việc!');
      setList([]);
      setTotalPages(0);
      setTotalElements(0);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search shifts by technician - CA LÀM CỦA TÔI
  const searchByTechnician = useCallback(async (technicianId: string, params: ShiftSearchRequest) => {
    setLoading(true);
    try {
      const response = await shiftService.searchByTechnician(technicianId, params);
      const pageData = response.data.data;
      
      // BE trả về "data" chứa array, fallback to "content" for backward compatibility
      const dataArray = pageData.data || pageData.content || [];
      setList(Array.isArray(dataArray) ? dataArray : []);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
      
      return response;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tải ca làm việc của bạn!');
      setList([]);
      setTotalPages(0);
      setTotalElements(0);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get shift by id
  const getById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await shiftService.getById(id);
      const data = response.data.data;
      setDetail(data);
      return data; // Trả về data để tương thích với ShiftEdit và ShiftDetail
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tải thông tin ca làm việc!');
      throw error; // Throw error để các component catch được
    } finally {
      setLoading(false);
    }
  }, []);

  // Get shifts by appointment id
  // TODO: Implement this when backend endpoint is ready
  // const getByAppointmentId = useCallback(async (appointmentId: string, page: number = 0, pageSize: number = 10) => {
  //   setLoading(true);
  //   try {
  //     const response = await shiftService.getByAppointmentId(appointmentId, page, pageSize);
  //     const pageData = response.data.data;
  //     
  //     setList(Array.isArray(pageData.data) ? pageData.data : []);
  //     setTotalPages(pageData.totalPages || 0);
  //     setTotalElements(pageData.totalElements || 0);
  //     
  //     return response;
  //   } catch (error: any) {
  //     toast.error(error?.response?.data?.message || 'Không thể tải danh sách ca làm việc!');
  //     setList([]);
  //     return null;
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  // Create shift
  const create = useCallback(async (data: CreationShiftRequest) => {
    setLoading(true);
    try {
      await shiftService.create(data);
      toast.success('Tạo ca làm việc thành công!');
      return true;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tạo ca làm việc!');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update shift
  const update = useCallback(async (id: string, data: UpdationShiftRequest) => {
    setLoading(true);
    try {
      await shiftService.update(id, data);
      toast.success('Cập nhật ca làm việc thành công!');
      return true;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể cập nhật ca làm việc!');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete shift
  const remove = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await shiftService.delete(id); 
      toast.success('Xóa ca làm việc thành công!');
      return true;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể xóa ca làm việc!');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Restore shift
  const restore = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await shiftService.restore(id);
      toast.success('Khôi phục ca làm việc thành công!');
      return true;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể khôi phục ca làm việc!');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update shift status (e.g., SCHEDULED → IN_PROGRESS)
  const updateStatus = useCallback(async (id: string, status: string) => {
    setLoading(true);
    try {
      await shiftService.updateStatus(id, status);
      toast.success('Cập nhật trạng thái ca làm việc thành công!');
      return true;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể cập nhật trạng thái ca làm việc!');
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
    shiftTypes,
    shiftStatuses,
    getAllTypes,
    getAllStatuses,
    search,
    searchByTechnician,
    getById,
    // getByAppointmentId, // TODO: Uncomment when implemented
    create,
    update,
    remove,
    restore,
    updateStatus
  };
};



