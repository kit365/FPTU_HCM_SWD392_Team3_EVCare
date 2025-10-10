import { pathAdmin } from "./paths.constant";
import { HomeSimple, JournalPage, Group } from "iconoir-react";
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

export interface AdminMenuItem {
    href: string
    label: string
    icon: React.ElementType
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
]