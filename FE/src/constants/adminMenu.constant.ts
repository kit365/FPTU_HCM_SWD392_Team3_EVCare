
import { pathAdmin } from "./paths.constant";
import { HomeSimple, Group, Car, UserBadgeCheck, Codepen, Menu, Erase } from "iconoir-react";
export interface AdminMenuItem {
    href?: string
    label: string
    icon?: React.ElementType
    children?: AdminMenuItem[]
}

export const adminMenuItems: AdminMenuItem[] = [
    {
        href: `/${pathAdmin}/dashboard`,
        label: "Tổng quan",
        icon: HomeSimple,
    },
    {
        href: `/${pathAdmin}/staff`,
        label: "Nhân viên",
        icon: Group,
    },
    {
        href: `/${pathAdmin}/vehicle`,
        label: "Mẫu xe",
        icon: Car,
    },
    {
        href: `/${pathAdmin}/vehicle-profile`,
        label: "Hồ sơ xe người dùng",
        icon: UserBadgeCheck,
    },
    {
        label: "Phụ tùng",
        icon: Codepen,
        children: [
            {
                href: `/${pathAdmin}/vehicle-part-category`,
                label: "Danh mục phụ tùng",
                icon: Menu
            },
            {
                href: `/${pathAdmin}/vehicle-part`,
                label: "Phụ tùng xe",
                icon: Erase
            },
        ],
    },
]