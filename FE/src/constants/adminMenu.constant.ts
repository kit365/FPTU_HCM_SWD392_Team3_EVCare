
import { pathAdmin } from "./paths.constant";
import { HomeSimple, Group, Car, UserBadgeCheck, Codepen, DownloadDataWindow, Menu, Erase, UserCircle, UserScan } from "iconoir-react";
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
        label: "Quản lý",
        icon: UserCircle,
        children: [
            {
                href: `/${pathAdmin}/users/customers`,
                label: "Quản lý khách hàng",
                icon: UserScan
            },
            {
                href: `/${pathAdmin}/users/staff`,
                label: "Quản lý nhân viên & kĩ thuật viên",
                icon: UserBadgeCheck
            },
        ],
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
    {
        href: `/${pathAdmin}/appointment-manage`,
        label: "Quản lý lịch hẹn",
        icon: DownloadDataWindow,
    },
    {
        label: "Ca làm và bảo hành",
        icon: Codepen,
        children: [
            {
                href: `/${pathAdmin}/shift`,
                label: "Ca làm",
                icon: Menu
            },
            {
                href: `/${pathAdmin}/warranty`,
                label: "Bảo hành",
                icon: Erase
            },
        ],
    },
    {
        href: `/${pathAdmin}/message`,
        label: "Tin nhắn",
        icon: Group,
    },
]