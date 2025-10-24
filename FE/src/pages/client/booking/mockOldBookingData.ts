// Mock data cho lịch sử booking cũ
export interface OldBookingData {
  id: string;
  vehicleName: string;
  licensePlate: string;
  bookingHistory: {
    customerName: string;
    phone: string;
    email: string;
    vehicleTypeId: string;
    mileage: string;
    licensePlate: string;
    services: string[];
    serviceType: string;
    userAddress: string;
    dateTime: string;
    notes: string;
  };
}

// Mock data lịch sử booking
export const mockOldBookingData: OldBookingData[] = [
  {
    id: "1",
    vehicleName: "VinFast VF 8",
    licensePlate: "30A-12345",
    bookingHistory: {
      customerName: "Nguyễn Văn A",
      phone: "0901234567",
      email: "nguyenvana@gmail.com",
      vehicleTypeId: "VF8-2023",
      mileage: "15000",
      licensePlate: "30A-12345",
      services: ["MAINTENANCE", "BRAKE_CHECK"],
      serviceType: "STATIONARY",
      userAddress: "Vũng Tàu",
      dateTime: "2024-01-15 10:00:00",
      notes: "Bảo dưỡng định kỳ, kiểm tra phanh"
    }
  },
  {
    id: "2",
    vehicleName: "VinFast VF 9",
    licensePlate: "51B-67890",
    bookingHistory: {
      customerName: "Trần Thị B",
      phone: "0987654321",
      email: "tranthib@gmail.com",
      vehicleTypeId: "VF9-2024",
      mileage: "25000",
      licensePlate: "51B-67890",
      services: ["BATTERY_CHECK", "TIRE_ROTATION"],
      serviceType: "MOBILE",
      userAddress: "123 Đường ABC, Quận 1, TP.HCM",
      dateTime: "2024-01-20 14:30:00",
      notes: "Kiểm tra pin và đảo lốp tại nhà"
    }
  },
  {
    id: "3",
    vehicleName: "VinFast VF 7",
    licensePlate: "65C-54321",
    bookingHistory: {
      customerName: "Lê Văn C",
      phone: "0971122334",
      email: "levanc@gmail.com",
      vehicleTypeId: "VF7-2023",
      mileage: "8000",
      licensePlate: "65C-54321",
      services: ["OIL_CHANGE", "FILTER_REPLACEMENT"],
      serviceType: "STATIONARY",
      userAddress: "Vũng Tàu",
      dateTime: "2024-01-25 09:15:00",
      notes: "Thay dầu và lọc định kỳ"
    }
  },
  {
    id: "4",
    vehicleName: "VinFast VF 6",
    licensePlate: "79D-98765",
    bookingHistory: {
      customerName: "Phạm Thị D",
      phone: "0966555777",
      email: "phamthid@gmail.com",
      vehicleTypeId: "VF6-2024",
      mileage: "12000",
      licensePlate: "79D-98765",
      services: ["MAINTENANCE", "AC_CHECK"],
      serviceType: "MOBILE",
      userAddress: "456 Đường XYZ, Quận 7, TP.HCM",
      dateTime: "2024-02-01 16:45:00",
      notes: "Bảo dưỡng tổng quát và kiểm tra điều hòa"
    }
  },
  {
    id: "5",
    vehicleName: "VinFast VF 5",
    licensePlate: "29E-11111",
    bookingHistory: {
      customerName: "Hoàng Văn E",
      phone: "0955888999",
      email: "hoangvane@gmail.com",
      vehicleTypeId: "VF5-2023",
      mileage: "5000",
      licensePlate: "29E-11111",
      services: ["FIRST_SERVICE"],
      serviceType: "STATIONARY",
      userAddress: "Vũng Tàu",
      dateTime: "2024-02-05 11:00:00",
      notes: "Bảo dưỡng lần đầu"
    }
  }
];
