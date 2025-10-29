
import { pathAdmin } from "./paths.constant";
import { HomeSimple, Group, Car, UserBadgeCheck, Codepen, DownloadDataWindow, Menu, Erase, UserCircle, UserScan, Calendar, Tools } from "iconoir-react";
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
        ],
    },
    {
        href: `/${pathAdmin}/appointment-manage`,
        label: "Quản lý lịch hẹn",
        icon: DownloadDataWindow,
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
    // {
    //     href: `/${pathAdmin}/my-maintenance`,
    //     label: "Công việc bảo dưỡng",
    //     icon: Tools,
    // },
    // {
    //     href: `/${pathAdmin}/warranty`,
    //     label: "Bảo hành",
    //     icon: Codepen,
    // },
    {
        href: `/${pathAdmin}/message`,
        label: "Tin nhắn",
        icon: Group,
    },
]