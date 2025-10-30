import { Card } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import type { ButtonItemProps } from "../../../types/admin/button-item.types";
import { pathAdmin } from "../../../constants/paths.constant";
import { Plus } from "iconoir-react";
import { TableAdmin } from "../../../components/admin/ui/Table";
import { useVehicleProfile } from "../../../hooks/useVehicleProfile";
import { useCallback, useEffect, useState } from "react";
import { FormSearch } from "../../../components/admin/ui/FormSearch";

const CarFileManagement = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 10;
    const [keyword, setKeyword] = useState<string>("");

    const { search: searchVehicles, list: vehicleList, totalPages, loading } = useVehicleProfile();

    const buttonsList: ButtonItemProps[] = [
        {
            icon: Plus,
            href: `/${pathAdmin}/car-file-create`,
            text: "Tạo hồ sơ xe",
            className: "bg-[#22c55e] border-[#22c55e] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)]",
        },
    ]

    const loadVehicles = useCallback(() => {
        searchVehicles({
            page: currentPage - 1,
            size: pageSize,
            keyword: keyword || undefined,
        });
    }, [currentPage, pageSize, keyword, searchVehicles]);

    useEffect(() => {
        loadVehicles();
    }, [loadVehicles]);

    const handleSearch = useCallback((value: string) => {
        setKeyword(value);
        setCurrentPage(1);
    }, []);


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
        { title: "Tên khách hàng", width: 15, align: "left", key: "user.fullName" },
        { title: "Email", width: 20, align: "left", key: "user.email" },
        { title: "Tên xe", width: 10, align: "left", key: "vehicleType.vehicleTypeName" },
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
                    
                    <div className="px-[2.4rem] pb-[2.4rem] h-full">
                        <FormSearch onSearch={handleSearch} />
                        
                        {/* Content */}
                        <TableAdmin
                            dataList={vehicleList}
                            columns={columns}
                            getEditUrl={(item) => `/${pathAdmin}/car-file-edit/${item.vehicleId}`}
                            getViewUrl={(item) => `/${pathAdmin}/car-file-view/${item.vehicleId}`}
                            loading={loading}
                            pagination={{
                                current: currentPage,
                                total: totalPages * pageSize,
                                pageSize: pageSize,
                                onChange: (page) => setCurrentPage(page),
                            }}
                        />
                    </div>
                </Card >
            </div >
        </>
    )
}

export default CarFileManagement