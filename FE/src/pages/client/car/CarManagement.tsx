import { useState, useEffect, useCallback } from 'react'
import CarTable from './CarTable'
import CarCreate from './CarCreate'
import React from 'react';
import { bookingService } from '../../../service/bookingService';
import { useAuthContext } from '../../../context/useAuthContext';
import type { UserAppointment } from '../../../types/booking.types';
import { message } from 'antd';

const CarManagement: React.FC = () => {
  const { user } = useAuthContext();
  const [appointments, setAppointments] = useState<UserAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');

  // Fetch appointments from API
  const fetchAppointments = useCallback(async () => {
    if (!user?.userId) return;
    
    setLoading(true);
    try {
      const response = await bookingService.getUserAppointments(user.userId, {
        page: current - 1,
        pageSize: pageSize,
        keyword: keyword || undefined
      });
      
      if (response.data.success) {
        setAppointments(response.data.data.data);
        setTotal(response.data.data.totalElements);
      }
    } catch (error) {
      message.error("Không thể tải danh sách cuộc hẹn");
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.userId, current, pageSize, keyword]);

  // Fetch appointments on mount and when dependencies change
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleSearch = (value: string) => {
    setKeyword(value);
    setCurrent(1); // Reset về trang 1 khi search
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#ffffff"  }}>
      
      {/*BẢNG HỒ SƠ XE */}
      <CarCreate onSearch={handleSearch} />

      <CarTable
        appointments={appointments}
        loading={loading}
        total={total}
        current={current}
        setCurrent={setCurrent}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />
    </div>
  )
}

export default CarManagement