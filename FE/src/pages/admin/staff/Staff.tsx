import { Card } from "@mui/material";
import { TrashSolid, Plus } from 'iconoir-react';
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { pathAdmin } from "../../../constants/paths.constant";
import type { ButtonItemProps } from "../../../types/admin/button-item.types";
import { TableAdmin } from "../../../components/admin/ui/Table";
// import type { StaffProps } from "../../../types/admin/staff.types";

export const StaffPage = () => {
    const buttonsList: ButtonItemProps[] = [
        {
            icon: TrashSolid,
            href: `/${pathAdmin}/staff/trash`,
            text: "Thùng rác",
            className: "bg-[#ef4d56] border-[#ef4d56] shadow-[0_1px_2px_0_rgba(239,77,86,0.35)] mr-[0.6rem]",
        },
        {
            icon: Plus,
            href: `/${pathAdmin}/staff/create`,
            text: "Tạo tài khoản",
            className: "bg-[#22c55e] border-[#22c55e] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)]",
        },
    ]

    // Fake data
    interface StaffProps {
        userId: string;
        name: string;
        email: string;
        status: string;
        lastLogin: string;
    }

    const staffList: StaffProps[] = [
        {
            userId: "1",
            name: "Nguyễn Văn A",
            email: "nguyenvana@evcare.com",
            status: "Hoạt động",
            lastLogin: "2025-10-26 10:30:00",
        },
        {
            userId: "2",
            name: "Trần Thị B",
            email: "tranthib@evcare.com",
            status: "Hoạt động",
            lastLogin: "2025-10-26 09:15:00",
        },
        {
            userId: "3",
            name: "Lê Văn C",
            email: "levanc@evcare.com",
            status: "Không hoạt động",
            lastLogin: "2025-10-20 14:20:00",
        },
    ];

    interface TableColumn {
        title: string;
        width: number;
        align?: "left" | "center" | "right";
        key?: string;
    }

    const columns: TableColumn[] = [
        { title: "", width: 5, align: "center", key: "checkbox" },
        { title: "STT", width: 10, align: "left", key: "stt" },
        { title: "Họ và tên", width: 15, key: "name" },
        { title: "Email", width: 20, key: "email" },
        { title: "Trạng thái", width: 15, align: "left", key: "status" },
        { title: "Lần đăng nhập cuối", width: 15, align: "left", key: "lastLogin" },
        { title: "Hành động", width: 20, align: "center", key: "actions" },
    ];

    return (
        <>
            <div className="max-w-[1320px] px-[12px] mx-auto">
                <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
                    {/* Header */}
                    <CardHeaderAdmin
                        title="Danh sách nhân viên"
                        buttons={buttonsList}
                    />
                    {/* Content */}
                    <TableAdmin dataList={staffList} columns={columns} />
                </Card >
            </div >
        </>
    )
}