import type { FormField } from "../../types/admin/form-field.types";

export interface SelectOption {
    value: string;
    label: string;
}

export const STAFF_STATUS_OPTIONS: SelectOption[] = [
    { value: "active", label: "Hoạt động" },
    { value: "inactive", label: "Tạm dừng" },
];

export const STAFF_FORM_FIELDS: FormField[] = [
    {
        name: "fullname" as const,
        label: "Họ và tên",
        placeholder: "Nhập họ và tên...",
        type: "text",
        component: "input",
    },
    {
        name: "status" as const,
        label: "Trạng thái",
        placeholder: "-- Chọn trạng thái --",
        type: "select",
        component: "select",
        options: STAFF_STATUS_OPTIONS,
    },
    {
        name: "username" as const,
        label: "Tên đăng nhập",
        placeholder: "Nhập tên đăng nhập...",
        type: "text",
        component: "input",
    },
    {
        name: "email" as const,
        label: "Email",
        placeholder: "Nhập email...",
        type: "email",
        component: "input",
    },
    {
        name: "password" as const,
        label: "Mật khẩu",
        placeholder: "Nhập mật khẩu...",
        type: "password",
        component: "input",
    },
];
