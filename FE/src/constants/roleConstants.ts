
export const GET_ALL_ROLES = "role/"


// Hằng số map với Enum Role backend
export const RoleEnum = {
    CUSTOMER: "CUSTOMER",
    ADMIN: "ADMIN", 
    STAFF: "STAFF",
    TECHNICIAN: "TECHNICIAN"
} as const;

export const ROLE_OPTIONS = [
    { value: RoleEnum.ADMIN, label: "Quản trị viên" },
    { value: RoleEnum.STAFF, label: "Nhân viên" },
    { value: RoleEnum.TECHNICIAN, label: "Kỹ thuật viên" },
    { value: RoleEnum.CUSTOMER, label: "Khách hàng" }
];

// (exclude ADMIN)
export const STAFF_ROLE_OPTIONS = [
    { value: RoleEnum.STAFF, label: "Nhân viên" },
    { value: RoleEnum.TECHNICIAN, label: "Kỹ thuật viên" },
    { value: RoleEnum.CUSTOMER, label: "Khách hàng" }
];

