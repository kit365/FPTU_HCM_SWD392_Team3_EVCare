// Shift Types based on backend DTOs

import type { AppointmentResponse } from './appointment.types';
import type { UserResponse } from './user.types';

// Enums
export const ShiftTypeEnum = {
  APPOINTMENT: 'APPOINTMENT',
  REGULAR: 'REGULAR',
  OVERTIME: 'OVERTIME',
  EMERGENCY: 'EMERGENCY'
} as const;

export type ShiftTypeEnum = typeof ShiftTypeEnum[keyof typeof ShiftTypeEnum];

export const ShiftStatusEnum = {
  PENDING_ASSIGNMENT: 'PENDING_ASSIGNMENT', // Chưa phân công
  LATE_ASSIGNMENT: 'LATE_ASSIGNMENT', // Quá giờ chưa phân công
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

export type ShiftStatusEnum = typeof ShiftStatusEnum[keyof typeof ShiftStatusEnum];

// Shift Response
export interface ShiftResponse {
  shiftId: string;
  staff?: UserResponse; 
  technicians?: UserResponse[]; 
  assignee: UserResponse; 
  appointment?: AppointmentResponse;
  shiftType: ShiftTypeEnum;
  startTime: string; 
  endTime?: string; 
  status: ShiftStatusEnum;
  totalHours?: number; 
  notes?: string;
  search?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// Creation Shift Request
export interface CreationShiftRequest {
  staffId?: string; 
  technicianIds?: string[]; 
  assigneeId: string; 
  appointmentId?: string; 
  shiftType?: ShiftTypeEnum;
  startTime: string; 
  endTime?: string; 
  status?: ShiftStatusEnum;
  totalHours?: number;
  notes?: string;
}

// Updation Shift Request
export interface UpdationShiftRequest {
  staffId?: string;
  technicianIds?: string[];
  assigneeId?: string;
  appointmentId?: string;
  shiftType?: ShiftTypeEnum;
  startTime?: string;
  endTime?: string;
  status?: ShiftStatusEnum;
  totalHours?: number;
  notes?: string;
}

export interface AssignShiftRequest {
  assigneeId: string; 
  staffId?: string; 
  technicianIds?: string[]; 
  endTime: string; 
}

// Search Request
export interface ShiftSearchRequest {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: string;
  shiftType?: string;
  fromDate?: string;
  toDate?: string;
}

