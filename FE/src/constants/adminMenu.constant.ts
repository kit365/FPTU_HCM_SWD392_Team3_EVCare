
import { pathAdmin } from "./paths.constant";
import { HomeSimple, Group, Car, UserBadgeCheck, Codepen, DownloadDataWindow, Menu, Erase, UserCircle, UserScan, Calendar, Tools, Shield } from "iconoir-react";
export interface AdminMenuItem {
    href?: string
    label: string
    icon?: React.ElementType
    children?: AdminMenuItem[]
    roleBasedHref?: {
        TECHNICIAN?: string
        ADMIN?: string
        STAFF?: string
    }
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
            {
                href: `/${pathAdmin}/warranty-part`,
                label: "Bảo hành phụ tùng",
                icon: Shield
            },
        ],
    },
    {
        href: `/${pathAdmin}/appointment-manage`,
        label: "Quản lý lịch hẹn",
        icon: DownloadDataWindow,
    },
    {
        href: `/${pathAdmin}/warranty-appointments`,
        label: "Lịch hẹn bảo hành",
        icon: Shield,
    },
    {
        label: "Ca làm",
        icon: Calendar,
        roleBasedHref: {
            TECHNICIAN: `/${pathAdmin}/schedule`,
            ADMIN: `/${pathAdmin}/shift`,
            STAFF: `/${pathAdmin}/shift`,
        }
    },
    {
        label: "Tin nhắn",
        icon: Group,
        children: [
            {
                href: `/${pathAdmin}/message`,
                label: "Chat với khách hàng",
                icon: Group
            },
            {
                href: `/${pathAdmin}/message-assignments`,
                label: "Phân công chat",
                icon: UserCircle
            }
        ]
    },
]