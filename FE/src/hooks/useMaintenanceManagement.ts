import { useState, useCallback } from 'react';
import { maintenanceManagementService } from '../service/maintenanceManagementService';

import { toast } from 'react-toastify';
import type { MaintenanceManagementResponse } from '../types/maintenance-management.types';

export const useMaintenanceManagement = () => {
  const [detail, setDetail] = useState<MaintenanceManagementResponse | null>(null);
  const [statusList, setStatusList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const getById = useCallback(async (id: string, params?: { page?: number; pageSize?: number; keyword?: string }) => {
    setLoading(true);
    try {
      const data = await maintenanceManagementService.getById(id, params);
      setDetail(data);
      return data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tải thông tin bảo dưỡng!');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateNotes = useCallback(async (id: string, notes: string) => {
    setLoading(true);
    try {
      await maintenanceManagementService.updateNotes(id, notes);
      toast.success('Cập nhật ghi chú thành công!');
      return true;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể cập nhật ghi chú!');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: string) => {
    setLoading(true);
    try {
      await maintenanceManagementService.updateStatus(id, status);
      toast.success('Cập nhật trạng thái thành công!');
      return true;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể cập nhật trạng thái!');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStatusList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await maintenanceManagementService.getStatusList();
      setStatusList(data);
      return data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tải danh sách trạng thái!');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    detail,
    statusList,
    loading,
    getById,
    updateNotes,
    updateStatus,
    getStatusList,
  };
};

