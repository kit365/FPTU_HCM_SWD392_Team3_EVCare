import { Card } from "@mui/material";
import { TrashSolid, Plus } from 'iconoir-react';
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { pathAdmin } from "../../../constants/paths.constant";
import type { ButtonItemProps } from "../../../types/admin/button-item.types";
import { TableAdmin } from "../../../components/admin/ui/Table";
import type { StaffProps } from "../../../types/admin/staff.types";

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
    const staffList: StaffProps[] = [
        { userId: "1", name: "Nguyễn Văn A", email: "a.nguyen@example.com", status: "active", lastLogin: "2025-09-18 10:23" },
        { userId: "2", name: "Trần Thị B", email: "b.tran@example.com", status: "inactive", lastLogin: "2025-09-17 15:42" },
        { userId: "3", name: "Lê Văn C", email: "c.le@example.com", status: "active", lastLogin: "2025-09-18 08:11" },
        { userId: "4", name: "Phạm Thị D", email: "d.pham@example.com", status: "inactive", lastLogin: "2025-09-16 14:05" },
        { userId: "5", name: "Hoàng Văn E", email: "e.hoang@example.com", status: "active", lastLogin: "2025-09-15 09:12" },
        { id: "6", name: "Đặng Thị F", email: "f.dang@example.com", status: "inactive", lastLogin: "2025-09-14 18:27" },
        { id: "7", name: "Bùi Văn G", email: "g.bui@example.com", status: "active", lastLogin: "2025-09-13 11:34" },
        { id: "8", name: "Ngô Thị H", email: "h.ngo@example.com", status: "active", lastLogin: "2025-09-12 16:50" },
        { id: "9", name: "Đỗ Văn I", email: "i.do@example.com", status: "inactive", lastLogin: "2025-09-11 20:10" },
        { id: "10", name: "Vũ Thị J", email: "j.vu@example.com", status: "active", lastLogin: "2025-09-10 07:55" },
        { id: "11", name: "Mai Văn K", email: "k.mai@example.com", status: "inactive", lastLogin: "2025-09-09 22:15" },
        { id: "12", name: "Trương Thị L", email: "l.truong@example.com", status: "active", lastLogin: "2025-09-08 13:05" },
        { id: "13", name: "Nguyễn Văn M", email: "m.nguyen@example.com", status: "inactive", lastLogin: "2025-09-07 17:40" },
        { id: "14", name: "Trần Thị N", email: "n.tran@example.com", status: "active", lastLogin: "2025-09-06 19:25" },
        { id: "15", name: "Lê Văn O", email: "o.le@example.com", status: "inactive", lastLogin: "2025-09-05 08:30" },
        { id: "16", name: "Phạm Thị P", email: "p.pham@example.com", status: "active", lastLogin: "2025-09-04 14:45" },
        { id: "17", name: "Hoàng Văn Q", email: "q.hoang@example.com", status: "inactive", lastLogin: "2025-09-03 12:20" },
        { id: "18", name: "Đặng Thị R", email: "r.dang@example.com", status: "active", lastLogin: "2025-09-02 09:10" },
        { id: "19", name: "Bùi Văn S", email: "s.bui@example.com", status: "inactive", lastLogin: "2025-09-01 21:55" },
        { id: "20", name: "Ngô Thị T", email: "t.ngo@example.com", status: "active", lastLogin: "2025-08-31 07:40" },
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