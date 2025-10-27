import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { appointmentService } from "../service/appointmentService";
import type {
  AppointmentResponse,
  AppointmentSearchRequest
} from "../types/appointment.types";

export const useAppointment = () => {
  const [list, setList] = useState<AppointmentResponse[]>([]);
  const [detail, setDetail] = useState<AppointmentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const search = useCallback(async (params: AppointmentSearchRequest) => {
    setLoading(true);
    try {
      const response = await appointmentService.search(params);
      if (response?.data?.success) {
        const data = response.data.data;
        setList(data.data);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        // Don't show error toast, let UI handle empty state
        setList([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error: any) {
      console.error('Appointment search error:', error);
      // Don't show error toast, let UI handle empty state
      setList([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const data = await appointmentService.getById(id);
      setDetail(data);
      return data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải thông tin cuộc hẹn!");
      return null;
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
  };
};


