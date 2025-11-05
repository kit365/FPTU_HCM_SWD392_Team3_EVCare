// Warranty Part Types based on backend DTOs

import type { VehiclePartResponse } from './vehicle-part.types';

// Enums
export const WarrantyDiscountTypeEnum = {
  PERCENTAGE: 'PERCENTAGE',
  FREE: 'FREE'
} as const;

export type WarrantyDiscountTypeEnum = typeof WarrantyDiscountTypeEnum[keyof typeof WarrantyDiscountTypeEnum];

export const ValidityPeriodUnitEnum = {
  DAY: 'DAY',
  MONTH: 'MONTH',
  YEAR: 'YEAR'
} as const;

export type ValidityPeriodUnitEnum = typeof ValidityPeriodUnitEnum[keyof typeof ValidityPeriodUnitEnum];

// Request Types
export interface CreationWarrantyPartRequest {
  vehiclePartId: string;
  discountType: WarrantyDiscountTypeEnum;
  discountValue?: number | null; // Phần trăm giảm giá (0-100) nếu discountType = PERCENTAGE, null nếu discountType = FREE
  validityPeriod: number; // Số (2, 3, ...)
  validityPeriodUnit: ValidityPeriodUnitEnum; // DAY, MONTH, YEAR
}

export interface UpdationWarrantyPartRequest {
  vehiclePartId: string;
  discountType: WarrantyDiscountTypeEnum;
  discountValue?: number | null; // Phần trăm giảm giá (0-100) nếu discountType = PERCENTAGE, null nếu discountType = FREE
  validityPeriod: number; // Số (2, 3, ...)
  validityPeriodUnit: ValidityPeriodUnitEnum; // DAY, MONTH, YEAR
  isActive?: boolean;
}

// Response Types
export interface WarrantyPartResponse {
  warrantyPartId: string;
  vehiclePart: VehiclePartResponse;
  discountType: WarrantyDiscountTypeEnum;
  discountValue?: number | null;
  validityPeriod: number;
  validityPeriodUnit: ValidityPeriodUnitEnum;
  isDeleted?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// API Response Types
export interface WarrantyPartApiResponse {
  success: boolean;
  message: string;
  data: WarrantyPartResponse;
  timestamp: string;
  errorCode?: string;
}

export interface WarrantyPartListApiResponse {
  success: boolean;
  message: string;
  data: {
    data: WarrantyPartResponse[];
    totalPages: number;
    totalElements: number;
    page?: number;
    size?: number;
    last?: boolean;
  };
  timestamp: string;
  errorCode?: string;
}

// Search Request
export interface WarrantyPartSearchRequest {
  page: number;
  pageSize: number;
  keyword?: string;
  vehiclePartId?: string;
}
