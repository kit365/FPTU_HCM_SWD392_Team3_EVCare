import { Card } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import type { ButtonItemProps } from "../../../types/admin/button-item.types";
import { pathAdmin } from "../../../constants/paths.constant";
import { Plus } from "iconoir-react";
import { TableAdmin } from "../../../components/admin/ui/Table";

const CarFileManagement = () => {
    const buttonsList: ButtonItemProps[] = [
        {
            icon: Plus,
            href: `/${pathAdmin}/car-file-create`,
            text: "Tạo hồ sơ xe",
            className: "bg-[#22c55e] border-[#22c55e] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)]",
        },
    ]

    interface CarFileProps {
        vehicleId: string;
        username: string;
        email: string;
        vehicleTypeName: string;
        plateNumber: string;
        lastMaintenanceDate: string; // có thể là Date nếu bạn xử lý ngày
    }
    //fake data
    const carFileList: CarFileProps[] = [
    {
        vehicleId: "VH001",
        username: "Nguyen Van A",
        email: "nguyenvana@gmail.com",
        vehicleTypeName: "Toyota Vios",
        plateNumber: "51A-123.45",
        lastMaintenanceDate: "2025-09-20",
    },
    {
        vehicleId: "VH002",
        username: "Tran Thi B",
        email: "tranthib@example.com",
        vehicleTypeName: "Honda Civic",
        plateNumber: "60B-678.90",
        lastMaintenanceDate: "2025-10-05",
    },
    {
        vehicleId: "VH003",
        username: "Le Van C",
        email: "levanc@example.com",
        vehicleTypeName: "Hyundai Accent",
        plateNumber: "30F-456.78",
        lastMaintenanceDate: "2025-08-15",
    },
    {
        vehicleId: "VH004",
        username: "Pham Thi D",
        email: "phamthid@example.com",
        vehicleTypeName: "Kia Morning",
        plateNumber: "29A-987.65",
        lastMaintenanceDate: "2025-07-10",
    },
    {
        vehicleId: "VH005",
        username: "Hoang Van E",
        email: "hoangvane@example.com",
        vehicleTypeName: "Mazda 3",
        plateNumber: "51G-321.00",
        lastMaintenanceDate: "2025-06-25",
    },
    {
        vehicleId: "VH006",
        username: "Nguyen Thi F",
        email: "nguyenthif@example.com",
        vehicleTypeName: "Ford Ranger",
        plateNumber: "65C-112.34",
        lastMaintenanceDate: "2025-05-30",
    },
    {
        vehicleId: "VH007",
        username: "Tran Van G",
        email: "tranvang@example.com",
        vehicleTypeName: "Chevrolet Spark",
        plateNumber: "43A-556.78",
        lastMaintenanceDate: "2025-04-18",
    },
    {
        vehicleId: "VH008",
        username: "Do Thi H",
        email: "dothih@example.com",
        vehicleTypeName: "VinFast Fadil",
        plateNumber: "88B-999.88",
        lastMaintenanceDate: "2025-03-12",
    },
    {
        vehicleId: "VH009",
        username: "Bui Van I",
        email: "buivani@example.com",
        vehicleTypeName: "Mitsubishi Xpander",
        plateNumber: "36A-444.22",
        lastMaintenanceDate: "2025-02-05",
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
        { title: "Số thứ tự", width: 8, align: "left", key: "stt" },
        { title: "Id xe", width: 8, align: "left", key: "vehicleId" },
        { title: "Tên khách hàng", width: 15, align: "left", key: "username" },
        { title: "Email", width: 20, align: "left", key: "email" },
        { title: "Tên xe", width: 10, align: "left", key: "vehicleTypeName" },
        { title: "Biển số xe", width: 10, align: "left", key: "plateNumber" },
        { title: "Ngày bảo trì gần nhất", width: 15, align: "left", key: "lastMaintenanceDate" },
        { title: "Hành động", width: 20, align: "center", key: "actions" },
    ];



    return (
        <>
            <div className="max-w-[1320px] px-[12px] mx-auto">
                <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
                    {/* Header */}
                    <CardHeaderAdmin
                        title="Danh sách hồ sơ xe người dùng"
                        buttons={buttonsList}
                    />
                    {/* Content */}
                    <TableAdmin
                        dataList={carFileList}
                        columns={columns}
                        getEditUrl={(item) => `/${pathAdmin}/car-file-edit/${item.vehicleId}`}
                        getViewUrl={(item) => `/${pathAdmin}/car-file-view/${item.vehicleId}`}
                    />
                </Card >
            </div >
        </>
    )
}

export default CarFileManagement