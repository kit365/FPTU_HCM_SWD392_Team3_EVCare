export interface WarrantyPackage {
  warrantyPackageId: string;
  warrantyPackageName: string;
  description?: string;
  warrantyPeriodMonths: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  warrantyPackageParts?: WarrantyPackagePart[];
}

export interface WarrantyPackagePart {
  warrantyPackagePartId: string;
  warrantyPackage?: WarrantyPackage;
  vehicle?: {
    vehicleId: string;
    plateNumber: string;
    vin?: string;
  };
  vehiclePart: {
    vehiclePartId: string;
    vehiclePartName: string;
    unitPrice: number;
  };
  installedDate: string;
  warrantyExpiryDate: string;
  notes?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateWarrantyPackageRequest {
  warrantyPackageName: string;
  description?: string;
  warrantyPeriodMonths: number;
  startDate: string;
  endDate: string;
}

export interface UpdateWarrantyPackageRequest {
  warrantyPackageName: string;
  description?: string;
  warrantyPeriodMonths: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface CreateWarrantyPackagePartRequest {
  vehiclePartId: string;
  vehicleId?: string;
  installedDate: string;
  warrantyExpiryDate?: string;
  notes?: string;
}

export interface UpdateWarrantyPackagePartRequest {
  vehicleId?: string;
  installedDate?: string;
  warrantyExpiryDate?: string;
  notes?: string;
  isActive?: boolean;
}

export interface WarrantyPackageSearchRequest {
  page: number;
  pageSize: number;
  keyword?: string;
  isValid?: boolean;
}

export interface WarrantyPackagePartSearchRequest {
  warrantyPackageId: string;
  page: number;
  pageSize: number;
}

