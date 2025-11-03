import type { UserResponse } from "./user.types";

// Certification Interface
export interface Certification {
  name: string;
  imageUrl: string;
}

// Skill Level Enum
export enum SkillLevelEnum {
  INTERNSHIP = "INTERNSHIP",
  FRESHER = "FRESHER",
  JUNIOR = "JUNIOR",
  MIDDLE = "MIDDLE",
  SENIOR = "SENIOR"
}

// Employee Profile Response
export interface EmployeeProfileResponse {
  employeeProfileId: string;
  userId: UserResponse;
  skillLevel?: SkillLevelEnum;
  certifications?: Certification[];
  performanceScore?: number;
  hireDate?: string;
  salaryBase?: number;
  emergencyContact?: string;
  position?: string;
  notes?: string;
  search?: string;
  isActive: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// Creation Employee Profile Request
export interface CreationEmployeeProfileRequest {
  userId: string;
  skillLevel: SkillLevelEnum;
  certifications?: Certification[];
  performanceScore?: number;
  hireDate?: string;
  salaryBase?: number;
  emergencyContact?: string;
  position?: string;
  notes?: string;
}

// Updation Employee Profile Request
export interface UpdationEmployeeProfileRequest {
  skillLevel?: SkillLevelEnum;
  certifications?: Certification[];
  performanceScore?: number;
  salaryBase?: number;
  emergencyContact?: string;
  position?: string;
  notes?: string;
}

// Search params
export interface EmployeeProfileSearchParams {
  keyword?: string;
  page: number;
  size: number;
}

