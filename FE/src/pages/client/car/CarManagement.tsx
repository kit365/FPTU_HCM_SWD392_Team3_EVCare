import { useState } from 'react'
import CarTable from './CarTable'
import CarCreate from './CarCreate'
import React from 'react';

const CarManagement: React.FC = () => {
  //fake data xe
  const allVehicles = [
    { id: 1, carName: "VinFast VF3", licensePlate: "30A-12345", carType: "VF3" },
    { id: 2, carName: "VinFast VF5", licensePlate: "29B1-67890", carType: "VF5" },
    { id: 3, carName: "VinFast VF6", licensePlate: "31C-11223", carType: "VF6" },
    { id: 4, carName: "VinFast VF7", licensePlate: "88D-44556", carType: "VF7" },
    { id: 5, carName: "VinFast VF8", licensePlate: "99E-77889", carType: "VF8" },
    { id: 6, carName: "VinFast VF9", licensePlate: "36F-22334", carType: "VF9" },
    { id: 7, carName: "Mazda CX-3", licensePlate: "43G-55667", carType: "CX-3" },
    { id: 8, carName: "Mazda CX-5", licensePlate: "47H-88990", carType: "CX-5" },
    { id: 9, carName: "Mazda CX-8", licensePlate: "65K-11229", carType: "CX-8" },
    { id: 10, carName: "Toyota Vios", licensePlate: "72L-33445", carType: "Vios" },
    { id: 11, carName: "Toyota Corolla Altis", licensePlate: "79M-66778", carType: "Corolla Altis" },
    { id: 12, carName: "Toyota Fortuner", licensePlate: "81N-99001", carType: "Fortuner" },
    { id: 13, carName: "Honda Civic", licensePlate: "83P-22335", carType: "Civic" },
    { id: 14, carName: "Honda City", licensePlate: "86Q-55668", carType: "City" },
    { id: 15, carName: "Honda CR-V", licensePlate: "90R-88992", carType: "CR-V" },
    { id: 16, carName: "Hyundai SantaFe", licensePlate: "92S-11226", carType: "SantaFe" },
    { id: 17, carName: "Hyundai Tucson", licensePlate: "98T-33449", carType: "Tucson" }
  ];

  const [vehicles, setVehicles] = useState(allVehicles);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleSearch = (value: string) => {
    if (!value) {
      setVehicles(allVehicles);
      return;
    }

    const filtered = allVehicles.filter(vehicle =>
      vehicle.carName.toLowerCase().includes(value.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(value.toLowerCase()) ||
      vehicle.carType.toLowerCase().includes(value.toLowerCase())
    );
    setVehicles(filtered);
    setCurrent(1); // Reset về trang 1 khi search
  };

  return (
    <div style={{ padding: "20px" }}>
      
      {/*BẢNG HỒ SƠ XE */}
      <CarCreate onSearch={handleSearch} />

      <CarTable
        vehicles={vehicles}
        total={vehicles.length}
        current={current}
        setCurrent={setCurrent}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />
    </div>
  )
}

export default CarManagement