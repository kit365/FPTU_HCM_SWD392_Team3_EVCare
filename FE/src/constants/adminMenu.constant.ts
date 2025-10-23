
import { pathAdmin } from "./paths.constant";
import { HomeSimple, JournalPage, Group } from "iconoir-react";
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BadgeIcon from '@mui/icons-material/Badge';
import CategoryIcon from '@mui/icons-material/Category';
import BuildIcon from '@mui/icons-material/Build';

export interface AdminMenuItem {
    href?: string
    label: string
    icon: React.ElementType
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
        href: `/${pathAdmin}/file-manager`,
        label: "Quản lý file",
        icon: JournalPage,
    },
    {
        href: `/${pathAdmin}/vehicle`,
        label: "Quản lý mẫu xe",
        icon: DirectionsCarIcon,
    },
    {
        href: `/${pathAdmin}/car-file-management`,
        label: "Quản lý hồ sơ xe",
        icon: BadgeIcon,
    },
    {
        label: "Quản lý phụ tùng",
        icon: BuildIcon,
        children: [
            {
                href: `/${pathAdmin}/vehicle-part-category`,
                label: "Danh mục phụ tùng",
                icon: CategoryIcon,
            },
            {
                href: `/${pathAdmin}/vehicle-part`,
                label: "Phụ tùng xe",
                icon: BuildIcon,
            },
        ],
    },
    {
        href: `/${pathAdmin}/service-type`,
        label: "Loại dịch vụ",
        icon: JournalPage,
    },
]