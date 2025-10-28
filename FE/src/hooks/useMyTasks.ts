import { useState, useCallback } from "react";
import { myTasksService } from "../service/myTasksService";

import { toast } from "react-toastify";
import type { MaintenanceManagementResponse } from "../types/maintenance-management.types";

export const useMyTasks = () => {
  const [tasks, setTasks] = useState<MaintenanceManagementResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (date?: string, status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await myTasksService.getMyTasks(date, status);
      setTasks(response.data || []);
      return response.data || [];
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Không thể tải danh sách công việc";
      setError(errorMsg);
      toast.error(errorMsg);
      setTasks([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { tasks, loading, error, fetchTasks };
};


