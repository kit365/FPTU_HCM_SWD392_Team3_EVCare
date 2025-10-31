import { useState, useEffect, useCallback } from 'react'
import CarTable from './CarTable'
import CarCreate from './CarCreate'
import React from 'react';
import { useAuthContext } from '../../../context/useAuthContext';
import { useVehicleProfile } from '../../../hooks/useVehicleProfile';
import type { VehicleProfileResponse } from '../../../types/vehicle-profile.types';

const CarManagement: React.FC = () => {
  const { user } = useAuthContext();
  const { search: searchVehicles, list, totalPages, totalElements, loading } = useVehicleProfile();
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  
  // Filter vehicles của user hiện tại
  const userVehicles = list.filter(vehicle => vehicle.user.userId === user?.userId);

  // Fetch vehicle profiles from API
  const fetchVehicleProfiles = useCallback(async () => {
    if (!user?.userId) return;
    
    // Search tất cả vehicles rồi filter theo userId ở client
    // (Backend API chưa hỗ trợ filter theo userId cho customer)
    await searchVehicles({
      keyword: keyword || undefined,
      page: current - 1,
      size: pageSize,
    });
  }, [user?.userId, current, pageSize, keyword, searchVehicles]);

  // Fetch vehicle profiles on mount and when dependencies change
  useEffect(() => {
    fetchVehicleProfiles();
  }, [fetchVehicleProfiles]);

  const handleSearch = (value: string) => {
    setKeyword(value);
    setCurrent(1); // Reset về trang 1 khi search
  };

  const handleSuccess = () => {
    // Reload danh sách sau khi tạo/cập nhật thành công
    fetchVehicleProfiles();
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#ffffff"  }}>
      
      {/*BẢNG HỒ SƠ XE */}
      <CarCreate onSearch={handleSearch} onSuccess={handleSuccess} />

      <CarTable
        vehicleProfiles={userVehicles}
        loading={loading}
        total={userVehicles.length}
        current={current}
        setCurrent={setCurrent}
        pageSize={pageSize}
        setPageSize={setPageSize}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

export default CarManagement