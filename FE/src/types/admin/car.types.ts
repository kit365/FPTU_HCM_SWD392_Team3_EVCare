export interface VehicleProps {
  id: string;
  vehicleTypeName: string;
  manufacturer: string;
  modelYear: number;
  batteryCapacity: number;
  maintenanceIntervalKm: number;
  maintenanceIntervalMonths: number;
  description: string;
}

export interface VehicleListData {
  data: VehicleProps[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}