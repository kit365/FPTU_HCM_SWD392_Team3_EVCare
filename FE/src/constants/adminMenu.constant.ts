
import { pathAdmin } from "./paths.constant";
import { HomeSimple, JournalPage, Group } from "iconoir-react";
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BadgeIcon from '@mui/icons-material/Badge';

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
        label: "Quản lý loại dịch vụ",
        icon: JournalPage,
        children: [
            {
                href: `/${pathAdmin}/service-types`,
                label: "Danh sách loại dịch vụ",
                icon: JournalPage,
            },
            {
                href: `/${pathAdmin}/service-categories`,
                label: "Danh mục dịch vụ",
                icon: Group,
            },
        ],
    },
]