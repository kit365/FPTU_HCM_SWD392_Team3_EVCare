import React from 'react'
import { Card } from "@mui/material";
import { TrashSolid, Plus } from 'iconoir-react';
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { pathAdmin } from "../../../constants/paths.constant";
import type { ButtonItemProps } from "../../../types/admin/button-item.types";
import { TableAdmin } from "../../../components/admin/ui/Table";
import type { StaffProps } from "../../../types/admin/staff.types";

export const Vehicle = () => {
    
    const buttonsList: ButtonItemProps[] = [
        {
            icon: TrashSolid,
            href: `/${pathAdmin}/vehicle/trash`,
            text: "Thùng rác",
            className: "bg-[#ef4d56] border-[#ef4d56] shadow-[0_1px_2px_0_rgba(239,77,86,0.35)] mr-[0.6rem]",
        },
        {
            icon: Plus,
            href: `/${pathAdmin}/vehicle/create`,
            text: "Tạo mẫu xe",
            className: "bg-[#22c55e] border-[#22c55e] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)]",
        },
    ]

    // Fake data
const staffList: StaffProps[] = [
  { id: "1", name: "VinFast Lux A2.0", email: "", status: "active", lastLogin: "" },
  { id: "2", name: "VinFast Lux SA2.0", email: "", status: "inactive", lastLogin: "" },
  { id: "3", name: "VinFast Fadil", email: "", status: "active", lastLogin: "" },
  { id: "4", name: "VinFast VF e34", email: "", status: "inactive", lastLogin: "" },
  { id: "5", name: "VinFast VF 8", email: "", status: "active", lastLogin: "" },
  { id: "6", name: "VinFast VF 9", email: "", status: "inactive", lastLogin: "" },
  { id: "7", name: "McLaren 570S", email: "", status: "active", lastLogin: "" },
  { id: "8", name: "McLaren 720S", email: "", status: "inactive", lastLogin: "" },
  { id: "9", name: "McLaren GT", email: "", status: "active", lastLogin: "" },
  { id: "10", name: "McLaren Artura", email: "", status: "inactive", lastLogin: "" },
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
        { title: "Tên mẫu xe", width: 15, key: "name" },
        { title: "Trạng thái", width: 15, align: "left", key: "status" },
        // { title: "Lần đăng nhập cuối", width: 15, align: "left", key: "lastLogin" },
        { title: "Hành động", width: 20, align: "center", key: "actions" },
    ];

    return (
        <>
            <div className="max-w-[1320px] px-[12px] mx-auto">
                <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
                    {/* Header */}
                    <CardHeaderAdmin
                        title="Danh sách mẫu xe"
                        buttons={buttonsList}
                    />
                    {/* Content */}
                    <TableAdmin dataList={staffList} columns={columns} />
                </Card >
            </div >
        </>
    )
}

 