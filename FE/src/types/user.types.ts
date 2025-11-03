// User Response - mapping từ BE UserResponse
export interface UserResponse {
  userId: string;
  roleName?: string[];
  username: string;
  email: string;
  address?: string;
  fullName?: string;
  numberPhone?: string;
  avatarUrl?: string;
  backgroundUrl?: string;
  provider?: string;
  technicianSkills?: string;
  isActive?: boolean;
  lastLogin?: string;
  isDeleted?: boolean;
  isAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// Creation User Request
export interface CreationUserRequest {
  username: string;
  email: string;
  password: string;
  numberPhone?: string;
  address?: string;
  fullName?: string;
  roleIds?: string[];
  isActive?: boolean;
}

// Updation User Request
export interface UpdationUserRequest {
  username?: string;
  email?: string;
  password?: string;
  numberPhone?: string;
  address?: string;
  fullName?: string;
  avatarUrl?: string;
  backgroundUrl?: string;
  technicianSkills?: string;
  isActive?: boolean;
  roleIds?: string[];
}

// User Search Params
export interface UserSearchParams {
  keyword?: string;
  page: number;
  pageSize: number;
}

