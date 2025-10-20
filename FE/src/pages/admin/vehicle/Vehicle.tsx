import { Card } from "@mui/material";
import {  Plus } from 'iconoir-react';
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { pathAdmin } from "../../../constants/paths.constant";
import type { ButtonItemProps } from "../../../types/admin/button-item.types";
import { TableAdmin } from "../../../components/admin/ui/Table";
import { useEffect } from "react";
import { useCarModel } from "../../../hooks/useCarModel";

export const Vehicle = () => {

    // const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null); // Dữ liệu mẫu xe được chọn
    // const [mode, setMode] = useState<"edit" | "view" | null>(null); // Chế độ hiện tại (edit/view)


    // const handleEdit = (vehicle: any) => {
    //     setSelectedVehicle(vehicle);
    //     setMode("edit");
    // };

    // const handleView = (vehicle: any) => {
    //     setSelectedVehicle(vehicle);
    //     setMode("view");
    // };


    const {
        vehicleList, 
        fetchVehicleTypeList,
        deleteVehicleType
    } = useCarModel();

    useEffect(() => {
        fetchVehicleTypeList({ page: 0, pageSize: 10, keyword: "" });
    }, []);

    const handleDelete = async (id: string) => {
        const success = await deleteVehicleType(id);
        if (success) {
            // Refresh danh sách sau khi xóa thành công
            fetchVehicleTypeList({ page: 0, pageSize: 10, keyword: "" });
        }
    };


    const buttonsList: ButtonItemProps[] = [
        // {
        //     icon: TrashSolid,
        //     href: `/${pathAdmin}/vehicle/trash`,
        //     text: "Thùng rác",
        //     className: "bg-[#ef4d56] border-[#ef4d56] shadow-[0_1px_2px_0_rgba(239,77,86,0.35)] mr-[0.6rem]",
        // },
        {
            icon: Plus,
            href: `/${pathAdmin}/vehicle/create`,
            text: "Tạo mẫu xe",
            className: "bg-[#22c55e] border-[#22c55e] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)]",
        },

    ]


    interface TableColumn {
        title: string;
        width: number;
        align?: "left" | "center" | "right";
        key?: string;
    }

    const columns: TableColumn[] = [
        { title: "", width: 5, align: "center", key: "checkbox" },
        { title: "STT", width: 8, align: "center", key: "stt" },
        { title: "Tên mẫu xe", width: 20, align: "left", key: "vehicleTypeName" },
        { title: "Hãng sản xuất", width: 15, align: "left", key: "manufacturer" },
        { title: "Năm sản xuất", width: 10, align: "center", key: "modelYear" },
        { title: "Dung lượng pin (kWh)", width: 15, align: "center", key: "batteryCapacity" },
        { title: "Bảo dưỡng (km)", width: 15, align: "center", key: "maintenanceIntervalKm" },
        { title: "Bảo dưỡng (tháng)", width: 15, align: "center", key: "maintenanceIntervalMonths" },
        // { title: "Mô tả", width: 30, align: "left", key: "description" },
        { title: "Hành động", width: 15, align: "center", key: "actions" },
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
                    <TableAdmin
                        dataList={vehicleList}
                        columns={columns}
                        getEditUrl={(item) => `/admin/vehicle/edit/${item.vehicleTypeId || item.id}`}
                        getViewUrl={(item) => `/admin/vehicle/view/${item.vehicleTypeId || item.id}`}
                        onDelete={handleDelete}
                    />
                </Card >
            </div >
        </>
    )
}

